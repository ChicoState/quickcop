import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

type ProductPreview = {
  name: string;
  priceCents: number;
  currency: string;
  sourceUrl: string;
};

type ApiError = {
  error?: {
    message?: unknown;
  };
};

export async function requestProductPreview(
  url: string,
  apiUrl = "http://localhost:3000",
  fetcher: typeof fetch = fetch,
): Promise<ProductPreview> {
  const response = await fetcher(
    `${apiUrl.replace(/\/$/, "")}/product-previews`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    },
  );
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = isApiError(payload) ? payload.error?.message : undefined;
    throw new Error(
      typeof message === "string"
        ? message
        : "The API could not preview this product.",
    );
  }

  if (!isProductPreview(payload)) {
    throw new Error("The API returned an unexpected response.");
  }

  return payload;
}

async function main(): Promise<void> {
  const prompt = createInterface({ input: stdin, output: stdout });

  try {
    const url = (await prompt.question("Product URL: ")).trim();
    if (!url) {
      throw new Error("A product URL is required.");
    }

    const preview = await requestProductPreview(url);
    console.log(`\nName: ${preview.name}`);
    console.log(`Price: ${formatPrice(preview.priceCents, preview.currency)}`);
    console.log(`Source: ${preview.sourceUrl}`);
  } catch (error) {
    console.error(
      error instanceof Error
        ? `\nError: ${error.message}`
        : "\nError: Preview failed.",
    );
    process.exitCode = 1;
  } finally {
    prompt.close();
  }
}

function isProductPreview(value: unknown): value is ProductPreview {
  if (typeof value !== "object" || value === null) return false;
  const preview = value as Record<string, unknown>;
  return (
    typeof preview.name === "string" &&
    typeof preview.priceCents === "number" &&
    typeof preview.currency === "string" &&
    typeof preview.sourceUrl === "string"
  );
}

function isApiError(value: unknown): value is ApiError {
  return typeof value === "object" && value !== null && "error" in value;
}

function formatPrice(priceCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(priceCents / 100);
  } catch {
    return `${currency} ${(priceCents / 100).toFixed(2)}`;
  }
}

if (require.main === module) {
  void main();
}
