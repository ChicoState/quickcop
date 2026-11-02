-- Backfill legacy profiles created before handle_new_user() was fixed.

update public.profiles
set display_name = username
where display_name is null;

insert into public.notification_preferences (user_id)
select p.id
from public.profiles p
left join public.notification_preferences np on np.user_id = p.id
where np.user_id is null;