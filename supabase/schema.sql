-- Tutor Admin schema for Supabase.
-- Run this entire file in the Supabase SQL Editor (SQL > New query > paste > Run).

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

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_at timestamptz not null,
  topics text not null,
  topic_tags text[],
  went_well text,
  parent_note text,
  improve text,
  homework text,
  effort int not null check (effort between 1 and 5),
  confidence int not null check (confidence between 1 and 5),
  fee_pence int not null check (fee_pence >= 0),
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists students_user_id_idx on public.students (user_id);
create index if not exists lessons_user_id_idx on public.lessons (user_id);
create index if not exists lessons_student_id_idx on public.lessons (student_id);
create index if not exists lessons_lesson_at_idx on public.lessons (lesson_at);

alter table public.students enable row level security;
alter table public.lessons enable row level security;

drop policy if exists "students_select_own" on public.students;
create policy "students_select_own"
  on public.students
  for select
  using (user_id = auth.uid());

drop policy if exists "students_insert_own" on public.students;
create policy "students_insert_own"
  on public.students
  for insert
  with check (user_id = auth.uid());

drop policy if exists "students_update_own" on public.students;
create policy "students_update_own"
  on public.students
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "students_delete_own" on public.students;
create policy "students_delete_own"
  on public.students
  for delete
  using (user_id = auth.uid());

drop policy if exists "lessons_select_own" on public.lessons;
create policy "lessons_select_own"
  on public.lessons
  for select
  using (user_id = auth.uid());

drop policy if exists "lessons_insert_own" on public.lessons;
create policy "lessons_insert_own"
  on public.lessons
  for insert
  with check (user_id = auth.uid());

drop policy if exists "lessons_update_own" on public.lessons;
create policy "lessons_update_own"
  on public.lessons
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "lessons_delete_own" on public.lessons;
create policy "lessons_delete_own"
  on public.lessons
  for delete
  using (user_id = auth.uid());
