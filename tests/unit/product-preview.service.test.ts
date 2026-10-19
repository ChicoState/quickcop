import { describe, expect, it } from "@jest/globals";

import {
  ProductPreviewError,
  ProductPreviewService,
} from "../../apps/api/src/product-preview/product-preview.service";

describe("ProductPreviewService", () => {
  it("returns a product name and current price from JSON-LD metadata", async () => {
    const service = createService(async () => productPageResponse());

    await expect(
      service.preview("https://store.example/products/widget"),
    ).resolves.toEqual({
      name: "Widget",
      priceCents: 2499,
      currency: "USD",
      sourceUrl: "https://store.example/products/widget",
    });
  });

  it("rejects a non-HTTPS link before fetching it", async () => {
    const service = new ProductPreviewService(async () =>
      productPageResponse(),
    );

    await expect(
      service.preview("http://store.example/products/widget"),
    ).rejects.toMatchObject({
      code: "INVALID_URL",
    } satisfies Partial<ProductPreviewError>);
  });

  it("returns PRODUCT_NOT_FOUND when product metadata has no price", async () => {
    const service = createService(async () =>
      htmlResponse(`
      <script type="application/ld+json">
        { "@type": "Product", "name": "Widget" }
      </script>
    `),
    );

    await expect(
      service.preview("https://store.example/products/widget"),
    ).rejects.toMatchObject({
      code: "PRODUCT_NOT_FOUND",
    } satisfies Partial<ProductPreviewError>);
  });

  it("finds a product nested inside a JSON-LD product group", async () => {
    const service = createService(async () =>
      htmlResponse(`
      <script type="application/ld+json">
        {
          "@type": "ProductGroup",
          "hasVariant": [{
            "@type": "Product",
            "name": "Jaxon Smith-Njigba Seattle Seahawks Men's Nike NFL Game Jersey",
            "offers": { "price": 150, "priceCurrency": "USD" }
          }]
        }
      </script>
    `),
    );

    await expect(
      service.preview("https://www.nike.com/t/jersey"),
    ).resolves.toMatchObject({
      name: "Jaxon Smith-Njigba Seattle Seahawks Men's Nike NFL Game Jersey",
      priceCents: 15000,
      currency: "USD",
    });
  });
});

function productPageResponse(): Response {
  return htmlResponse(`
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Widget",
        "offers": { "@type": "Offer", "price": "24.99", "priceCurrency": "USD" }
      }
    </script>
  `);
}

function createService(
  fetcher: (url: URL) => Promise<Response>,
): ProductPreviewService {
  return new ProductPreviewService(fetcher, async (url) => new URL(url));
}

function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
