-- Reconcile structures verified in production but absent from migration history.
alter table public.user_settings
  add column if not exists updated_at timestamptz not null default now();

-- Production user settings require the caller to provide the owning user explicitly.
alter table public.user_settings
  alter column user_id drop default;

-- Production predates the stricter source definition in the payments migration.
-- Retain its verified nullable, unconstrained shape until a separately validated
-- data migration can safely tighten existing records.
alter table public.payments
  alter column source drop not null,
  alter column source drop default;

alter table public.payments
  drop constraint if exists payments_source_check;

-- Hosted production grants table privileges to the API roles; RLS remains the
-- row-level enforcement boundary. New local projects revoke these defaults.
grant all privileges on table
  public.students,
  public.lessons,
  public.user_settings,
  public.payments,
  public.payment_allocations
to anon, authenticated, service_role;
