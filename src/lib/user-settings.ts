import { DEFAULT_CURRENCY_CODE, normalizeCurrencyCode, type SupportedCurrencyCode } from "@/lib/currency";

export async function getUserCurrencyCode(
  supabase: { from: (table: string) => any },
): Promise<SupportedCurrencyCode> {
  const { data, error } = await supabase.from("user_settings").select("currency_code").maybeSingle();

  if (error || !data?.currency_code) {
    return DEFAULT_CURRENCY_CODE;
  }

  return normalizeCurrencyCode(data.currency_code);
}
