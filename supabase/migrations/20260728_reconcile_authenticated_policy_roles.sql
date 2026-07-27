-- Match the verified authenticated-only policy roles used by production while
-- retaining the archived-student protections introduced on 2026-07-27.
drop policy if exists "students_insert_authenticated" on public.students;

alter policy "students_select_own"
  on public.students
  to authenticated;

alter policy "students_insert_own"
  on public.students
  to authenticated
  with check (user_id = auth.uid());

alter policy "students_update_own"
  on public.students
  to authenticated;

alter policy "students_delete_own"
  on public.students
  to authenticated;

alter policy "lessons_select_own"
  on public.lessons
  to authenticated;

alter policy "lessons_insert_own"
  on public.lessons
  to authenticated;

alter policy "lessons_update_own"
  on public.lessons
  to authenticated;

alter policy "lessons_delete_own"
  on public.lessons
  to authenticated;

alter policy "user_settings_select_own"
  on public.user_settings
  to authenticated;

alter policy "user_settings_insert_own"
  on public.user_settings
  to authenticated;

alter policy "user_settings_update_own"
  on public.user_settings
  to authenticated;

drop policy if exists "user_settings_delete_own" on public.user_settings;
