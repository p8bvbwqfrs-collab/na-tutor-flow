-- This rollback must run outside an explicit transaction because PostgreSQL
-- prohibits concurrent index removal inside a transaction block.
drop index concurrently if exists public.lessons_next_lesson_id_idx;
