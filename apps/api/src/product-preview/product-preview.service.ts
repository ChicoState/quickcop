import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_HTML_BYTES = 1_000_000;
const FETCH_TIMEOUT_MS = 5_000;

export type ProductPreview = {
  name: string;
  priceCents: number;
  currency: string;
  sourceUrl: string;
};

export type ProductPreviewErrorCode =
  | "INVALID_URL"
  | "UNSAFE_URL"
  | "FETCH_FAILED"
  | "UNSUPPORTED_PAGE"
  | "PRODUCT_NOT_FOUND";

export class ProductPreviewError extends Error {
  constructor(readonly code: ProductPreviewErrorCode) {
    super(code);
  }
}

type Fetcher = (url: URL) => Promise<Response>;
type UrlValidator = (url: string) => Promise<URL>;

export class ProductPreviewService {
  constructor(
    private readonly fetcher: Fetcher = fetchProductPage,
    private readonly validateUrl: UrlValidator = assertPublicHttpsUrl,
  ) {}

  async preview(rawUrl: string): Promise<ProductPreview> {
    const url = await this.validateUrl(rawUrl);
    const response = await this.fetcher(url);

    if (!response.ok) {
      throw new ProductPreviewError("FETCH_FAILED");
    }

    if (!response.headers.get("content-type")?.includes("text/html")) {
      throw new ProductPreviewError("UNSUPPORTED_PAGE");
    }

    const product = findProduct(await readHtml(response));
    if (!product) {
      throw new ProductPreviewError("PRODUCT_NOT_FOUND");
    }

    return {
      name: product.name,
      priceCents: product.priceCents,
      currency: product.currency,
      sourceUrl: url.toString(),
    };
  }
}

async function assertPublicHttpsUrl(rawUrl: string): Promise<URL> {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new ProductPreviewError("INVALID_URL");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !url.hostname
  ) {
    throw new ProductPreviewError("INVALID_URL");
  }

  if (isIP(url.hostname)) {
    if (!isPublicIpAddress(url.hostname)) {
      throw new ProductPreviewError("UNSAFE_URL");
    }
    return url;
  }

  let addresses: Awaited<ReturnType<typeof lookup>>[];
  try {
    addresses = await lookup(url.hostname, { all: true });
  } catch {
    throw new ProductPreviewError("INVALID_URL");
  }

  if (
    !addresses.length ||
    addresses.some(({ address }) => !isPublicIpAddress(address))
  ) {
    throw new ProductPreviewError("UNSAFE_URL");
  }

  return url;
}

async function fetchProductPage(url: URL): Promise<Response> {
  try {
    return await fetch(url, {
      headers: { accept: "text/html", "user-agent": "QuickCop/1.0" },
      redirect: "error",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    throw new ProductPreviewError("FETCH_FAILED");
  }
}

async function readHtml(response: Response): Promise<string> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_HTML_BYTES) {
    throw new ProductPreviewError("UNSUPPORTED_PAGE");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new ProductPreviewError("UNSUPPORTED_PAGE");
  }

  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new ProductPreviewError("UNSUPPORTED_PAGE");
    }
    chunks.push(value);
  }

  const html = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    html.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(html);
}

function findProduct(html: string): ProductPreview | undefined {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const script of scripts) {
    const data = parseJson(script[1]);
    for (const item of flattenJsonLd(data)) {
      const product = toProductPreview(item);
      if (product) return product;
    }
  }
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value.trim());
  } catch {
    return undefined;
  }
}

function* flattenJsonLd(data: unknown): Generator<Record<string, unknown>> {
  if (Array.isArray(data)) {
    for (const item of data) yield* flattenJsonLd(item);
    return;
  }
  if (!isRecord(data)) return;

  yield data;
  for (const value of Object.values(data)) {
    yield* flattenJsonLd(value);
  }
}

function toProductPreview(
  item: Record<string, unknown>,
): ProductPreview | undefined {
  const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
  if (!types.includes("Product") || typeof item.name !== "string") return;

  const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
  for (const offer of offers) {
    if (!isRecord(offer) || typeof offer.priceCurrency !== "string") continue;
    const priceCents = parsePriceCents(offer.price);
    if (priceCents === undefined) continue;

    return {
      name: item.name.trim(),
      priceCents,
      currency: offer.priceCurrency.toUpperCase(),
      sourceUrl: "",
    };
  }
}

function parsePriceCents(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return;
  const match = String(value).match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return;

  const dollars = Number(match[1]);
  const cents = Number((match[2] ?? "").padEnd(2, "0"));
  const total = dollars * 100 + cents;
  return Number.isSafeInteger(total) ? total : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPublicIpAddress(address: string): boolean {
  if (
    address === "::1" ||
    address === "::" ||
    address.startsWith("fc") ||
    address.startsWith("fd")
  ) {
    return false;
  }

  if (address.includes(":")) return !address.startsWith("fe80:");

  const [first = 0, second = 0] = address.split(".").map(Number);
  return !(
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}
