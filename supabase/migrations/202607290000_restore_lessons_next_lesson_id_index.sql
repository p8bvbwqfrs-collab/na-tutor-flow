-- This migration must run outside an explicit transaction because PostgreSQL
-- prohibits concurrent index creation inside a transaction block.
create index concurrently if not exists lessons_next_lesson_id_idx
on public.lessons using btree (next_lesson_id);
