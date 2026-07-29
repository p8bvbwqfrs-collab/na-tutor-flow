import assert from "node:assert/strict";
import test from "node:test";
import { resetCalendarFeedLink } from "./calendar-feed-reset";

test("calendar link reset requires an authenticated user", async () => {
  let rotationCalls = 0;
  const result = await resetCalendarFeedLink({
    getAuthenticatedUserId: async () => null,
    rotateTokenVersion: async () => {
      rotationCalls += 1;
      return { version: 2, error: null };
    },
  });

  assert.equal(result.ok, false);
  assert.equal(rotationCalls, 0);
});

test("calendar link reset returns the atomically incremented version", async () => {
  const result = await resetCalendarFeedLink({
    getAuthenticatedUserId: async () => "user-1",
    rotateTokenVersion: async () => ({ version: 3, error: null }),
  });

  assert.deepEqual(result, { ok: true, version: 3 });
});

test("calendar link reset never reports success after a database failure", async () => {
  const result = await resetCalendarFeedLink({
    getAuthenticatedUserId: async () => "user-1",
    rotateTokenVersion: async () => ({ version: null, error: "database unavailable" }),
  });

  assert.deepEqual(result, {
    ok: false,
    error: "We couldn’t reset your calendar link. Please try again.",
  });
});
