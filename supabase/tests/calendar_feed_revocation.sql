begin;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
values (
  '70000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'calendar-feed-owner@example.test',
  '',
  now(),
  now(),
  now()
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '70000000-0000-0000-0000-000000000007',
  true
);

do $$
declare
  first_version integer;
  second_version integer;
begin
  select public.rotate_calendar_feed_version() into first_version;
  select public.rotate_calendar_feed_version() into second_version;

  if first_version <> 2 then
    raise exception 'first calendar link reset returned %, expected 2', first_version;
  end if;

  if second_version <> 3 then
    raise exception 'second calendar link reset returned %, expected 3', second_version;
  end if;

  if not exists (
    select 1
    from public.user_settings
    where user_id = auth.uid()
      and calendar_feed_version = 3
  ) then
    raise exception 'calendar feed version was not stored for the authenticated user';
  end if;
end
$$;

reset role;

do $$
begin
  if has_function_privilege('anon', 'public.rotate_calendar_feed_version()', 'EXECUTE') then
    raise exception 'anonymous role can execute calendar link reset';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.rotate_calendar_feed_version()',
    'EXECUTE'
  ) then
    raise exception 'authenticated role cannot execute calendar link reset';
  end if;
end
$$;

rollback;
