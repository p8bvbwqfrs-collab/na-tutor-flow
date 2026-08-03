import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDateLocal,
  formatTimeLocal,
  getDateKeyLocal,
  getMonthBoundsIso,
  getZonedDateTimeInputValues,
  isValidTimeZone,
  zonedDateTimeToIso,
} from "./datetime";

test("converts tutor wall-clock times independently of the device time zone", () => {
  assert.equal(
    zonedDateTimeToIso("2026-07-15", "18:00", "Europe/London"),
    "2026-07-15T17:00:00.000Z",
  );
  assert.equal(
    zonedDateTimeToIso("2026-07-15", "18:00", "America/New_York"),
    "2026-07-15T22:00:00.000Z",
  );
  assert.equal(
    zonedDateTimeToIso("2026-01-15", "18:00", "America/New_York"),
    "2026-01-15T23:00:00.000Z",
  );
});

test("restores the saved wall-clock time in the tutor time zone", () => {
  assert.deepEqual(
    getZonedDateTimeInputValues("2026-07-15T22:00:00.000Z", "America/New_York"),
    { date: "2026-07-15", time: "18:00" },
  );
  assert.equal(formatTimeLocal("2026-07-15T22:00:00.000Z", "America/New_York"), "18:00");
  assert.equal(formatTimeLocal("2026-07-15T22:00:00.000Z", "Europe/London"), "23:00");
});

test("rejects wall-clock times skipped by daylight-saving changes", () => {
  assert.throws(
    () => zonedDateTimeToIso("2026-03-29", "01:30", "Europe/London"),
    /does not exist/,
  );
  assert.throws(
    () => zonedDateTimeToIso("2026-03-08", "02:30", "America/New_York"),
    /does not exist/,
  );
});

test("resolves repeated autumn times to the first occurrence deterministically", () => {
  assert.equal(
    zonedDateTimeToIso("2026-10-25", "01:30", "Europe/London"),
    "2026-10-25T00:30:00.000Z",
  );
  assert.equal(
    zonedDateTimeToIso("2026-11-01", "01:30", "America/New_York"),
    "2026-11-01T05:30:00.000Z",
  );
});

test("builds calendar query bounds at local midnight", () => {
  assert.deepEqual(getMonthBoundsIso("2026-08", "Europe/London"), {
    startIso: "2026-07-31T23:00:00.000Z",
    endIso: "2026-08-31T23:00:00.000Z",
  });
  assert.deepEqual(getMonthBoundsIso("2026-08", "America/New_York"), {
    startIso: "2026-08-01T04:00:00.000Z",
    endIso: "2026-09-01T04:00:00.000Z",
  });
});

test("date-only payment values stay on their recorded date", () => {
  assert.equal(getDateKeyLocal("2026-08-01", "America/Los_Angeles"), "2026-08-01");
  assert.equal(formatDateLocal("2026-08-01", "America/Los_Angeles"), "01 Aug 2026");
});

test("validates IANA time-zone identifiers", () => {
  assert.equal(isValidTimeZone("America/New_York"), true);
  assert.equal(isValidTimeZone("Not/A_Time_Zone"), false);
});
