"use client";

import { formatMonthLocal, getMonthKeyLocal } from "@/lib/datetime";

const monthButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:px-3";

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
  return new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + offset, 1))
    .toISOString()
    .slice(0, 7);
}

export function MonthControls({
  monthKey,
  onChange,
  label,
  timeZone,
}: {
  monthKey: string;
  onChange: (monthKey: string) => void;
  label: string;
  timeZone: string;
}) {
  const currentMonthKey = getMonthKeyLocal(new Date(), timeZone);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 sm:flex sm:items-center sm:justify-between sm:gap-4">
      <p className="px-1 text-sm text-zinc-600">
        <span className="font-medium text-zinc-900">{formatMonthLocal(monthKey)}</span>
        <span> · {label}</span>
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:mt-0 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={() => onChange(getAdjacentMonthKey(monthKey, -1))}
          className={monthButtonClassName}
          aria-label={`Show ${formatMonthLocal(getAdjacentMonthKey(monthKey, -1))}`}
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
          aria-label={`Show ${formatMonthLocal(getAdjacentMonthKey(monthKey, 1))}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
