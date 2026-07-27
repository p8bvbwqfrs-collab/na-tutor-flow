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
values (
  '70000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rollback@example.test',
  '',
  now(),
  now(),
  now()
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '70000000-0000-0000-0000-000000000007',
  true
);

insert into public.students (id, user_id, student_name, archived_at)
values (
  '80000000-0000-0000-0000-000000000008',
  auth.uid(),
  'Disposable rollback student',
  now()
);

-- The pre-guard policy permits a related write for an archived student.
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
  '80000000-0000-0000-0000-000000000008',
  '2026-07-15 17:00:00+00',
  'Rollback verification',
  3,
  3,
  5000
);

-- The pre-guard policy also permits deletion regardless of archive state.
update public.students
set archived_at = null
where id = '80000000-0000-0000-0000-000000000008';

delete from public.students
where id = '80000000-0000-0000-0000-000000000008';

do $$
begin
  if exists (
    select 1 from public.students
    where id = '80000000-0000-0000-0000-000000000008'
  ) then
    raise exception 'rollback did not restore the pre-guard delete policy';
  end if;
end
$$;

rollback;
