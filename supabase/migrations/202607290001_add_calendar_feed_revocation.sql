alter table public.user_settings
  add column if not exists calendar_feed_version integer not null default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_settings'::regclass
      and conname = 'user_settings_calendar_feed_version_check'
  ) then
    alter table public.user_settings
      add constraint user_settings_calendar_feed_version_check
      check (calendar_feed_version >= 1);
  end if;
end
$$;

create or replace function public.rotate_calendar_feed_version()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  next_version integer;
begin
  if auth.uid() is null then
    raise exception using
      errcode = '42501',
      message = 'Authentication is required.';
  end if;

  insert into public.user_settings (
    user_id,
    calendar_feed_version
  )
  values (
    auth.uid(),
    2
  )
  on conflict (user_id)
  do update
    set calendar_feed_version = public.user_settings.calendar_feed_version + 1,
        updated_at = now()
    where public.user_settings.user_id = auth.uid()
  returning calendar_feed_version into next_version;

  if next_version is null then
    raise exception using
      errcode = '42501',
      message = 'Calendar feed settings could not be updated.';
  end if;

  return next_version;
end;
$$;

revoke all on function public.rotate_calendar_feed_version() from public, anon;
grant execute on function public.rotate_calendar_feed_version() to authenticated, service_role;
