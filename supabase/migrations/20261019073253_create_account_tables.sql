create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_username_unique
on public.profiles (lower(trim(username)));

create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  price_alerts boolean not null default true,
  account_alerts boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.notification_preferences enable row level security;

create policy "users manage their profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users manage their notification preferences"
on public.notification_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, phone)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'phone');

  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
