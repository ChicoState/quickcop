create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('price_change', 'restock')),
  name text not null,
  retailer text not null,
  previous_price text not null,
  current_price text not null,
  target_price text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "users manage their notifications"
on public.notifications;

create policy "users manage their notifications"
on public.notifications
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
