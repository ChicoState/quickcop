alter table public.profiles enable row level security;

drop policy if exists "users manage their profile"
on public.profiles;

create policy "users manage their profile"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

alter table public.notification_preferences enable row level security;

drop policy if exists "users manage their notification preferences"
on public.notification_preferences;

create policy "users manage their notification preferences"
on public.notification_preferences
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
