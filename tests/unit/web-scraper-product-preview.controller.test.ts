import { describe, expect, it } from "@jest/globals";

import { WebScraperProductPreviewController } from "../../apps/webScraper-api/src/web-scraper-product-preview/web-scraper-product-preview.controller";
import {
  WebScraperProductPreviewError,
  type WebScraperProductPreview,
} from "../../apps/webScraper-api/src/web-scraper-product-preview/web-scraper-product-preview.service";

describe("WebScraperProductPreviewController", () => {
  it("passes a submitted product link to the preview service", async () => {
    const preview: WebScraperProductPreview = {
      name: "Widget",
      priceCents: 2499,
      currency: "USD",
      sourceUrl: "https://store.example/products/widget",
      images: [],
    };
    const controller = new WebScraperProductPreviewController({
      preview: async (url) => {
        expect(url).toBe("https://store.example/products/widget");
        return preview;
      },
    });

    await expect(
      controller.create({ url: "https://store.example/products/widget" }),
    ).resolves.toEqual(preview);
  });

  it("rejects a request without a URL", async () => {
    const controller = new WebScraperProductPreviewController({
      preview: async () => fail(),
    });

    await expect(controller.create({})).rejects.toMatchObject({
      response: { error: { code: "INVALID_URL" } },
      status: 400,
    });
  });

  it("maps a missing product to a 422 response", async () => {
    const controller = new WebScraperProductPreviewController({
      preview: async () => {
        throw new WebScraperProductPreviewError("PRODUCT_NOT_FOUND");
      },
    });

    await expect(
      controller.create({ url: "https://store.example/products/widget" }),
    ).rejects.toMatchObject({
      response: { error: { code: "PRODUCT_NOT_FOUND" } },
      status: 422,
    });
  });
});

function fail(): never {
  throw new Error("preview must not be called");
}
