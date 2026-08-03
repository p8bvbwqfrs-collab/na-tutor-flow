import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ACCOUNT_DATA_EXPORT_COLUMNS,
  ACCOUNT_DATA_EXPORT_PAGE_SIZE,
  ACCOUNT_DATA_EXPORT_SETTINGS_COLUMNS,
  accountDataExportFilename,
  createAccountDataExport,
  serializeAccountDataExport,
  type AccountDataExportTable,
} from "./account-data-export";

const routeSource = readFileSync(
  new URL("../app/(authed)/app/settings/export/route.ts", import.meta.url),
  "utf8",
);
const settingsPageSource = readFileSync(
  new URL("../app/(authed)/app/settings/page.tsx", import.meta.url),
  "utf8",
);
const controlsSource = readFileSync(
  new URL(
    "../app/(authed)/app/settings/components/account-data-export-controls.tsx",
    import.meta.url,
  ),
  "utf8",
);

function emptyPage() {
  return Promise.resolve({ rows: [], error: null });
}

test("an unauthenticated export stops before any account data query", async () => {
  let dataQueries = 0;
  const result = await createAccountDataExport({
    getAuthenticatedUser: async () => null,
    fetchSettings: async () => {
      dataQueries += 1;
      return { settings: null, error: null };
    },
    fetchOwnedPage: async () => {
      dataQueries += 1;
      return emptyPage();
    },
  });

  assert.deepEqual(result, {
    ok: false,
    status: 401,
    error: "You need to be signed in to download your data.",
  });
  assert.equal(dataQueries, 0);
});

test("the export includes every owned collection and paginates beyond API row limits", async () => {
  const pageCalls: Array<{
    table: AccountDataExportTable;
    from: number;
    to: number;
  }> = [];
  const firstLessonPage = Array.from(
    { length: ACCOUNT_DATA_EXPORT_PAGE_SIZE },
    (_, index) => ({ id: `lesson-${index}` }),
  );

  const result = await createAccountDataExport({
    getAuthenticatedUser: async () => ({
      id: "user-1",
      email: "tutor@example.test",
      createdAt: "2026-01-01T00:00:00.000Z",
    }),
    fetchSettings: async () => ({
      settings: { currency_code: "GBP" },
      error: null,
    }),
    fetchOwnedPage: async (table, _userId, from, to) => {
      pageCalls.push({ table, from, to });

      if (table === "lessons" && from === 0) {
        return { rows: firstLessonPage, error: null };
      }

      if (table === "lessons" && from === ACCOUNT_DATA_EXPORT_PAGE_SIZE) {
        return { rows: [{ id: "lesson-final" }], error: null };
      }

      return { rows: [{ id: `${table}-1` }], error: null };
    },
    now: () => new Date("2026-07-29T12:00:00.000Z"),
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    return;
  }

  assert.equal(result.data.lessons.length, ACCOUNT_DATA_EXPORT_PAGE_SIZE + 1);
  assert.deepEqual(result.data.preferences, { currency_code: "GBP" });
  assert.equal(result.data.export.format_version, 1);
  assert.equal(result.data.export.generated_at, "2026-07-29T12:00:00.000Z");
  assert.deepEqual(pageCalls.slice(1, 3), [
    { table: "lessons", from: 0, to: ACCOUNT_DATA_EXPORT_PAGE_SIZE - 1 },
    {
      table: "lessons",
      from: ACCOUNT_DATA_EXPORT_PAGE_SIZE,
      to: ACCOUNT_DATA_EXPORT_PAGE_SIZE * 2 - 1,
    },
  ]);
});

test("a failed owned-data query never returns a partial download", async () => {
  const queriedTables: AccountDataExportTable[] = [];
  const result = await createAccountDataExport({
    getAuthenticatedUser: async () => ({
      id: "user-1",
      email: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    }),
    fetchSettings: async () => ({ settings: null, error: null }),
    fetchOwnedPage: async (table) => {
      queriedTables.push(table);

      if (table === "lessons") {
        return { rows: [], error: "database unavailable" };
      }

      return { rows: [{ id: "owned-row" }], error: null };
    },
  });

  assert.deepEqual(result, {
    ok: false,
    status: 500,
    error: "We couldn’t prepare your data download. Please try again.",
  });
  assert.deepEqual(queriedTables, ["students", "lessons"]);
});

test("the portable export excludes internal ownership and calendar security fields", () => {
  for (const columns of Object.values(ACCOUNT_DATA_EXPORT_COLUMNS)) {
    assert.doesNotMatch(columns, /\buser_id\b/);
    assert.doesNotMatch(columns, /\*/);
  }

  assert.doesNotMatch(ACCOUNT_DATA_EXPORT_SETTINGS_COLUMNS, /calendar_feed_version/);
  assert.match(ACCOUNT_DATA_EXPORT_SETTINGS_COLUMNS, /time_zone/);
  assert.doesNotMatch(ACCOUNT_DATA_EXPORT_SETTINGS_COLUMNS, /\*/);
});

test("the download is formatted as a dated, human-readable JSON file", async () => {
  const result = await createAccountDataExport({
    getAuthenticatedUser: async () => ({
      id: "user-1",
      email: "tutor@example.test",
      createdAt: "2026-01-01T00:00:00.000Z",
    }),
    fetchSettings: async () => ({ settings: null, error: null }),
    fetchOwnedPage: emptyPage,
    now: () => new Date("2026-07-29T12:00:00.000Z"),
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    return;
  }

  const serialized = serializeAccountDataExport(result.data);
  assert.equal(serialized.endsWith("\n"), true);
  assert.deepEqual(JSON.parse(serialized), result.data);
  assert.equal(
    accountDataExportFilename(result.data.export.generated_at),
    "tutor-flow-data-2026-07-29.json",
  );
});

test("the route and Settings UI keep the sensitive export private and explicit", () => {
  const authenticationPosition = routeSource.indexOf("supabase.auth.getUser");
  const ownedQueryPosition = routeSource.indexOf(".from(table)");

  assert.ok(authenticationPosition >= 0);
  assert.ok(ownedQueryPosition > authenticationPosition);
  assert.match(routeSource, /\.eq\("user_id", userId\)/);
  assert.doesNotMatch(routeSource, /createSupabaseAdminClient/);
  assert.doesNotMatch(routeSource, /\.select\("\*"\)/);
  assert.match(routeSource, /private, no-store, max-age=0/);
  assert.match(routeSource, /Content-Disposition/);
  assert.match(routeSource, /X-Content-Type-Options/);

  assert.match(settingsPageSource, /<AccountDataExportControls/);
  assert.match(controlsSource, /Download my data/);
  assert.match(controlsSource, /private information about students and parents/i);
  assert.match(controlsSource, /shared device/i);
  assert.match(controlsSource, /role="dialog"/);
  assert.match(controlsSource, /aria-modal="true"/);
  assert.match(controlsSource, /event\.key === "Escape"/);
  assert.match(controlsSource, /event\.key === "Tab"/);
});
