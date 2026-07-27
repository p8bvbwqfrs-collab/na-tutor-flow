-- Reconstruct the core schema that predates the checked-in incremental migrations.
-- Every statement is safe to replay against the existing production structure.
create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  student_name text not null,
  parent_name text,
  parent_email text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.students
  add column if not exists parent_contact text;

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_at timestamptz not null,
  topics text not null,
  went_well text,
  improve text,
  homework text,
  effort integer not null check (effort between 1 and 5),
  confidence integer not null check (confidence between 1 and 5),
  fee_pence integer not null check (fee_pence >= 0),
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.lessons
  add column if not exists status text not null default 'completed';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'lessons_status_check'
      and conrelid = 'public.lessons'::regclass
  ) then
    alter table public.lessons
      add constraint lessons_status_check
      check (status in ('planned', 'completed', 'cancelled'));
  end if;
end
$$;

create index if not exists students_user_id_idx on public.students (user_id);
create index if not exists lessons_user_id_idx on public.lessons (user_id);
create index if not exists lessons_student_id_idx on public.lessons (student_id);
create index if not exists lessons_lesson_at_idx on public.lessons (lesson_at);

alter table public.students enable row level security;
alter table public.lessons enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'students'
      and policyname = 'students_select_own'
  ) then
    create policy "students_select_own"
      on public.students
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'students'
      and policyname = 'students_insert_own'
  ) then
    create policy "students_insert_own"
      on public.students
      for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'students'
      and policyname = 'students_update_own'
  ) then
    create policy "students_update_own"
      on public.students
      for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'students'
      and policyname = 'students_delete_own'
  ) then
    create policy "students_delete_own"
      on public.students
      for delete
      to authenticated
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lessons'
      and policyname = 'lessons_select_own'
  ) then
    create policy "lessons_select_own"
      on public.lessons
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lessons'
      and policyname = 'lessons_insert_own'
  ) then
    create policy "lessons_insert_own"
      on public.lessons
      for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lessons'
      and policyname = 'lessons_update_own'
  ) then
    create policy "lessons_update_own"
      on public.lessons
      for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lessons'
      and policyname = 'lessons_delete_own'
  ) then
    create policy "lessons_delete_own"
      on public.lessons
      for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
end
$$;

create or replace function public.set_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_students_user_id'
      and tgrelid = 'public.students'::regclass
      and not tgisinternal
  ) then
    create trigger set_students_user_id
    before insert on public.students
    for each row execute function public.set_user_id();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_lessons_user_id'
      and tgrelid = 'public.lessons'::regclass
      and not tgisinternal
  ) then
    create trigger set_lessons_user_id
    before insert on public.lessons
    for each row execute function public.set_user_id();
  end if;
end
$$;
