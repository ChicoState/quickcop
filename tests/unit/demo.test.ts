import { describe, expect, it, jest } from "@jest/globals";

import {
  formatImageUrls,
  requestProductPreview,
} from "../../apps/api/src/demo";

describe("requestProductPreview", () => {
  it("submits a product URL and returns the API preview", async () => {
    const fetcher = jest.fn(
      async () =>
        new Response(
          JSON.stringify({
            name: "Widget",
            priceCents: 2499,
            currency: "USD",
            sourceUrl: "https://store.example/products/widget",
            images: [],
          }),
          { status: 200 },
        ),
    );

    await expect(
      requestProductPreview(
        "https://store.example/products/widget",
        "http://localhost:3000",
        fetcher,
      ),
    ).resolves.toMatchObject({ name: "Widget", priceCents: 2499 });

    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:3000/product-previews",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: "https://store.example/products/widget" }),
      },
    );
  });

  it("shows the API error message when a preview cannot be created", async () => {
    await expect(
      requestProductPreview(
        "https://store.example/products/missing",
        "http://localhost:3000",
        async () =>
          new Response(
            JSON.stringify({
              error: {
                code: "PRODUCT_NOT_FOUND",
                message: "Product name or price was not found.",
              },
            }),
            { status: 422 },
          ),
      ),
    ).rejects.toThrow("Product name or price was not found.");
  });

  it("formats returned product image URLs for the terminal demo", () => {
    expect(
      formatImageUrls([
        "https://cdn.example/widget-front.jpg",
        "https://cdn.example/widget-side.jpg",
      ]),
    ).toBe(
      "Images:\n- https://cdn.example/widget-front.jpg\n- https://cdn.example/widget-side.jpg",
    );
  });

  it("reports when a product has no image URLs", () => {
    expect(formatImageUrls([])).toBe("Images: none");
  });
});
