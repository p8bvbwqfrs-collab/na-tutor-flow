begin;

alter table public.students
  drop constraint if exists students_user_id_fkey;

alter table public.students
  add constraint students_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade
  not valid;

alter table public.students
  validate constraint students_user_id_fkey;

alter table public.lessons
  drop constraint if exists lessons_user_id_fkey;

alter table public.lessons
  add constraint lessons_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade
  not valid;

alter table public.lessons
  validate constraint lessons_user_id_fkey;

commit;
