-- Tutor Admin schema for Supabase.
-- Run this entire file in the Supabase SQL Editor (SQL > New query > paste > Run).

create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  student_name text not null,
  subject text,
  parent_name text,
  parent_contact text,
  parent_email text,
  notes text,
  default_fee_pence integer check (default_fee_pence >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  currency_code text not null default 'GBP' check (currency_code in ('GBP', 'USD', 'EUR', 'AUD')),
  calendar_feed_version integer not null default 1 check (calendar_feed_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  student_id uuid not null references public.students(id) on delete cascade,
  next_lesson_id uuid references public.lessons(id) on delete set null,
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
  status text not null default 'completed' check (status in ('planned', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  amount_pence integer not null check (amount_pence >= 0),
  status text not null default 'paid' check (status in ('paid', 'expected')),
  payment_date date,
  covers_from date,
  covers_to date,
  sessions_covered integer check (sessions_covered >= 0),
  source text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  amount_pence integer not null check (amount_pence >= 0),
  created_at timestamptz not null default now(),
  unique (payment_id, lesson_id)
);

create index if not exists students_user_id_idx on public.students (user_id);
create index if not exists students_archived_at_idx on public.students (archived_at);
create index if not exists lessons_user_id_idx on public.lessons (user_id);
create index if not exists lessons_student_id_idx on public.lessons (student_id);
create index if not exists lessons_lesson_at_idx on public.lessons (lesson_at);
create index if not exists lessons_next_lesson_id_idx on public.lessons (next_lesson_id);
create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_student_id_idx on public.payments (student_id);
create index if not exists payment_allocations_user_id_idx on public.payment_allocations (user_id);
create index if not exists payment_allocations_payment_id_idx on public.payment_allocations (payment_id);
create index if not exists payment_allocations_lesson_id_idx on public.payment_allocations (lesson_id);

alter table public.students enable row level security;
alter table public.user_settings enable row level security;
alter table public.lessons enable row level security;
alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;

grant all privileges on table
  public.students,
  public.lessons,
  public.user_settings,
  public.payments,
  public.payment_allocations
to anon, authenticated, service_role;

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

drop trigger if exists set_students_user_id on public.students;
create trigger set_students_user_id
before insert on public.students
for each row execute function public.set_user_id();

drop trigger if exists set_lessons_user_id on public.lessons;
create trigger set_lessons_user_id
before insert on public.lessons
for each row execute function public.set_user_id();

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

drop policy if exists "students_select_own" on public.students;
create policy "students_select_own"
  on public.students
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "students_insert_own" on public.students;
create policy "students_insert_own"
  on public.students
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "students_update_own" on public.students;
create policy "students_update_own"
  on public.students
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "students_delete_own" on public.students;
create policy "students_delete_own"
  on public.students
  for delete
  to authenticated
  using (user_id = auth.uid() and archived_at is not null);

drop policy if exists "lessons_select_own" on public.lessons;
drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
  on public.user_settings
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "user_settings_delete_own" on public.user_settings;

drop policy if exists "lessons_select_own" on public.lessons;
create policy "lessons_select_own"
  on public.lessons
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "lessons_insert_own" on public.lessons;
create policy "lessons_insert_own"
  on public.lessons
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.students
      where students.id = lessons.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );

drop policy if exists "lessons_update_own" on public.lessons;
create policy "lessons_update_own"
  on public.lessons
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.students
      where students.id = lessons.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.students
      where students.id = lessons.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );

drop policy if exists "lessons_delete_own" on public.lessons;
create policy "lessons_delete_own"
  on public.lessons
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.students
      where students.id = lessons.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments
  for select
  using (user_id = auth.uid());

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own"
  on public.payments
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.students
      where students.id = payments.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );

drop policy if exists "payments_update_own" on public.payments;
create policy "payments_update_own"
  on public.payments
  for update
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.students
      where students.id = payments.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.students
      where students.id = payments.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );

drop policy if exists "payments_delete_own" on public.payments;
create policy "payments_delete_own"
  on public.payments
  for delete
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.students
      where students.id = payments.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );

drop policy if exists "payment_allocations_select_own" on public.payment_allocations;
create policy "payment_allocations_select_own"
  on public.payment_allocations
  for select
  using (user_id = auth.uid());

drop policy if exists "payment_allocations_insert_own" on public.payment_allocations;
create policy "payment_allocations_insert_own"
  on public.payment_allocations
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.lessons
      join public.students on students.id = lessons.student_id
      join public.payments on payments.id = payment_allocations.payment_id
      where lessons.id = payment_allocations.lesson_id
        and lessons.user_id = auth.uid()
        and students.user_id = auth.uid()
        and payments.user_id = auth.uid()
        and payments.student_id = students.id
        and students.archived_at is null
    )
  );

drop policy if exists "payment_allocations_update_own" on public.payment_allocations;
create policy "payment_allocations_update_own"
  on public.payment_allocations
  for update
  using (
    user_id = auth.uid()
    and exists (
      select 1
      from public.lessons
      join public.students on students.id = lessons.student_id
      join public.payments on payments.id = payment_allocations.payment_id
      where lessons.id = payment_allocations.lesson_id
        and lessons.user_id = auth.uid()
        and students.user_id = auth.uid()
        and payments.user_id = auth.uid()
        and payments.student_id = students.id
        and students.archived_at is null
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.lessons
      join public.students on students.id = lessons.student_id
      join public.payments on payments.id = payment_allocations.payment_id
      where lessons.id = payment_allocations.lesson_id
        and lessons.user_id = auth.uid()
        and students.user_id = auth.uid()
        and payments.user_id = auth.uid()
        and payments.student_id = students.id
        and students.archived_at is null
    )
  );

drop policy if exists "payment_allocations_delete_own" on public.payment_allocations;
create policy "payment_allocations_delete_own"
  on public.payment_allocations
  for delete
  using (
    user_id = auth.uid()
    and exists (
      select 1
      from public.lessons
      join public.students on students.id = lessons.student_id
      join public.payments on payments.id = payment_allocations.payment_id
      where lessons.id = payment_allocations.lesson_id
        and lessons.user_id = auth.uid()
        and students.user_id = auth.uid()
        and payments.user_id = auth.uid()
        and payments.student_id = students.id
        and students.archived_at is null
    )
  );
