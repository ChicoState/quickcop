export type ShopifyVariant = {
  id: number;
  available: boolean;
  price: string | number;
};

export type ShopifyProductResponse = {
  id: number;
  title: string;
  available: boolean;
  price: string | number;
  featured_image: string | null;
  variants: ShopifyVariant[];
};
