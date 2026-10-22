create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences
  add column if not exists restock_push boolean not null default false,
  add column if not exists restock_email boolean not null default false,
  add column if not exists price_change_push boolean not null default false,
  add column if not exists price_change_email boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.notification_preferences
  drop column if exists price_alerts,
  drop column if exists account_alerts;

alter table public.notification_preferences enable row level security;

drop policy if exists "users manage their notification preferences"
on public.notification_preferences;

create policy "users manage their notification preferences"
on public.notification_preferences
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
