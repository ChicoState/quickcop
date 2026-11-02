-- Username validation lives in handle_new_user(); drop the legacy table check.
alter table public.profiles drop constraint if exists username_format;

-- Replace legacy lower(username) index with the repo's lower(trim(username)) index.
drop index if exists public.profiles_username_lower_idx;
create unique index if not exists profiles_username_unique
  on public.profiles (lower(trim(username)));