export const APP_SESSION_COOKIE_NAME = "tutor_flow_session";
export const APP_SESSION_DEADLINE_COOKIE_NAME = "tutor_flow_session_deadline";
export const APP_SESSION_TIMEOUT_SECONDS = 8 * 60 * 60;
export const APP_SESSION_TIMEOUT_MS = APP_SESSION_TIMEOUT_SECONDS * 1000;
export const SESSION_EXPIRED_MESSAGE =
  "Your session expired after 8 hours. Sign in again to continue.";

const APP_SESSION_COOKIE_VERSION = "v1";
const CLOCK_SKEW_TOLERANCE_MS = 5 * 60 * 1000;

type AppSessionClock = {
  sessionId: string;
  startedAt: number;
};

function isSensibleTimestamp(value: number, now: number) {
  return (
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= now + CLOCK_SKEW_TOLERANCE_MS
  );
}

export function readSessionIdFromAccessToken(accessToken: string | null | undefined) {
  if (!accessToken) {
    return null;
  }

  const payload = accessToken.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const claims = JSON.parse(atob(padded)) as { session_id?: unknown };
    return typeof claims.session_id === "string" && claims.session_id
      ? claims.session_id
      : null;
  } catch {
    return null;
  }
}

export function parseAppSessionClock(
  cookieValue: string | null | undefined,
  now = Date.now(),
): AppSessionClock | null {
  if (!cookieValue) {
    return null;
  }

  const [version, sessionId, rawStartedAt, ...unexpected] = cookieValue.split(".");
  const startedAt = Number(rawStartedAt);

  if (
    version !== APP_SESSION_COOKIE_VERSION ||
    !sessionId ||
    unexpected.length > 0 ||
    !isSensibleTimestamp(startedAt, now)
  ) {
    return null;
  }

  return { sessionId, startedAt };
}

export function getSessionStartedAt({
  cookieValue,
  sessionId,
  lastSignInAt,
  now = Date.now(),
}: {
  cookieValue: string | null | undefined;
  sessionId: string;
  lastSignInAt: string | null | undefined;
  now?: number;
}) {
  const existingClock = parseAppSessionClock(cookieValue, now);
  const authenticatedAt = lastSignInAt ? Date.parse(lastSignInAt) : Number.NaN;
  const hasAuthenticatedAt = isSensibleTimestamp(authenticatedAt, now);

  if (existingClock?.sessionId === sessionId) {
    return hasAuthenticatedAt
      ? Math.min(existingClock.startedAt, authenticatedAt)
      : existingClock.startedAt;
  }

  return hasAuthenticatedAt ? authenticatedAt : now;
}

export function serializeAppSessionClock(sessionId: string, startedAt: number) {
  return `${APP_SESSION_COOKIE_VERSION}.${sessionId}.${startedAt}`;
}

export function hasAppSessionExpired(startedAt: number, now = Date.now()) {
  return now - startedAt >= APP_SESSION_TIMEOUT_MS;
}

export function getAppSessionDeadline(startedAt: number) {
  return startedAt + APP_SESSION_TIMEOUT_MS;
}

export function readAppSessionDeadline(cookieHeader: string) {
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${APP_SESSION_DEADLINE_COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  const deadline = Number(cookie.slice(cookie.indexOf("=") + 1));
  return Number.isSafeInteger(deadline) && deadline > 0 ? deadline : null;
}

export function appSessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    maxAge: APP_SESSION_TIMEOUT_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure,
  };
}

export function appSessionDeadlineCookieOptions(secure: boolean) {
  return {
    ...appSessionCookieOptions(secure),
    httpOnly: false,
  };
}
