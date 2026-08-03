alter table public.user_settings
  add column if not exists time_zone text not null default 'Europe/London';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_settings'::regclass
      and conname = 'user_settings_time_zone_length_check'
  ) then
    alter table public.user_settings
      add constraint user_settings_time_zone_length_check
      check (char_length(time_zone) between 1 and 100);
  end if;
end
$$;
