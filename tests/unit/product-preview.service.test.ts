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
      images: ["https://store.example/images/widget.jpg"],
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
        { "@type": "Product", "name": "Widget", "image": "/images/widget.jpg" }
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
            "name": "Example Team Performance Jersey",
            "image": "/images/jersey.jpg",
            "offers": { "price": 150, "priceCurrency": "USD" }
          }]
        }
      </script>
    `),
    );

    await expect(
      service.preview("https://store.example/products/jersey"),
    ).resolves.toMatchObject({
      name: "Example Team Performance Jersey",
      priceCents: 15000,
      currency: "USD",
      images: ["https://store.example/images/jersey.jpg"],
    });
  });

  it("reads embedded product data from a product page's JSON payload", async () => {
    const service = createService(async () =>
      htmlResponse(`
        <script type="application/json">
          [{
            "item_id": "WIDGET-123",
            "item_name": "Example Performance Widget",
            "price": "628.95",
            "currency": "USD",
            "image": "https://cdn.example/widget.jpg"
          }]
        </script>
      `),
    );

    await expect(
      service.preview("https://store.example/parts/widget-123"),
    ).resolves.toEqual({
      name: "Example Performance Widget",
      priceCents: 62895,
      currency: "USD",
      sourceUrl: "https://store.example/parts/widget-123",
      images: ["https://cdn.example/widget.jpg"],
    });
  });

  it("reads standard product metadata when JSON-LD is unavailable", async () => {
    const service = createService(async () =>
      htmlResponse(`
        <html>
          <head>
            <meta property="og:title" content="Performance Widget &amp; Kit" />
            <meta property="og:image" content="/images/widget.jpg" />
            <meta property="product:price:amount" content="$1,299.99" />
            <meta property="product:price:currency" content="USD" />
          </head>
        </html>
      `),
    );

    await expect(
      service.preview("https://store.example/parts/widget-123"),
    ).resolves.toEqual({
      name: "Performance Widget & Kit",
      priceCents: 129999,
      currency: "USD",
      sourceUrl: "https://store.example/parts/widget-123",
      images: ["https://store.example/images/widget.jpg"],
    });
  });

  it("reports a retailer challenge as an unsupported page", async () => {
    const service = createService(async () =>
      htmlResponse(`
        <html>
          <head><title>Pardon Our Interruption</title></head>
          <body>As you were browsing something about your browser made us think you were a bot.</body>
        </html>
      `),
    );

    await expect(
      service.preview("https://store.example/parts/widget-123"),
    ).rejects.toMatchObject({
      code: "UNSUPPORTED_PAGE",
    } satisfies Partial<ProductPreviewError>);
  });

  it("falls back to Twitter image metadata when product JSON has no image", async () => {
    const service = createService(async () =>
      htmlResponse(`
        <script type="application/ld+json">
          {
            "@type": "Product",
            "name": "Image Metadata Widget",
            "offers": { "price": "10.00", "priceCurrency": "USD" }
          }
        </script>
        <meta name="twitter:image" content="//cdn.example/widget.png" />
      `),
    );

    await expect(
      service.preview("https://store.example/products/widget"),
    ).resolves.toMatchObject({
      images: ["https://cdn.example/widget.png"],
    });
  });
  it("reads price specifications from JSON-LD offers", async () => {
    const service = createService(async () =>
      htmlResponse(`
        <script type="application/ld+json">
          {
            "@type": "Product",
            "name": "Specification Widget",
            "offers": {
              "priceCurrency": "EUR",
              "priceSpecification": {
                "price": "39.95"
              }
            }
          }
        </script>
      `),
    );

    await expect(
      service.preview("https://store.example/products/widget"),
    ).resolves.toMatchObject({
      name: "Specification Widget",
      priceCents: 3995,
      currency: "EUR",
    });
  });

  it("reads product values from span itemprop microdata", async () => {
    const service = createService(async () =>
      htmlResponse(`
        <h1 itemprop="name">Microdata Widget</h1>
        <span itemprop="price">59.90</span>
        <meta itemprop="priceCurrency" content="USD" />
      `),
    );

    await expect(
      service.preview("https://store.example/products/widget"),
    ).resolves.toMatchObject({
      name: "Microdata Widget",
      priceCents: 5990,
      currency: "USD",
    });
  });

  it("follows a safe product-page redirect", async () => {
    const responses = [
      new Response(null, {
        status: 302,
        headers: { location: "https://store.example/products/widget" },
      }),
      htmlResponse(`
        <script type="application/ld+json">
          {
            "@type": "Product",
            "name": "Redirected Widget",
            "offers": { "price": "12.00", "priceCurrency": "USD" }
          }
        </script>
      `),
    ];
    const service = createService(async () => responses.shift()!);

    await expect(
      service.preview("https://short.example/widget"),
    ).resolves.toMatchObject({
      name: "Redirected Widget",
      priceCents: 1200,
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
        "image": "/images/widget.jpg",
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
