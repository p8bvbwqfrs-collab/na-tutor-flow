import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("lesson creation and editing use the saved tutor time zone", () => {
  const completedForm = readFileSync(
    "src/app/(authed)/app/students/[id]/new-lesson/new-lesson-form.tsx",
    "utf8",
  );
  const scheduledForm = readFileSync(
    "src/app/(authed)/app/students/[id]/schedule-lesson/schedule-lesson-form.tsx",
    "utf8",
  );

  assert.match(completedForm, /zonedDateTimeToIso\(lessonDate, lessonTime, timeZone\)/);
  assert.match(completedForm, /getZonedDateTimeInputValues\(initialDate, timeZone\)/);
  assert.doesNotMatch(completedForm, /getTimezoneOffset/);
  assert.match(scheduledForm, /getSubmittedLessonAtIsoFromForm\(event\.currentTarget, timeZone\)/);
  assert.match(scheduledForm, /getZonedDateTimeInputValues\(initialDate, timeZone\)/);
});

test("calendar queries use tutor-local month boundaries", () => {
  const calendarPage = readFileSync("src/app/(authed)/app/calendar/page.tsx", "utf8");
  const calendarGrid = readFileSync(
    "src/app/(authed)/app/calendar/calendar-grid.tsx",
    "utf8",
  );

  assert.match(calendarPage, /getMonthBoundsIso\(selectedMonthKey, timeZone\)/);
  assert.match(calendarPage, /getPlannedLessonAttention\(lesson\.lesson_at, now, timeZone\)/);
  assert.match(calendarGrid, /getDateKeyLocal\(lesson\.lessonAt, timeZone\)/);
  assert.doesNotMatch(calendarGrid, /Europe\/London/);
});

test("the database and Settings expose a backwards-compatible timezone preference", () => {
  const migration = readFileSync(
    "supabase/migrations/202608030000_add_user_time_zone.sql",
    "utf8",
  );
  const schema = readFileSync("supabase/schema.sql", "utf8");
  const settings = readFileSync("src/app/(authed)/app/settings/page.tsx", "utf8");

  assert.match(migration, /time_zone text not null default 'Europe\/London'/);
  assert.match(schema, /time_zone text not null default 'Europe\/London'/);
  assert.match(settings, /TimeZoneSettingsForm/);
});
