import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ACCOUNT_DELETION_SUCCESS_PATH,
  deleteAuthenticatedAccount,
  submitAccountDeletion,
} from "./account-deletion";

const routeSource = readFileSync(
  new URL("../app/(authed)/app/settings/delete-account/route.ts", import.meta.url),
  "utf8",
);
const controlsSource = readFileSync(
  new URL(
    "../app/(authed)/app/settings/components/account-deletion-controls.tsx",
    import.meta.url,
  ),
  "utf8",
);
const settingsPageSource = readFileSync(
  new URL("../app/(authed)/app/settings/page.tsx", import.meta.url),
  "utf8",
);
const loginSource = readFileSync(
  new URL("../app/(public)/login/login-client.tsx", import.meta.url),
  "utf8",
);
const privacySource = readFileSync(
  new URL("../app/(public)/privacy/page.tsx", import.meta.url),
  "utf8",
);
const migrationSource = readFileSync(
  new URL(
    "../../supabase/migrations/202607290002_cascade_account_deletion.sql",
    import.meta.url,
  ),
  "utf8",
);
const schemaSource = readFileSync(new URL("../../supabase/schema.sql", import.meta.url), "utf8");

test("an unauthenticated request cannot invoke privileged account deletion", async () => {
  let deletionCalls = 0;
  const result = await deleteAuthenticatedAccount(
    {
      getAuthenticatedUser: async () => null,
      deleteAuthenticatedUser: async () => {
        deletionCalls += 1;
        return { error: null };
      },
    },
    "owner@example.test",
  );

  assert.deepEqual(result, {
    ok: false,
    status: 401,
    error: "You need to be signed in to delete your account.",
  });
  assert.equal(deletionCalls, 0);
});

test("the exact signed-in email is required and no submitted user id is accepted", async () => {
  const deletedUserIds: string[] = [];
  const dependencies = {
    getAuthenticatedUser: async () => ({
      id: "authenticated-user",
      email: "Owner@Example.test",
    }),
    deleteAuthenticatedUser: async (userId: string) => {
      deletedUserIds.push(userId);
      return { error: null };
    },
  };

  const mismatch = await deleteAuthenticatedAccount(
    dependencies,
    "owner@example.test",
  );
  assert.equal(mismatch.ok, false);
  assert.equal(deletedUserIds.length, 0);

  const success = await deleteAuthenticatedAccount(
    dependencies,
    "Owner@Example.test",
  );
  assert.deepEqual(success, { ok: true });
  assert.deepEqual(deletedUserIds, ["authenticated-user"]);
});

test("a database or Auth failure never returns a successful deletion", async () => {
  const result = await deleteAuthenticatedAccount(
    {
      getAuthenticatedUser: async () => ({
        id: "authenticated-user",
        email: "owner@example.test",
      }),
      deleteAuthenticatedUser: async () => ({ error: "foreign key failure" }),
    },
    "owner@example.test",
  );

  assert.deepEqual(result, {
    ok: false,
    status: 500,
    error: "Your account could not be deleted. Nothing was recorded as successful.",
  });
});

test("successful submission navigates once and repeated activation is blocked", async () => {
  let finishDeletion: ((result: { ok: true }) => void) | undefined;
  let deletionCalls = 0;
  const destinations: string[] = [];
  const inFlight = { current: false };
  const pendingDeletion = new Promise<{ ok: true }>((resolve) => {
    finishDeletion = resolve;
  });
  const submission = {
    inFlight,
    deleteAccount: async () => {
      deletionCalls += 1;
      return pendingDeletion;
    },
    navigate: (path: string) => destinations.push(path),
  };

  const first = submitAccountDeletion(submission);
  const duplicate = await submitAccountDeletion(submission);

  assert.deepEqual(duplicate, { status: "duplicate" });
  assert.equal(deletionCalls, 1);

  finishDeletion?.({ ok: true });
  assert.deepEqual(await first, { status: "success" });
  assert.deepEqual(destinations, ["/login?account_deleted=1"]);
  assert.equal(ACCOUNT_DELETION_SUCCESS_PATH, "/login?account_deleted=1");
});

test("a failed submission remains recoverable without navigating", async () => {
  const destinations: string[] = [];
  const inFlight = { current: false };
  const result = await submitAccountDeletion({
    inFlight,
    deleteAccount: async () => ({
      ok: false,
      status: 500,
      error: "Deletion failed",
    }),
    navigate: (path) => destinations.push(path),
  });

  assert.deepEqual(result, { status: "error", error: "Deletion failed" });
  assert.deepEqual(destinations, []);
  assert.equal(inFlight.current, false);
});

test("the route keeps privileged deletion server-side and rejects cross-site requests", () => {
  const authenticationPosition = routeSource.indexOf("supabase.auth.getUser");
  const adminDeletionPosition = routeSource.indexOf("admin.auth.admin.deleteUser");

  assert.ok(authenticationPosition >= 0);
  assert.ok(adminDeletionPosition > authenticationPosition);
  assert.match(routeSource, /createSupabaseAdminClient/);
  assert.match(routeSource, /requestOrigin !== request\.nextUrl\.origin/);
  assert.match(routeSource, /application\/json/);
  assert.match(routeSource, /private, no-store, max-age=0/);
  assert.match(routeSource, /cookie\.name\.startsWith\("sb-"\)/);
  assert.doesNotMatch(routeSource, /body\.userId/);
});

test("the confirmation UI is explicit, accessible and requires two deliberate confirmations", () => {
  assert.match(settingsPageSource, /<AccountDeletionControls accountEmail=\{user\.email\}/);
  assert.match(controlsSource, /Delete my account/);
  assert.match(controlsSource, /all Tutor Flow data/i);
  assert.match(controlsSource, /cannot be undone/i);
  assert.match(controlsSource, /role="dialog"/);
  assert.match(controlsSource, /aria-modal="true"/);
  assert.match(controlsSource, /event\.key === "Escape"/);
  assert.match(controlsSource, /event\.key === "Tab"/);
  assert.match(controlsSource, /confirmationEmail !== accountEmail/);
  assert.match(controlsSource, /!hasAcknowledged/);
  assert.match(controlsSource, /deletionInFlightRef/);
  assert.match(loginSource, /account_deleted/);
  assert.match(loginSource, /saved data were permanently deleted/);
  assert.match(privacySource, /download a portable copy/i);
  assert.match(privacySource, /permanently delete your\s+account/i);
});

test("the database migration makes every direct Auth relationship deletion-safe", () => {
  assert.match(
    migrationSource,
    /alter table public\.students[\s\S]*references auth\.users\(id\)[\s\S]*on delete cascade/,
  );
  assert.match(
    migrationSource,
    /alter table public\.lessons[\s\S]*references auth\.users\(id\)[\s\S]*on delete cascade/,
  );
  assert.match(migrationSource, /validate constraint students_user_id_fkey/);
  assert.match(migrationSource, /validate constraint lessons_user_id_fkey/);

  const directAuthReferences = Array.from(
    schemaSource.matchAll(/references auth\.users\(id\)([^\n,]*)/g),
  );
  assert.ok(directAuthReferences.length >= 5);
  directAuthReferences.forEach((match) => {
    assert.match(match[1], /on delete cascade/);
  });
});
