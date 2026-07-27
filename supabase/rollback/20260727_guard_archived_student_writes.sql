-- Restore the ownership-only policies that immediately preceded
-- 20260727_guard_archived_student_writes.sql.
drop policy if exists "students_delete_own" on public.students;
create policy "students_delete_own"
  on public.students
  for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "lessons_insert_own" on public.lessons;
create policy "lessons_insert_own"
  on public.lessons
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "lessons_update_own" on public.lessons;
create policy "lessons_update_own"
  on public.lessons
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "lessons_delete_own" on public.lessons;
create policy "lessons_delete_own"
  on public.lessons
  for delete
  to authenticated
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
