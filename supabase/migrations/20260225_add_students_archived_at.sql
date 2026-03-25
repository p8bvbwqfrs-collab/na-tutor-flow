-- Add archive support for students without deleting history.
alter table public.students
  add column if not exists archived_at timestamptz;

create index if not exists students_archived_at_idx
  on public.students (archived_at);
