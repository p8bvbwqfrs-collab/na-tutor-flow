"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrencyCode,
} from "@/lib/currency";

type CurrencySettingsFormProps = {
  userId: string;
  initialCurrencyCode: SupportedCurrencyCode;
};

export function CurrencySettingsForm({
  userId,
  initialCurrencyCode,
}: CurrencySettingsFormProps) {
  const [currencyCode, setCurrencyCode] = useState(initialCurrencyCode);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    const supabase = createSupabaseBrowserClient();

    setIsSaving(true);
    setSaved(false);
    setError(null);

    const { error: saveError } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          currency_code: currencyCode,
        },
        { onConflict: "user_id" },
      );

    setIsSaving(false);

    if (saveError) {
      setError("We couldn’t save your currency setting.");
      return;
    }

    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="mt-4">
      <label htmlFor="currency_code" className="block text-sm font-medium text-zinc-700">
        Currency
      </label>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <select
            id="currency_code"
            value={currencyCode}
            onChange={(event) => setCurrencyCode(event.target.value as SupportedCurrencyCode)}
            className="min-h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {SUPPORTED_CURRENCIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSaving ? "Saving..." : "Save currency"}
        </button>
      </div>
      <div className="mt-2 min-h-5">
        {saved ? <p className="text-sm text-emerald-700">Saved.</p> : null}
        {!saved && error ? <p className="text-sm text-rose-700">{error}</p> : null}
      </div>
    </div>
  );
}
