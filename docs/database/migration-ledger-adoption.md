# Migration ledger adoption

This runbook adopts the repository's migration history in a Supabase project whose
database structure already contains the historical changes but whose migration
ledger is empty or untracked.

> **Production write prohibition:** project `gtymdecqzpjsatznnqsm` is production.
> Do not link write-capable rehearsal commands to it, repair its migration ledger,
> apply migrations, or modify its data without a separate, explicit production
> change approval. Never use production as a substitute for staging.

## Migration classification

| Version | Migration | Classification | Reason |
| --- | --- | --- | --- |
| `20260224` | `create_core_tutor_schema` | Historical: mark applied | Core tables, RLS, policies, functions and triggers already exist. |
| `20260225` | `add_students_archived_at` | Historical: mark applied | `students.archived_at` and its index already exist. |
| `20260324` | `add_lessons_topic_tags` | Historical: mark applied | `lessons.topic_tags` already exists. |
| `20260407` | `add_lessons_parent_note` | Historical: mark applied | `lessons.parent_note` already exists. |
| `202604080000` | `add_lessons_next_lesson_id` | Historical: mark applied | The column and foreign key already exist. The production schema audit found its supporting index absent; treat that as documented drift rather than replaying historical DDL during adoption. |
| `202604080001` | `add_user_settings_currency` | Historical: mark applied | The settings table and policies already exist. |
| `20260428` | `add_payments_model` | Historical: mark applied; never replay during adoption | Tables and constraints already exist, and this migration contains data-changing payment backfill SQL. |
| `20260429` | `reconcile_production_schema` | Historical: mark applied | The reconciled nullability, defaults, constraints and grants already match. |
| `20260727` | `guard_archived_student_writes` | New: execute | Adds archived-student write guards and deletion protection. |
| `20260728` | `reconcile_authenticated_policy_roles` | New: execute after `20260727` | Reconciles policy roles and removes duplicate or overly broad policies. |
| `202607290000` | `restore_lessons_next_lesson_id_index` | New: execute after `20260728` | Restores the missing non-unique btree index on `lessons(next_lesson_id)` without a data backfill. The next sortable version is used because extending the existing short `20260728_` prefix would sort before it in the CLI. |

The expected final ledger order is exactly:

```text
20260224
20260225
20260324
20260407
202604080000
202604080001
20260428
20260429
20260727
20260728
202607290000
```

## Required staging project

Use a disposable, empty Supabase project with no customer data:

- Suggested name: `tutor-tool-migration-staging`
- Region: `eu-west-1`, matching production
- Purpose: schema-only migration-ledger adoption rehearsal

The Supabase project listing observed one active and two inactive projects. Supabase
documents that the Free plan permits two active projects and paused projects do not
count, so a staging project may fit without an upgrade. Confirm the organisation's
actual plan and billing page before creation. Creating or activating a cloud project
requires separate approval.

## Local rehearsal

Start Docker, then from the repository root run:

```sh
supabase start
supabase db reset
supabase migration list --local
supabase test db
```

For an empty local ledger that represents an already-built database, mark only the
historical versions:

```sh
supabase migration repair --local --status applied \
  20260224 20260225 20260324 20260407 \
  202604080000 202604080001 20260428 20260429
supabase db push --dry-run --local
```

Acceptance criterion: the first dry run lists only:

```text
20260727_guard_archived_student_writes.sql
20260728_reconcile_authenticated_policy_roles.sql
202607290000_restore_lessons_next_lesson_id_index.sql
```

If any historical migration appears, stop. Do not use `--include-all`; correct the
ledger or filename mismatch first.

Apply and verify locally:

```sh
supabase db push --local
supabase test db
supabase migration list --local
supabase db push --dry-run --local
```

The second dry run must report that the local database is up to date, and every
expected version must appear exactly once in the ledger.

### Local security acceptance

`supabase/tests/archived_student_controls.sql` must prove:

- active students accept normal writes but cannot be permanently deleted;
- archived students reject lesson, payment and allocation writes;
- archived students can be restored by their owner;
- another user cannot access or delete the student;
- an owned archived student can be deleted; and
- deletion cascades through lessons, payments and allocations.

The final schema must also contain exactly this index definition:

```sql
CREATE INDEX lessons_next_lesson_id_idx
ON public.lessons USING btree (next_lesson_id);
```

It is intentionally non-unique and non-partial. The migration uses
`CREATE INDEX CONCURRENTLY IF NOT EXISTS`, so it must run outside an explicit
transaction. Concurrent creation avoids blocking ordinary inserts, updates and
deletes while the index is built, although it briefly acquires lighter relation
locks and may wait for long-running transactions. Keep the production maintenance
window and monitor long-running transactions even though the audited production
table is currently small.

## Staging adoption procedure

These commands are intentionally parameterised. Never set the target to production.

```sh
: "${TARGET_PROJECT_REF:?Set TARGET_PROJECT_REF to an approved staging project}"
BLOCKED_PRODUCTION_REF="gtymdecqzpjsatznnqsm"
if [ "$TARGET_PROJECT_REF" = "$BLOCKED_PRODUCTION_REF" ]; then
  echo "Refusing migration rehearsal against production" >&2
  exit 1
fi
supabase link --project-ref "$TARGET_PROJECT_REF"
```

### 1. Preflight and backups

