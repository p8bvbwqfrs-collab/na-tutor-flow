begin;

drop function if exists public.rotate_calendar_feed_version();

alter table public.user_settings
  drop constraint if exists user_settings_calendar_feed_version_check;

alter table public.user_settings
  drop column if exists calendar_feed_version;

commit;
