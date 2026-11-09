import { ProductsService } from './products.service';

describe('ProductsService', () => {
  it('preserves Shopify decimal-string prices', async () => {
    const from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [
            {
              slug: 'poster',
              name: 'Poster',
              store: 'Shop of Magic',
              shopify_url: 'https://example.com/product.js',
            },
          ],
          error: null,
        }),
      }),
    });
    const service = new ProductsService({ admin: { from } } as never);
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          available: true,
          featured_image: null,
          price: '29.99',
          variants: [],
        }),
        { status: 200 },
      ),
    );

    await expect(service.listWithStock()).resolves.toEqual([
      expect.objectContaining({ price: '$29.99' }),
    ]);

    fetchMock.mockRestore();
  });

  it('includes the price when the Shopify variant is out of stock', async () => {
    const from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [
            {
              slug: 'poster',
              name: 'Poster',
              store: 'Shop of Magic',
              shopify_url: 'https://example.com/product.js',
            },
          ],
          error: null,
        }),
      }),
    });
    const service = new ProductsService({ admin: { from } } as never);
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          available: false,
          featured_image: null,
          price: '29.99',
          variants: [{ id: 1, available: false, price: '29.99' }],
        }),
        { status: 200 },
      ),
    );

    await expect(service.listWithStock()).resolves.toEqual([
      expect.objectContaining({ available: false, price: '$29.99' }),
    ]);

    fetchMock.mockRestore();
  });
});
