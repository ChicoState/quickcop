import { describe, expect, it } from "@jest/globals";

import { ProductPreviewController } from "../../apps/api/src/product-preview/product-preview.controller";
import {
  ProductPreviewError,
  type ProductPreview,
} from "../../apps/api/src/product-preview/product-preview.service";

describe("ProductPreviewController", () => {
  it("passes a submitted product link to the preview service", async () => {
    const preview: ProductPreview = {
      name: "Widget",
      priceCents: 2499,
      currency: "USD",
      sourceUrl: "https://store.example/products/widget",
    };
    const controller = new ProductPreviewController({
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
    const controller = new ProductPreviewController({
      preview: async () => fail(),
    });

    await expect(controller.create({})).rejects.toMatchObject({
      response: { error: { code: "INVALID_URL" } },
      status: 400,
    });
  });

  it("maps a missing product to a 422 response", async () => {
    const controller = new ProductPreviewController({
      preview: async () => {
        throw new ProductPreviewError("PRODUCT_NOT_FOUND");
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
