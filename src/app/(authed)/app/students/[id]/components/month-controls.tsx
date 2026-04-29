"use client";

import { formatMonthLocal, getMonthKeyLocal } from "@/lib/datetime";

const monthButtonClassName =
  "inline-flex min-h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

export function getMonthStartFromKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  if (!year || !month || month < 1 || month > 12) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  return new Date(Date.UTC(year, month - 1, 1));
}

export function getAdjacentMonthKey(monthKey: string, offset: number) {
  const monthStart = getMonthStartFromKey(monthKey);
  return getMonthKeyLocal(new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + offset, 1)));
}

export function MonthControls({
  monthKey,
  onChange,
  label,
}: {
  monthKey: string;
  onChange: (monthKey: string) => void;
  label: string;
}) {
  const currentMonthKey = getMonthKeyLocal(new Date());
  const monthStart = getMonthStartFromKey(monthKey);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-600">
        {formatMonthLocal(monthStart)} · {label}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(getAdjacentMonthKey(monthKey, -1))}
          className={monthButtonClassName}
          aria-label={`Show ${formatMonthLocal(getMonthStartFromKey(getAdjacentMonthKey(monthKey, -1)))}`}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onChange(currentMonthKey)}
          className={monthButtonClassName}
          aria-label="Show this month"
        >
          This month
        </button>
        <button
          type="button"
          onClick={() => onChange(getAdjacentMonthKey(monthKey, 1))}
          className={monthButtonClassName}
          aria-label={`Show ${formatMonthLocal(getMonthStartFromKey(getAdjacentMonthKey(monthKey, 1)))}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
