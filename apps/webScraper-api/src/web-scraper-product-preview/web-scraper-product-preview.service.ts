import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_HTML_BYTES = 1_000_000;
const FETCH_TIMEOUT_MS = 5_000;
const MAX_REDIRECTS = 5;

export type WebScraperProductPreview = {
  name: string;
  priceCents: number;
  currency: string;
  sourceUrl: string;
  images: string[];
};

export type WebScraperProductPreviewErrorCode =
  | "INVALID_URL"
  | "UNSAFE_URL"
  | "FETCH_FAILED"
  | "UNSUPPORTED_PAGE"
  | "PRODUCT_NOT_FOUND";

export class WebScraperProductPreviewError extends Error {
  constructor(readonly code: WebScraperProductPreviewErrorCode) {
    super(code);
  }
}

type Fetcher = (url: URL) => Promise<Response>;
type UrlValidator = (url: string) => Promise<URL>;

export class WebScraperProductPreviewService {
  constructor(
    private readonly fetcher: Fetcher = fetchProductPage,
    private readonly validateUrl: UrlValidator = assertPublicHttpsUrl,
  ) {}

  async preview(rawUrl: string): Promise<WebScraperProductPreview> {
    let url = await this.validateUrl(rawUrl);
    let response: Response;

    for (let redirectCount = 0; ; redirectCount += 1) {
      response = await this.fetcher(url);
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      if (redirectCount >= MAX_REDIRECTS) {
        throw new WebScraperProductPreviewError("FETCH_FAILED");
      }

      const location = response.headers.get("location");
      if (!location) throw new WebScraperProductPreviewError("FETCH_FAILED");
      url = await this.validateUrl(new URL(location, url).toString());
    }

    if (!response.ok) {
      throw new WebScraperProductPreviewError("FETCH_FAILED");
    }

    if (!response.headers.get("content-type")?.includes("text/html")) {
      throw new WebScraperProductPreviewError("UNSUPPORTED_PAGE");
    }

    const html = await readHtml(response);
    if (isChallengePage(html)) {
      throw new WebScraperProductPreviewError("UNSUPPORTED_PAGE");
    }

    const product = findProduct(html, url);
    if (!product) {
      throw new WebScraperProductPreviewError("PRODUCT_NOT_FOUND");
    }

    return {
      name: product.name,
      priceCents: product.priceCents,
      currency: product.currency,
      sourceUrl: url.toString(),
      images: product.images,
    };
  }
}

async function assertPublicHttpsUrl(rawUrl: string): Promise<URL> {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new WebScraperProductPreviewError("INVALID_URL");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !url.hostname
  ) {
    throw new WebScraperProductPreviewError("INVALID_URL");
  }

  if (isIP(url.hostname)) {
    if (!isPublicIpAddress(url.hostname)) {
      throw new WebScraperProductPreviewError("UNSAFE_URL");
    }
    return url;
  }

  let addresses: Awaited<ReturnType<typeof lookup>>[];
  try {
    addresses = await lookup(url.hostname, { all: true });
  } catch {
    throw new WebScraperProductPreviewError("INVALID_URL");
  }

  if (
    !addresses.length ||
    addresses.some(({ address }) => !isPublicIpAddress(address))
  ) {
    throw new WebScraperProductPreviewError("UNSAFE_URL");
  }

  return url;
}

async function fetchProductPage(url: URL): Promise<Response> {
  try {
    return await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    throw new WebScraperProductPreviewError("FETCH_FAILED");
  }
}

async function readHtml(response: Response): Promise<string> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_HTML_BYTES) {
    throw new WebScraperProductPreviewError("UNSUPPORTED_PAGE");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new WebScraperProductPreviewError("UNSUPPORTED_PAGE");
  }

  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new WebScraperProductPreviewError("UNSUPPORTED_PAGE");
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

function findProduct(
  html: string,
  baseUrl: URL,
): WebScraperProductPreview | undefined {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const script of scripts) {
    const data = parseJson(script[1]);
    for (const item of flattenJsonLd(data)) {
      const product = toProductPreview(item, baseUrl);
      if (product) {
        return product.images.length > 0
          ? product
          : { ...product, images: findMetadataImages(html, baseUrl) };
      }
    }
  }

  const embeddedProduct = findEmbeddedProduct(html, baseUrl);
  if (embeddedProduct) return embeddedProduct;

  const metadataProduct = findMetadataProduct(html);
  if (metadataProduct) {
    return { ...metadataProduct, images: findMetadataImages(html, baseUrl) };
  }

  const microdataProduct = findMicrodataProduct(html);
  return microdataProduct
    ? { ...microdataProduct, images: findMetadataImages(html, baseUrl) }
    : undefined;
}

function findEmbeddedProduct(
  html: string,
  baseUrl: URL,
): WebScraperProductPreview | undefined {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const script of scripts) {
    const data = parseJson(script[1]);
    for (const item of flattenJson(data)) {
      const product = toEmbeddedProduct(item, baseUrl);
      if (product) {
        return product.images.length > 0
          ? product
          : { ...product, images: findMetadataImages(html, baseUrl) };
      }
    }
  }
}

function* flattenJson(data: unknown): Generator<Record<string, unknown>> {
  if (Array.isArray(data)) {
    for (const item of data) yield* flattenJson(item);
    return;
  }
  if (!isRecord(data)) return;

  yield data;
  for (const value of Object.values(data)) yield* flattenJson(value);
}

