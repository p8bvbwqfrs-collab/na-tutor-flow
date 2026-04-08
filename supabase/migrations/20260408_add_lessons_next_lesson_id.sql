alter table public.lessons
add column if not exists next_lesson_id uuid references public.lessons(id) on delete set null;

create index if not exists lessons_next_lesson_id_idx on public.lessons (next_lesson_id);
