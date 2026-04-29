alter table public.students
add column if not exists default_fee_pence integer check (default_fee_pence >= 0);

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
  source text not null default 'recorded_payment' check (source in ('recorded_payment', 'lesson_paid_now', 'imported')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'status'
  ) then
    alter table public.payments add column status text;
  end if;

  update public.payments
  set status = 'paid'
  where status is null;

  alter table public.payments
  alter column status set default 'paid';

  alter table public.payments
  alter column status set not null;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_status_check'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
    add constraint payments_status_check check (status in ('paid', 'expected'));
  end if;
end $$;

alter table public.payments
add column if not exists source text not null default 'recorded_payment'
check (source in ('recorded_payment', 'lesson_paid_now', 'imported'));

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  amount_pence integer not null check (amount_pence >= 0),
  created_at timestamptz not null default now(),
  unique (payment_id, lesson_id)
);

create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_student_id_idx on public.payments (student_id);
create index if not exists payment_allocations_user_id_idx on public.payment_allocations (user_id);
create index if not exists payment_allocations_payment_id_idx on public.payment_allocations (payment_id);
create index if not exists payment_allocations_lesson_id_idx on public.payment_allocations (lesson_id);

alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments
  for select
  using (user_id = auth.uid());

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own"
  on public.payments
  for insert
  with check (user_id = auth.uid());

drop policy if exists "payments_update_own" on public.payments;
create policy "payments_update_own"
  on public.payments
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "payments_delete_own" on public.payments;
create policy "payments_delete_own"
  on public.payments
  for delete
  using (user_id = auth.uid());

drop policy if exists "payment_allocations_select_own" on public.payment_allocations;
create policy "payment_allocations_select_own"
  on public.payment_allocations
  for select
  using (user_id = auth.uid());

drop policy if exists "payment_allocations_insert_own" on public.payment_allocations;
create policy "payment_allocations_insert_own"
  on public.payment_allocations
  for insert
  with check (user_id = auth.uid());

drop policy if exists "payment_allocations_update_own" on public.payment_allocations;
create policy "payment_allocations_update_own"
  on public.payment_allocations
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "payment_allocations_delete_own" on public.payment_allocations;
create policy "payment_allocations_delete_own"
  on public.payment_allocations
  for delete
  using (user_id = auth.uid());

do $$
declare
  lesson_record record;
  imported_payment_id uuid;
begin
  for lesson_record in
    select lessons.id, lessons.user_id, lessons.student_id, lessons.fee_pence, lessons.lesson_at
    from public.lessons
    where lessons.paid = true
      and lessons.fee_pence > 0
      and not exists (
        select 1
        from public.payment_allocations
        where payment_allocations.lesson_id = lessons.id
      )
  loop
    insert into public.payments (
      user_id,
      student_id,
      amount_pence,
      status,
      payment_date,
      source,
      note
    )
    values (
      lesson_record.user_id,
      lesson_record.student_id,
      lesson_record.fee_pence,
      'paid',
      lesson_record.lesson_at::date,
      'imported',
      'Imported from paid lesson'
    )
    returning id into imported_payment_id;

    insert into public.payment_allocations (
      user_id,
      payment_id,
      lesson_id,
      amount_pence
    )
    values (
      lesson_record.user_id,
      imported_payment_id,
      lesson_record.id,
      lesson_record.fee_pence
    )
    on conflict (payment_id, lesson_id) do nothing;
  end loop;
end $$;
