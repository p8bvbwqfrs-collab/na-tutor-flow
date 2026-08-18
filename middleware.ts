import { NextRequest, NextResponse } from "next/server";
import {
  APP_SESSION_COOKIE_NAME,
  APP_SESSION_DEADLINE_COOKIE_NAME,
  SESSION_EXPIRED_MESSAGE,
  appSessionDeadlineCookieOptions,
  appSessionCookieOptions,
  getAppSessionDeadline,
  getSessionStartedAt,
  hasAppSessionExpired,
  readSessionIdFromAccessToken,
  serializeAppSessionClock,
} from "@/lib/session-timeout";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/server";

function createExpiredSessionRedirect(
  request: NextRequest,
  response: NextResponse,
) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("error", SESSION_EXPIRED_MESSAGE);
  const redirectResponse = NextResponse.redirect(loginUrl);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-")) {
      redirectResponse.cookies.set(cookie.name, "", {
        expires: new Date(0),
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
      });
    }
  });

  redirectResponse.cookies.set(APP_SESSION_COOKIE_NAME, "", {
    ...appSessionCookieOptions(request.nextUrl.protocol === "https:"),
    expires: new Date(0),
    maxAge: 0,
  });
  redirectResponse.cookies.set(APP_SESSION_DEADLINE_COOKIE_NAME, "", {
    ...appSessionDeadlineCookieOptions(request.nextUrl.protocol === "https:"),
    expires: new Date(0),
    maxAge: 0,
  });

  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "Please sign in to continue.");
    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const sessionId = readSessionIdFromAccessToken(session?.access_token);

  if (!sessionId) {
    await supabase.auth.signOut({ scope: "local" });
    return createExpiredSessionRedirect(request, response);
  }

  const startedAt = getSessionStartedAt({
    cookieValue: request.cookies.get(APP_SESSION_COOKIE_NAME)?.value,
    sessionId,
    lastSignInAt: user.last_sign_in_at,
  });

  if (hasAppSessionExpired(startedAt)) {
    await supabase.auth.signOut({ scope: "local" });
    return createExpiredSessionRedirect(request, response);
  }

  response.cookies.set(
    APP_SESSION_COOKIE_NAME,
    serializeAppSessionClock(sessionId, startedAt),
    appSessionCookieOptions(request.nextUrl.protocol === "https:"),
  );
  response.cookies.set(
    APP_SESSION_DEADLINE_COOKIE_NAME,
    String(getAppSessionDeadline(startedAt)),
    appSessionDeadlineCookieOptions(request.nextUrl.protocol === "https:"),
  );

  return response;
}

export const config = {
  matcher: ["/app/:path*"],
};
