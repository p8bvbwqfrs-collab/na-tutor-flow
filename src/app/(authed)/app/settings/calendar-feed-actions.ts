"use server";

import { revalidatePath } from "next/cache";
import { resetCalendarFeedLink } from "@/lib/calendar-feed-reset";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function resetTutoringCalendarFeed() {
  const supabase = await createSupabaseServerClient();

  const result = await resetCalendarFeedLink({
    getAuthenticatedUserId: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      return error ? null : user?.id ?? null;
    },
    rotateTokenVersion: async () => {
      const { data, error } = await supabase.rpc("rotate_calendar_feed_version");

      if (error) {
        console.error("Could not reset calendar feed link", {
          message: error.message,
        });
      }

      return {
        version: typeof data === "number" ? data : null,
        error: error?.message ?? null,
      };
    },
  });

  if (result.ok) {
    revalidatePath("/app/settings");
  }

  return result;
}
