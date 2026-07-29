import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const settingsPageSource = readFileSync(
  new URL("../app/(authed)/app/settings/page.tsx", import.meta.url),
  "utf8",
);
const controlsSource = readFileSync(
  new URL(
    "../app/(authed)/app/settings/components/calendar-feed-controls.tsx",
    import.meta.url,
  ),
  "utf8",
);
const routeSource = readFileSync(
  new URL("../app/api/calendar/tutoring/route.ts", import.meta.url),
  "utf8",
);
const migrationSource = readFileSync(
  new URL(
    "../../supabase/migrations/202607290001_add_calendar_feed_revocation.sql",
    import.meta.url,
  ),
  "utf8",
);

test("settings exposes a guarded private-link reset with clear consequences", () => {
  assert.match(settingsPageSource, /<CalendarFeedControls/);
  assert.match(controlsSource, /Reset private link/);
  assert.match(controlsSource, /current link will stop working immediately/i);
  assert.match(controlsSource, /lessons and calendar entries in Tutor Flow will not be changed/i);
  assert.match(controlsSource, /role="dialog"/);
  assert.match(controlsSource, /aria-modal="true"/);
  assert.match(controlsSource, /event\.key === "Escape"/);
  assert.match(controlsSource, /event\.key === "Tab"/);
  assert.match(controlsSource, /resetInFlightRef\.current/);
});

test("calendar requests fail closed when their per-user version is stale", () => {
  const versionCheckPosition = routeSource.indexOf("isCalendarFeedTokenCurrent");
  const lessonQueryPosition = routeSource.indexOf('.from("lessons")');

  assert.ok(versionCheckPosition >= 0);
  assert.ok(lessonQueryPosition > versionCheckPosition);
  assert.match(routeSource, /settingsError/);
  assert.match(routeSource, /status: 500/);
  assert.match(routeSource, /status: 401/);
});

test("the migration adds an atomic authenticated-only version rotation", () => {
  assert.match(
    migrationSource,
    /calendar_feed_version integer not null default 1/,
  );
  assert.match(migrationSource, /on conflict \(user_id\)/);
  assert.match(
    migrationSource,
    /calendar_feed_version = public\.user_settings\.calendar_feed_version \+ 1/,
  );
  assert.match(
    migrationSource,
    /revoke all on function public\.rotate_calendar_feed_version\(\) from public, anon/,
  );
  assert.match(
    migrationSource,
    /grant execute on function public\.rotate_calendar_feed_version\(\) to authenticated, service_role/,
  );
});
