import { readApiUrl } from "../../lib/apiConfig";
import { withTimeout } from "../auth/authService";

export type ProductPreview = {
  name: string;
  priceCents: number;
  currency: string;
  sourceUrl: string;
  images: string[];
};

const REQUEST_TIMEOUT_MS = 10_000;

export async function requestProductPreview(url: string): Promise<ProductPreview> {
  const response = await withTimeout(
    fetch(`${readApiUrl()}/product-previews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }),
    REQUEST_TIMEOUT_MS,
    "Product preview timed out.",
  );
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error(readApiError(payload) ?? "We could not preview this product.");
  }
  if (!isProductPreview(payload)) {
    throw new Error("The product preview response was invalid.");
  }
  return payload;
}

function isProductPreview(value: unknown): value is ProductPreview {
  if (typeof value !== "object" || value === null) return false;
  const preview = value as Record<string, unknown>;
  return (
    typeof preview.name === "string" &&
    typeof preview.priceCents === "number" &&
    typeof preview.currency === "string" &&
    typeof preview.sourceUrl === "string" &&
    Array.isArray(preview.images) &&
    preview.images.every((image) => typeof image === "string")
  );
}

function readApiError(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const error = (value as { error?: unknown }).error;
  if (typeof error !== "object" || error === null) return undefined;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}
