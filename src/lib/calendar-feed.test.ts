import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, test } from "node:test";
import {
  generateCalendarFeedToken,
  getCalendarFeedSecret,
  isCalendarFeedTokenCurrent,
  verifyCalendarFeedToken,
} from "./calendar-feed";

const originalCalendarSecret = process.env.CALENDAR_FEED_SECRET;
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

beforeEach(() => {
  process.env.CALENDAR_FEED_SECRET = "calendar-test-secret";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "database-service-role-key";
});

afterEach(() => {
  if (originalCalendarSecret === undefined) {
    delete process.env.CALENDAR_FEED_SECRET;
  } else {
    process.env.CALENDAR_FEED_SECRET = originalCalendarSecret;
  }

  if (originalServiceRoleKey === undefined) {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  } else {
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
  }
});

test("calendar feed tokens carry their revocable per-user version", () => {
  const token = generateCalendarFeedToken("user-1", "tutoring", 4);
  const payload = verifyCalendarFeedToken(token, "tutoring");

  assert.deepEqual(payload, {
    userId: "user-1",
    feedType: "tutoring",
    tokenVersion: 4,
  });
  assert.equal(payload && isCalendarFeedTokenCurrent(payload, 4), true);
  assert.equal(payload && isCalendarFeedTokenCurrent(payload, 5), false);
});

test("legacy signed tokens remain version 1 until the user resets their link", () => {
  const payloadEncoded = Buffer.from(
    JSON.stringify({ userId: "legacy-user", feedType: "tutoring" }),
  ).toString("base64url");
  const signature = createHmac("sha256", "calendar-test-secret")
    .update(payloadEncoded)
    .digest("base64url");
  const payload = verifyCalendarFeedToken(`${payloadEncoded}.${signature}`, "tutoring");

  assert.equal(payload?.tokenVersion, 1);
  assert.equal(payload && isCalendarFeedTokenCurrent(payload, 1), true);
  assert.equal(payload && isCalendarFeedTokenCurrent(payload, 2), false);
});

test("the calendar signer never falls back to the database service-role key", () => {
  delete process.env.CALENDAR_FEED_SECRET;

  assert.equal(getCalendarFeedSecret(), null);
  assert.throws(
    () => generateCalendarFeedToken("user-1", "tutoring"),
    /Missing calendar feed signing secret/,
  );
});

test("tampered and wrong-feed tokens are rejected", () => {
  const token = generateCalendarFeedToken("user-1", "tutoring", 2);
  const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
  const wrongFeedPayload = Buffer.from(
    JSON.stringify({ userId: "user-1", feedType: "other", tokenVersion: 2 }),
  ).toString("base64url");
  const wrongFeedSignature = createHmac("sha256", "calendar-test-secret")
    .update(wrongFeedPayload)
    .digest("base64url");

  assert.equal(verifyCalendarFeedToken(tampered, "tutoring"), null);
  assert.equal(
    verifyCalendarFeedToken(`${wrongFeedPayload}.${wrongFeedSignature}`, "tutoring"),
    null,
  );
});
