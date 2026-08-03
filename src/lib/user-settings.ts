import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_CURRENCY_CODE, normalizeCurrencyCode, type SupportedCurrencyCode } from "@/lib/currency";
import {
  INITIAL_CALENDAR_FEED_VERSION,
  normalizeCalendarFeedVersion,
} from "@/lib/calendar-feed";
import { DEFAULT_TIME_ZONE, isValidTimeZone } from "@/lib/datetime";

export async function getUserCurrencyCode(
  supabase: SupabaseClient,
): Promise<SupportedCurrencyCode> {
  const { data, error } = await supabase.from("user_settings").select("currency_code").maybeSingle();

  if (error || typeof data?.currency_code !== "string") {
    return DEFAULT_CURRENCY_CODE;
  }

  return normalizeCurrencyCode(data.currency_code);
}

export async function getUserCalendarFeedVersion(
  supabase: SupabaseClient,
  userId?: string,
) {
  let query = supabase.from("user_settings").select("calendar_feed_version");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return INITIAL_CALENDAR_FEED_VERSION;
  }

  return normalizeCalendarFeedVersion(data.calendar_feed_version);
}

export async function getUserTimeZone(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.from("user_settings").select("time_zone").maybeSingle();

  if (error || typeof data?.time_zone !== "string" || !isValidTimeZone(data.time_zone)) {
    return DEFAULT_TIME_ZONE;
  }

  return data.time_zone;
}
