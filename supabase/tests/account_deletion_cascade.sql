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
values
  (
    '71000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'delete-account-owner@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '72000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'retained-account-owner@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into public.user_settings (user_id, currency_code)
values
  ('71000000-0000-0000-0000-000000000001', 'GBP'),
  ('72000000-0000-0000-0000-000000000002', 'GBP');

insert into public.students (id, user_id, student_name)
values
  (
    '73000000-0000-0000-0000-000000000003',
    '71000000-0000-0000-0000-000000000001',
    'Deleted account student'
  ),
  (
    '74000000-0000-0000-0000-000000000004',
    '72000000-0000-0000-0000-000000000002',
    'Retained account student'
  );

insert into public.lessons (
  id,
  user_id,
  student_id,
  lesson_at,
  topics,
  effort,
  confidence,
  fee_pence
)
values
  (
    '75000000-0000-0000-0000-000000000005',
    '71000000-0000-0000-0000-000000000001',
    '73000000-0000-0000-0000-000000000003',
    '2026-07-29 12:00:00+00',
    'Deleted account lesson',
    3,
    3,
    5000
  ),
  (
    '76000000-0000-0000-0000-000000000006',
    '72000000-0000-0000-0000-000000000002',
    '74000000-0000-0000-0000-000000000004',
    '2026-07-29 13:00:00+00',
    'Retained account lesson',
    3,
    3,
    5000
  );

insert into public.payments (
  id,
  user_id,
  student_id,
  amount_pence,
  source
)
values
  (
    '77000000-0000-0000-0000-000000000007',
    '71000000-0000-0000-0000-000000000001',
    '73000000-0000-0000-0000-000000000003',
    5000,
    'recorded_payment'
  ),
  (
    '78000000-0000-0000-0000-000000000008',
    '72000000-0000-0000-0000-000000000002',
    '74000000-0000-0000-0000-000000000004',
    5000,
    'recorded_payment'
  );

insert into public.payment_allocations (
  id,
  user_id,
  payment_id,
  lesson_id,
  amount_pence
)
values
  (
    '79000000-0000-0000-0000-000000000009',
    '71000000-0000-0000-0000-000000000001',
    '77000000-0000-0000-0000-000000000007',
    '75000000-0000-0000-0000-000000000005',
    5000
  ),
  (
    '7a000000-0000-0000-0000-00000000000a',
    '72000000-0000-0000-0000-000000000002',
    '78000000-0000-0000-0000-000000000008',
    '76000000-0000-0000-0000-000000000006',
    5000
  );

delete from auth.users
where id = '71000000-0000-0000-0000-000000000001';

do $$
declare
  deleted_rows integer;
  retained_rows integer;
  cascade_constraints integer;
begin
  select
    (select count(*) from public.students where user_id = '71000000-0000-0000-0000-000000000001') +
    (select count(*) from public.lessons where user_id = '71000000-0000-0000-0000-000000000001') +
    (select count(*) from public.payments where user_id = '71000000-0000-0000-0000-000000000001') +
    (select count(*) from public.payment_allocations where user_id = '71000000-0000-0000-0000-000000000001') +
    (select count(*) from public.user_settings where user_id = '71000000-0000-0000-0000-000000000001')
  into deleted_rows;

  if deleted_rows <> 0 then
    raise exception 'account deletion left % owned rows behind', deleted_rows;
  end if;

  select
    (select count(*) from public.students where user_id = '72000000-0000-0000-0000-000000000002') +
    (select count(*) from public.lessons where user_id = '72000000-0000-0000-0000-000000000002') +
    (select count(*) from public.payments where user_id = '72000000-0000-0000-0000-000000000002') +
    (select count(*) from public.payment_allocations where user_id = '72000000-0000-0000-0000-000000000002') +
    (select count(*) from public.user_settings where user_id = '72000000-0000-0000-0000-000000000002')
  into retained_rows;

  if retained_rows <> 5 then
    raise exception 'account deletion changed another owner''s rows; retained % of 5', retained_rows;
  end if;

  select count(*)
  into cascade_constraints
  from pg_constraint
  where conname in (
    'students_user_id_fkey',
    'lessons_user_id_fkey',
    'payments_user_id_fkey',
    'payment_allocations_user_id_fkey',
    'user_settings_user_id_fkey'
  )
    and contype = 'f'
    and confrelid = 'auth.users'::regclass
    and confdeltype = 'c'
    and convalidated;

  if cascade_constraints <> 5 then
    raise exception 'expected 5 validated auth-user cascade constraints, found %',
      cascade_constraints;
  end if;
end
$$;

rollback;
