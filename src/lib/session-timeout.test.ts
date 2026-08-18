import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  APP_SESSION_COOKIE_NAME,
  APP_SESSION_DEADLINE_COOKIE_NAME,
  APP_SESSION_TIMEOUT_MS,
  APP_SESSION_TIMEOUT_SECONDS,
  SESSION_EXPIRED_MESSAGE,
  appSessionDeadlineCookieOptions,
  appSessionCookieOptions,
  getAppSessionDeadline,
  getSessionStartedAt,
  hasAppSessionExpired,
  parseAppSessionClock,
  readAppSessionDeadline,
  readSessionIdFromAccessToken,
  serializeAppSessionClock,
} from "./session-timeout";

const NOW = Date.parse("2026-08-18T12:00:00.000Z");

function accessTokenWithSessionId(sessionId: string) {
  const payload = Buffer.from(JSON.stringify({ session_id: sessionId })).toString(
    "base64url",
  );
  return `header.${payload}.signature`;
}

test("the free session policy is a fixed eight-hour maximum", () => {
  assert.equal(APP_SESSION_TIMEOUT_SECONDS, 28_800);
  assert.equal(APP_SESSION_TIMEOUT_MS, 28_800_000);
  assert.match(SESSION_EXPIRED_MESSAGE, /expired after 8 hours/i);
});

test("reads the stable Supabase session id from the access token", () => {
  assert.equal(readSessionIdFromAccessToken(accessTokenWithSessionId("session-1")), "session-1");
  assert.equal(readSessionIdFromAccessToken("not-a-token"), null);
});

test("keeps the original clock when refreshed tokens belong to the same session", () => {
  const startedAt = NOW - 60_000;
  const cookieValue = serializeAppSessionClock("session-1", startedAt);

  assert.equal(
    getSessionStartedAt({
      cookieValue,
      sessionId: "session-1",
      lastSignInAt: new Date(NOW).toISOString(),
      now: NOW,
    }),
    startedAt,
  );
});

test("a genuinely new Supabase session receives a new clock", () => {
  const lastSignInAt = NOW - 30_000;

  assert.equal(
    getSessionStartedAt({
      cookieValue: serializeAppSessionClock("old-session", NOW - 3_600_000),
      sessionId: "new-session",
      lastSignInAt: new Date(lastSignInAt).toISOString(),
      now: NOW,
    }),
    lastSignInAt,
  );
});

test("invalid or future cookie clocks cannot extend the session", () => {
  const lastSignInAt = NOW - 120_000;

  assert.equal(
    getSessionStartedAt({
      cookieValue: serializeAppSessionClock("session-1", NOW + 10 * 60_000),
      sessionId: "session-1",
      lastSignInAt: new Date(lastSignInAt).toISOString(),
      now: NOW,
    }),
    lastSignInAt,
  );
});

test("a matching cookie can never move the authenticated start time later", () => {
  const authenticatedAt = NOW - 3_600_000;

  assert.equal(
    getSessionStartedAt({
      cookieValue: serializeAppSessionClock("session-1", NOW - 60_000),
      sessionId: "session-1",
      lastSignInAt: new Date(authenticatedAt).toISOString(),
      now: NOW,
    }),
    authenticatedAt,
  );
});

test("expires at the eight-hour boundary but not immediately before it", () => {
  assert.equal(hasAppSessionExpired(NOW - APP_SESSION_TIMEOUT_MS + 1, NOW), false);
  assert.equal(hasAppSessionExpired(NOW - APP_SESSION_TIMEOUT_MS, NOW), true);
});

test("session cookies are server-only and suitable for production", () => {
  const value = serializeAppSessionClock("session-1", NOW);
  assert.deepEqual(parseAppSessionClock(value, NOW), {
    sessionId: "session-1",
    startedAt: NOW,
  });
  assert.equal(APP_SESSION_COOKIE_NAME, "tutor_flow_session");
  assert.deepEqual(appSessionCookieOptions(true), {
    httpOnly: true,
    maxAge: 28_800,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  assert.equal(APP_SESSION_DEADLINE_COOKIE_NAME, "tutor_flow_session_deadline");
  assert.deepEqual(appSessionDeadlineCookieOptions(true), {
    httpOnly: false,
    maxAge: 28_800,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
});

test("the browser guard receives the same fixed deadline as middleware", () => {
  const deadline = getAppSessionDeadline(NOW);
  const cookieHeader = `other=value; ${APP_SESSION_DEADLINE_COOKIE_NAME}=${deadline}`;

  assert.equal(deadline, NOW + APP_SESSION_TIMEOUT_MS);
  assert.equal(readAppSessionDeadline(cookieHeader), deadline);
  assert.equal(readAppSessionDeadline("other=value"), null);
  assert.equal(
    readAppSessionDeadline(`${APP_SESSION_DEADLINE_COOKIE_NAME}=invalid`),
    null,
  );
});

test("protected app routes enforce expiry and clear the Supabase session", () => {
  const middlewareSource = readFileSync("middleware.ts", "utf8");

  assert.match(middlewareSource, /matcher:\s*\["\/app\/:path\*"\]/);
  assert.match(middlewareSource, /hasAppSessionExpired\(startedAt\)/);
  assert.match(middlewareSource, /supabase\.auth\.signOut\(\{ scope: "local" \}\)/);
  assert.match(middlewareSource, /SESSION_EXPIRED_MESSAGE/);

  const layoutSource = readFileSync("src/app/(authed)/layout.tsx", "utf8");
  const guardSource = readFileSync(
    "src/app/(authed)/components/session-timeout-guard.tsx",
    "utf8",
  );
  assert.match(layoutSource, /<SessionTimeoutGuard \/>/);
  assert.match(guardSource, /window\.location\.replace\("\/app\/dashboard"\)/);
});
