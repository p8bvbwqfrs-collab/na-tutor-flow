"use client";

import { useState } from "react";
import { COMMON_TIME_ZONES, isValidTimeZone } from "@/lib/datetime";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type TimeZoneSettingsFormProps = {
  userId: string;
  initialTimeZone: string;
};

export function TimeZoneSettingsForm({
  userId,
  initialTimeZone,
}: TimeZoneSettingsFormProps) {
  const [timeZone, setTimeZone] = useState(initialTimeZone);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const options = COMMON_TIME_ZONES.some((option) => option.value === initialTimeZone)
    ? COMMON_TIME_ZONES
    : [{ value: initialTimeZone, label: initialTimeZone }, ...COMMON_TIME_ZONES];

  async function onSave() {
    if (!isValidTimeZone(timeZone)) {
      setError("Choose a valid time zone.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    setIsSaving(true);
    setSaved(false);
    setError(null);

    const { error: saveError } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, time_zone: timeZone }, { onConflict: "user_id" });

    setIsSaving(false);

    if (saveError) {
      setError("We couldn’t save your time zone.");
      return;
    }

    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="mt-4 border-t border-zinc-100 pt-4">
      <label htmlFor="time_zone" className="block text-sm font-medium text-zinc-700">
        Time zone
      </label>
      <p id="time-zone-help" className="mt-1 text-sm leading-5 text-zinc-600">
        Lesson times, calendar days and reporting periods use this setting, even when you travel.
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <select
            id="time_zone"
            value={timeZone}
            onChange={(event) => setTimeZone(event.target.value)}
            aria-describedby="time-zone-help"
            className="min-h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSaving ? "Saving..." : "Save time zone"}
        </button>
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {saved ? <p className="text-sm text-emerald-700">Saved. New and existing dates now use this time zone.</p> : null}
        {!saved && error ? <p className="text-sm text-rose-700">{error}</p> : null}
      </div>
    </div>
  );
}
