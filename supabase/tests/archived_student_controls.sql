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
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'other@example.test',
    '',
    now(),
    now(),
    now()
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-0000-0000-000000000001',
  true
);

-- Normal active-student writes must continue to work.
insert into public.students (id, user_id, student_name)
values (
  '30000000-0000-0000-0000-000000000003',
  auth.uid(),
  'Disposable active student'
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
values (
  '40000000-0000-0000-0000-000000000004',
  auth.uid(),
  '30000000-0000-0000-0000-000000000003',
  '2026-01-15 18:00:00+00',
  'Local RLS test',
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
values (
  '50000000-0000-0000-0000-000000000005',
  auth.uid(),
  '30000000-0000-0000-0000-000000000003',
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
values (
  '60000000-0000-0000-0000-000000000006',
  auth.uid(),
  '50000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000004',
  5000
);

-- An active student must not be permanently deleted.
do $$
declare
  affected integer;
begin
  delete from public.students
  where id = '30000000-0000-0000-0000-000000000003';
  get diagnostics affected = row_count;

  if affected <> 0 then
    raise exception 'active student deletion unexpectedly succeeded';
  end if;
end
$$;

update public.students
set archived_at = now()
where id = '30000000-0000-0000-0000-000000000003';

-- Archived-student related writes must be rejected or affect no rows.
do $$
begin
  begin
    insert into public.lessons (
      user_id,
      student_id,
      lesson_at,
      topics,
      effort,
      confidence,
      fee_pence
    )
    values (
      auth.uid(),
      '30000000-0000-0000-0000-000000000003',
      '2026-07-15 17:00:00+00',
      'Blocked archived write',
      3,
      3,
      5000
    );
    raise exception 'archived lesson insert unexpectedly succeeded';
  exception
    when insufficient_privilege then null;
  end;

  begin
    insert into public.payments (
      user_id,
      student_id,
      amount_pence,
      source
    )
    values (
      auth.uid(),
      '30000000-0000-0000-0000-000000000003',
      5000,
      'recorded_payment'
    );
    raise exception 'archived payment insert unexpectedly succeeded';
  exception
    when insufficient_privilege then null;
  end;

  begin
    insert into public.payment_allocations (
      user_id,
      payment_id,
      lesson_id,
      amount_pence
    )
    values (
      auth.uid(),
      '50000000-0000-0000-0000-000000000005',
      '40000000-0000-0000-0000-000000000004',
      1
    );
    raise exception 'archived allocation insert unexpectedly succeeded';
  exception
    when insufficient_privilege or unique_violation then
      if sqlstate = '23505' then
        raise exception 'allocation reached its unique constraint before RLS rejection';
      end if;
  end;
end
$$;

do $$
declare
  affected integer;
begin
  update public.lessons
  set topics = 'Blocked update'
  where id = '40000000-0000-0000-0000-000000000004';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'archived lesson update unexpectedly succeeded';
  end if;

  update public.payments
  set amount_pence = 4900
  where id = '50000000-0000-0000-0000-000000000005';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'archived payment update unexpectedly succeeded';
  end if;

  update public.payment_allocations
  set amount_pence = 4900
  where id = '60000000-0000-0000-0000-000000000006';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'archived allocation update unexpectedly succeeded';
  end if;
end
$$;

-- Restoration remains a legitimate student update.
update public.students
set archived_at = null
where id = '30000000-0000-0000-0000-000000000003';

do $$
begin
  if not exists (
    select 1 from public.students
    where id = '30000000-0000-0000-0000-000000000003'
      and archived_at is null
  ) then
    raise exception 'archived student restoration failed';
  end if;
end
$$;

update public.students
set archived_at = now()
where id = '30000000-0000-0000-0000-000000000003';

-- A different authenticated user cannot see or delete the student's row.
select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000002',
  true
);

do $$
declare
  visible integer;
  affected integer;
begin
  select count(*) into visible
  from public.students
  where id = '30000000-0000-0000-0000-000000000003';
  if visible <> 0 then
    raise exception 'cross-user student read unexpectedly succeeded';
  end if;

  delete from public.students
  where id = '30000000-0000-0000-0000-000000000003';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'cross-user student deletion unexpectedly succeeded';
  end if;
end
$$;

-- The owner can delete the archived student.
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-0000-0000-000000000001',
  true
);

delete from public.students
where id = '30000000-0000-0000-0000-000000000003';

reset role;

-- Foreign-key cascades remove lessons, payments, and allocations.
do $$
begin
  if exists (
    select 1 from public.lessons
    where id = '40000000-0000-0000-0000-000000000004'
  ) then
    raise exception 'lesson cascade failed';
  end if;

  if exists (
    select 1 from public.payments
    where id = '50000000-0000-0000-0000-000000000005'
  ) then
    raise exception 'payment cascade failed';
  end if;

  if exists (
    select 1 from public.payment_allocations
    where id = '60000000-0000-0000-0000-000000000006'
  ) then
    raise exception 'allocation cascade failed';
  end if;
end
$$;

rollback;
