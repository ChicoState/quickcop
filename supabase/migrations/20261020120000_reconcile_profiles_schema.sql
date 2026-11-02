-- Reconcile hosted public.profiles with repository schema.
-- Additive only: no columns dropped, no data deleted.

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists updated_at timestamptz not null default now();

-- Legacy column not populated by handle_new_user(); stop it blocking signup.
alter table public.profiles
  alter column email drop not null;