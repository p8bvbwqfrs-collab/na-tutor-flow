import { NextRequest, NextResponse } from "next/server";
import { deleteAuthenticatedAccount } from "@/lib/account-deletion";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function clearSupabaseSessionCookies(request: NextRequest, response: NextResponse) {
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.set(cookie.name, "", {
        expires: new Date(0),
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
      });
    }
  });
}

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");

  if (!requestOrigin || requestOrigin !== request.nextUrl.origin) {
    return NextResponse.json(
      { ok: false, error: "This account deletion request could not be verified." },
      { status: 403 },
    );
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json(
      { ok: false, error: "This account deletion request was not valid." },
      { status: 415 },
    );
  }

  let confirmationEmail = "";

  try {
    const body = (await request.json()) as { confirmationEmail?: unknown };
    confirmationEmail =
      typeof body.confirmationEmail === "string" ? body.confirmationEmail : "";
  } catch {
    return NextResponse.json(
      { ok: false, error: "This account deletion request was not valid." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const result = await deleteAuthenticatedAccount(
    {
      getAuthenticatedUser: async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          return null;
        }

        return { id: user.id, email: user.email ?? null };
      },
      deleteAuthenticatedUser: async (userId) => {
        const { error } = await admin.auth.admin.deleteUser(userId);

        if (error) {
          console.error("Could not permanently delete authenticated account", {
            userId,
            error: error.message,
          });
        }

        return { error: error?.message ?? null };
      },
    },
    confirmationEmail,
  );

  const response = NextResponse.json(result, {
    status: result.ok ? 200 : result.status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });

  if (result.ok) {
    clearSupabaseSessionCookies(request, response);
  }

  return response;
}
