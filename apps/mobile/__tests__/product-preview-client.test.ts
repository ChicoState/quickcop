import { requestProductPreview } from "../features/api/productPreviewClient";

describe("requestProductPreview", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.EXPO_PUBLIC_API_URL = "https://api.example.com";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("posts the URL and returns the product preview", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          name: "Widget",
          priceCents: 1299,
          currency: "USD",
          sourceUrl: "https://store.example/widget",
          images: [],
        }),
        { status: 200 },
      ),
    );

    await expect(
      requestProductPreview("https://store.example/widget"),
    ).resolves.toMatchObject({ name: "Widget", priceCents: 1299 });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/product-previews",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ url: "https://store.example/widget" }),
      }),
    );
  });

  it("returns the API's product error message", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: "Enter a valid HTTPS product URL." } }),
        { status: 400 },
      ),
    );

    await expect(requestProductPreview("not-a-url")).rejects.toThrow(
      "Enter a valid HTTPS product URL.",
    );
  });
});