Before any ledger write:

1. Confirm the project name, region and environment classification in the Supabase
   dashboard.
2. Confirm it contains no customer records.
3. Create a dashboard database backup or an equivalent restorable snapshot.
4. Export the current migration list and ledger query output to the change record.
5. Compare the staging schema with `supabase/schema.sql`, including columns,
   constraints, indexes, functions, triggers, grants, RLS enablement and policies.

Read-only preflight commands:

```sh
supabase projects list
supabase migration list --linked
supabase db dump --linked --file /tmp/tutor-tool-staging-before.sql
```

Do not proceed if the linked project identity is ambiguous, the ledger is non-empty
in an unexpected way, customer data exists, or structural differences are not
understood.

### 2. Back up the ledger

Record the result of this read-only query using the staging SQL editor or an
authorised database session:

```sql
select version, name, statements
from supabase_migrations.schema_migrations
order by version;
```

Keep the result with the database backup identifier and schema-only dump.

### 3. Adopt historical versions

Only after the schema comparison proves the historical changes already exist:

```sh
supabase migration repair --linked --status applied \
  20260224 20260225 20260324 20260407 \
  202604080000 202604080001 20260428 20260429
supabase migration list --linked
supabase db push --dry-run --linked
```

The dry run must list exactly `20260727`, `20260728` and `202607290000`, in that
order. If it lists `20260428` or any other historical migration, stop because
replay could modify data or conflict with existing objects.

### 4. Apply new migrations and test

In an approved maintenance window:

```sh
supabase db push --linked
supabase migration list --linked
supabase db push --dry-run --linked
supabase test db --linked
```

The final dry run must report no pending migrations. Run the archived-student
security cases with disposable staging users and records, then delete those
disposable records. Verify the index after application:

```sql
select
  index_class.relname as index_name,
  access_method.amname as method,
  index_catalog.indisunique,
  index_catalog.indisvalid,
  index_catalog.indisready,
  pg_get_indexdef(index_catalog.indexrelid) as definition,
  pg_get_expr(index_catalog.indpred, index_catalog.indrelid) as predicate
from pg_index as index_catalog
join pg_class as index_class
  on index_class.oid = index_catalog.indexrelid
join pg_class as table_class
  on table_class.oid = index_catalog.indrelid
join pg_namespace as table_namespace
  on table_namespace.oid = table_class.relnamespace
join pg_am as access_method
  on access_method.oid = index_class.relam
where table_namespace.nspname = 'public'
  and table_class.relname = 'lessons'
  and index_class.relname = 'lessons_next_lesson_id_idx';
```

The returned definition must be a valid, non-unique, non-partial btree index whose
only key is `next_lesson_id`. Also confirm `pg_index.indisvalid` and
`pg_index.indisready` are both true.

## Failure and rollback

If migration application fails, stop application traffic that can exercise the
affected writes, retain the error output, and restore the pre-change database
backup when atomic rollback cannot be demonstrated.

For `20260727`, the reviewed policy rollback is:

```sh
psql "$STAGING_DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  -f supabase/rollback/20260727_guard_archived_student_writes.sql
```

`20260728` has no independent rollback file because it reconciles the final policy
set. Restore the pre-change schema backup (or recreate the exact backed-up policies)
before applying the `20260727` rollback. Do not improvise policies during an
incident.

The index migration has an independent, non-blocking rollback:

```sh
psql "$STAGING_DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  -f supabase/rollback/202607290000_restore_lessons_next_lesson_id_index.sql
```

`DROP INDEX CONCURRENTLY` must also run outside an explicit transaction. Reapply
`202607290000_restore_lessons_next_lesson_id_index.sql` after rollback if the
application still relies on efficient self-reference lookups.

If a ledger version is marked incorrectly but its SQL was not applied, repair only
that exact version after comparing the live schema:

```sh
supabase migration repair --linked --status reverted VERSION
supabase migration list --linked
supabase db push --dry-run --linked
```

Never repair a version solely to make a dry run green. The schema and ledger must
describe the same state.

## Later production change sequence

This section is a checklist for a separately approved production task; it is not
authorisation to run it.

1. Schedule a maintenance window and confirm an application rollback owner.
2. Take and verify a production database backup.
3. Capture the production schema-only dump and migration ledger.
4. Re-run the structural comparison against `supabase/schema.sql`.
5. Mark the eight verified historical versions applied.
6. Require a dry run showing only `20260727`, `20260728` and `202607290000`.
7. Confirm no long-running transactions would delay concurrent index creation.
8. Apply those three migrations in the approved maintenance window. Do not wrap
   the concurrent index migration in an explicit transaction.
9. Confirm the final ledger and an empty dry run.
10. Verify `lessons_next_lesson_id_idx` is valid and ready with the exact expected
    definition.
11. Deploy the matching application commit through the normal production process.
12. Smoke-test active writes, archived read-only views, restoration, deletion
    confirmation, ownership rejection and cascade behaviour using approved test
    records only.
13. Monitor API errors, PostgreSQL logs, index validity and authentication failures.

Emergency application rollback: redeploy the previously known-good application
version. Emergency database rollback: restore the verified backup, or restore the
backed-up policy definitions and run the reviewed `20260727` rollback in the
documented order. A code rollback alone is insufficient if the database policies
have changed.