function toEmbeddedProduct(
  item: Record<string, unknown>,
  baseUrl: URL,
): WebScraperProductPreview | undefined {
  const name = item.item_name ?? item.productName ?? item.name;
  if (typeof name !== "string" || name.trim().length === 0) return;

  const priceCents = parsePriceCents(item.price ?? item.currentPrice);
  if (priceCents === undefined) return;

  const currency = item.currency ?? item.priceCurrency ?? "USD";
  if (typeof currency !== "string" || currency.trim().length === 0) return;

  return {
    name: decodeHtml(name).trim(),
    priceCents,
    currency: currency.toUpperCase(),
    sourceUrl: "",
    images: extractImages(
      item.image ?? item.imageUrl ?? item.productImage ?? item.thumbnailUrl,
      baseUrl,
    ),
  };
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
  baseUrl: URL,
): WebScraperProductPreview | undefined {
  const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
  if (!types.includes("Product") || typeof item.name !== "string") return;

  const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
  for (const offer of offers) {
    if (!isRecord(offer)) continue;
    for (const candidate of flattenJson(offer)) {
      const currency = candidate.priceCurrency ?? offer.priceCurrency;
      if (typeof currency !== "string") continue;
      const priceCents = parsePriceCents(
        candidate.price ?? candidate.lowPrice ?? candidate.highPrice,
      );
      if (priceCents === undefined) continue;

      return {
        name: decodeHtml(item.name).trim(),
        priceCents,
        currency: currency.toUpperCase(),
        sourceUrl: "",
        images: extractImages(item.image, baseUrl),
      };
    }
  }
}

function parsePriceCents(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return;
  const normalized = String(value)
    .trim()
    .replace(/[,\s]/g, "")
    .replace(/^(?:[A-Z]{3})?\$?/, "")
    .replace(/(?:[A-Z]{3})$/, "");
  const match = normalized.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return;

  const dollars = Number(match[1]);
  const cents = Number((match[2] ?? "").padEnd(2, "0"));
  const total = dollars * 100 + cents;
  return Number.isSafeInteger(total) ? total : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function findMetadataProduct(
  html: string,
): WebScraperProductPreview | undefined {
  const metadata = new Map<string, string>();
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(tag[0]);
    const key = attributes.property ?? attributes.name ?? attributes.itemprop;
    const value = attributes.content;
    if (key && value) metadata.set(key.toLowerCase(), decodeHtml(value));
  }

  const name =
    metadata.get("product:name") ??
    metadata.get("og:title") ??
    metadata.get("twitter:title") ??
    metadata.get("title") ??
    metadata.get("name") ??
    html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const price =
    metadata.get("product:price:amount") ??
    metadata.get("og:price:amount") ??
    metadata.get("price") ??
    metadata.get("priceamount");
  const currency =
    metadata.get("product:price:currency") ??
    metadata.get("og:price:currency") ??
    metadata.get("pricecurrency") ??
    metadata.get("currency") ??
    "USD";

  const priceCents = parsePriceCents(price);
  if (!name?.trim() || priceCents === undefined || !currency.trim()) return;

  return {
    name: name.trim(),
    priceCents,
    currency: currency.trim().toUpperCase(),
    sourceUrl: "",
    images: [],
  };
}

function findMicrodataProduct(
  html: string,
): WebScraperProductPreview | undefined {
  const values = new Map<string, string>();
  const pattern =
    /<([a-z][\w-]*)\b([^>]*\bitemprop\s*=\s*["']([^"']+)["'][^>]*)>([\s\S]*?)<\/\1>/gi;

  for (const match of html.matchAll(pattern)) {
    const attributes = parseAttributes(match[2]);
    const value = attributes.content ?? attributes.value ?? stripTags(match[4]);
    if (value.trim()) {
      values.set(match[3].toLowerCase(), decodeHtml(value.trim()));
    }
  }

  const name = values.get("name");
  const priceCents = parsePriceCents(values.get("price"));
  const currency = values.get("pricecurrency") ?? "USD";
  if (!name || priceCents === undefined || !currency.trim()) return;

  return {
    name,
    priceCents,
    currency: currency.trim().toUpperCase(),
    sourceUrl: "",
    images: [],
  };
}

function findMetadataImages(html: string, baseUrl: URL): string[] {
  const images: string[] = [];
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(tag[0]);
    const key = (attributes.property ?? attributes.name ?? "").toLowerCase();
    if (!/(?:^|:)image(?::url)?$/.test(key) || !attributes.content) continue;
    images.push(...extractImages(attributes.content, baseUrl));
  }
  return unique(images);
}

function extractImages(value: unknown, baseUrl: URL): string[] {
  const values = Array.isArray(value) ? value : [value];
  const images: string[] = [];

  for (const item of values) {
    if (typeof item === "string") {
      const imageUrl = resolveImageUrl(item, baseUrl);
      if (imageUrl) images.push(imageUrl);
      continue;
    }

    if (isRecord(item)) {
      images.push(
        ...extractImages(item.url ?? item.contentUrl ?? item.image, baseUrl),
      );
    }
  }

  return unique(images);
}

function resolveImageUrl(value: string, baseUrl: URL): string | undefined {
  try {
    const url = new URL(value.trim(), baseUrl);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const match of tag.matchAll(
    /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g,
  )) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4];
  }
  return attributes;
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

function isChallengePage(html: string): boolean {
  return /pardon our interruption|we think you were a bot|verify you are human|attention required/i.test(
    html,
  );
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
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
