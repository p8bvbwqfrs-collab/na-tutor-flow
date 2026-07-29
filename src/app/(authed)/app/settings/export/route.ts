import { NextResponse } from "next/server";
import {
  ACCOUNT_DATA_EXPORT_COLUMNS,
  ACCOUNT_DATA_EXPORT_SETTINGS_COLUMNS,
  accountDataExportFilename,
  createAccountDataExport,
  serializeAccountDataExport,
  type AccountDataExportTable,
} from "@/lib/account-data-export";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const result = await createAccountDataExport({
    getAuthenticatedUser: async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email ?? null,
        createdAt: data.user.created_at,
      };
    },
    fetchSettings: async (userId) => {
      const { data, error } = await supabase
        .from("user_settings")
        .select(ACCOUNT_DATA_EXPORT_SETTINGS_COLUMNS)
        .eq("user_id", userId)
        .maybeSingle();

      return {
        settings: data as Record<string, unknown> | null,
        error: error?.message ?? null,
      };
    },
    fetchOwnedPage: async (
      table: AccountDataExportTable,
      userId,
      from,
      to,
    ) => {
      const { data, error } = await supabase
        .from(table)
        .select(ACCOUNT_DATA_EXPORT_COLUMNS[table])
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to);

      return {
        rows: (data ?? []) as unknown as Record<string, unknown>[],
        error: error?.message ?? null,
      };
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      {
        status: result.status,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }

  const generatedAt = result.data.export.generated_at;

  return new NextResponse(serializeAccountDataExport(result.data), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${accountDataExportFilename(generatedAt)}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
