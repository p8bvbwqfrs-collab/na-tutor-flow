export const SUPPORTED_CURRENCIES = ["GBP", "USD", "EUR", "AUD"] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY_CODE: SupportedCurrencyCode = "GBP";

export function normalizeCurrencyCode(value: string | null | undefined): SupportedCurrencyCode {
  if (value && SUPPORTED_CURRENCIES.includes(value as SupportedCurrencyCode)) {
    return value as SupportedCurrencyCode;
  }

  return DEFAULT_CURRENCY_CODE;
}

export function formatCurrencyFromMinorUnits(
  amountMinorUnits: number,
  currencyCode: SupportedCurrencyCode = DEFAULT_CURRENCY_CODE,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    ...options,
  }).format(amountMinorUnits / 100);
}

export function getCurrencyLabel(currencyCode: SupportedCurrencyCode = DEFAULT_CURRENCY_CODE) {
  return `Fee (${currencyCode})`;
}
