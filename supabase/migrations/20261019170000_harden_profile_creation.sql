create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  normalized_username text;
  normalized_phone text;
begin
  normalized_username := lower(trim(new.raw_user_meta_data->>'username'));

  if normalized_username is null
     or normalized_username !~ '^[a-z0-9_]{3,30}$' then
    raise exception using
      errcode = 'check_violation',
      message = 'A valid username is required.';
  end if;

  normalized_phone := nullif(trim(new.raw_user_meta_data->>'phone'), '');
  if normalized_phone is not null
     and normalized_phone !~ '^\+?[0-9]{7,15}$' then
    raise exception using
      errcode = 'check_violation',
      message = 'The phone number is invalid.';
  end if;

  insert into public.profiles (id, username, display_name, phone)
  values (
    new.id,
    normalized_username,
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    normalized_phone
  );

  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end;
$$;
