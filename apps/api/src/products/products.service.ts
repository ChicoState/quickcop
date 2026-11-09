import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { ShopifyProductResponse } from './shopify-product.types';

type ProductRow = {
  slug: string;
  name: string;
  store: string;
  shopify_url: string;
};

type TrackedProduct = {
  id: string;
  name: string;
  store: string;
  shopifyUrl: string;
};

export type ProductStockDto = {
  id: string;
  name: string;
  store: string;
  price: string;
  available: boolean;
  imageUrl: string | null;
  checkedAt: string;
};

const FETCH_TIMEOUT_MS = 8_000;

function formatPrice(value: string | number): string {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '';
}

function normalizeImageUrl(src: string | null): string | null {
  if (!src) return null;
  return src.startsWith('//') ? `https:${src}` : src;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.admin;
  }

  async listWithStock(): Promise<ProductStockDto[]> {
    const tracked = await this.listTrackedProducts();
    return Promise.all(tracked.map((p) => this.fetchStock(p)));
  }

  async getStock(slug: string): Promise<ProductStockDto> {
    const tracked = await this.listTrackedProducts();
    const product = tracked.find((p) => p.id === slug);
    if (!product) throw new NotFoundException();
    return this.fetchStock(product);
  }

  private async listTrackedProducts(): Promise<TrackedProduct[]> {
    const { data, error } = await this.db
      .from('products')
      .select('slug, name, store, shopify_url')
      .order('created_at', { ascending: true });

    if (error) throw new InternalServerErrorException();

    return (data as ProductRow[]).map((row) => ({
      id: row.slug,
      name: row.name,
      store: row.store,
      shopifyUrl: row.shopify_url,
    }));
  }

  private async fetchStock(product: TrackedProduct): Promise<ProductStockDto> {
    try {
      const res = await fetch(product.shopifyUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`Shopify responded ${res.status}`);

      const data = (await res.json()) as ShopifyProductResponse;
      const variant = data.variants?.[0];

      return {
        id: product.id,
        name: product.name,
        store: product.store,
        price: formatPrice(variant?.price ?? data.price),
        available: variant ? variant.available : data.available,
        imageUrl: normalizeImageUrl(data.featured_image),
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.warn(`Stock check failed for ${product.id}: ${error}`);
      return {
        id: product.id,
        name: product.name,
        store: product.store,
        price: '',
        available: false,
        imageUrl: null,
        checkedAt: new Date().toISOString(),
      };
    }
  }
}
