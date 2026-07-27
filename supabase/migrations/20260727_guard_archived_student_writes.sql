-- Archived students remain readable, but their related records are read-only.
drop policy if exists "students_delete_own" on public.students;
create policy "students_delete_own"
  on public.students
  for delete
  using (user_id = auth.uid() and archived_at is not null);

drop policy if exists "lessons_insert_own" on public.lessons;
create policy "lessons_insert_own"
  on public.lessons
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.students
      where students.id = lessons.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );

drop policy if exists "lessons_update_own" on public.lessons;
create policy "lessons_update_own"
  on public.lessons
  for update
  using (
    user_id = auth.uid()
    and exists (
      select 1
      from public.students
      where students.id = lessons.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.students
      where students.id = lessons.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );

drop policy if exists "lessons_delete_own" on public.lessons;
create policy "lessons_delete_own"
  on public.lessons
  for delete
  using (
    user_id = auth.uid()
    and exists (
      select 1
      from public.students
      where students.id = lessons.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own"
  on public.payments
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.students
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
      select 1
      from public.students
      where students.id = payments.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.students
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
      select 1
      from public.students
      where students.id = payments.student_id
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );

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
      where lessons.id = payment_allocations.lesson_id
        and lessons.user_id = auth.uid()
        and students.user_id = auth.uid()
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
      where lessons.id = payment_allocations.lesson_id
        and lessons.user_id = auth.uid()
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.lessons
      join public.students on students.id = lessons.student_id
      where lessons.id = payment_allocations.lesson_id
        and lessons.user_id = auth.uid()
        and students.user_id = auth.uid()
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
      where lessons.id = payment_allocations.lesson_id
        and lessons.user_id = auth.uid()
        and students.user_id = auth.uid()
        and students.archived_at is null
    )
  );
