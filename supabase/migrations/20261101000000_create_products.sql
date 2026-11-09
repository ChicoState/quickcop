create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  store text not null,
  shopify_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists products_created_at_idx
  on public.products (created_at desc);

alter table public.products enable row level security;

drop policy if exists "authenticated users can read products"
on public.products;

create policy "authenticated users can read products"
on public.products
for select
to authenticated
using (true);

insert into public.products (slug, name, store, shopify_url)
values (
  'pokemon-30th-poster',
  'Pokemon TCG: 30th Celebration - Poster Collection',
  'Shop of Magic',
  'https://shop.shopofmagic.com/collections/pokemon-30th-anniversary-collection-1/products/pokemon-30th-celebration-poster-collection.js'
)
on conflict (slug) do nothing;