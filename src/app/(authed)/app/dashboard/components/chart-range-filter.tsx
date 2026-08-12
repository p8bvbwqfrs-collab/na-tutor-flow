"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import type { ReportingRange } from "@/lib/financial-reporting";
import { useNavigationFeedback } from "../../../components/navigation-feedback-provider";

type ChartRangeFilterProps = {
  selected: ReportingRange;
  basePath?: string;
  description: string;
};

const OPTIONS: Array<{ value: ReportingRange; label: string }> = [
  { value: "month", label: "This month" },
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
  { value: "all", label: "All time" },
];

function getRangeHref(range: ReportingRange, basePath: string) {
  return range === "month" ? basePath : `${basePath}?range=${range}`;
}

export function ChartRangeFilter({
  selected,
  basePath = "/app/dashboard",
  description,
}: ChartRangeFilterProps) {
  const router = useRouter();
  const { beginNavigation } = useNavigationFeedback();
  const selectId = useId();

  function changeRange(range: ReportingRange) {
    const href = getRangeHref(range, basePath);
    if (beginNavigation(href)) {
      router.push(href);
    }
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 sm:p-4">
      <div>
        <label htmlFor={selectId} className="text-sm font-semibold text-blue-950">
          Reporting period
        </label>
        <p className="mt-1 text-xs leading-5 text-blue-900 sm:text-sm">{description}</p>
      </div>

      <select
        id={selectId}
        value={selected}
        onChange={(event) => changeRange(event.target.value as ReportingRange)}
        className="mt-3 min-h-11 w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-base font-medium text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:hidden"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <nav className="mt-3 hidden flex-wrap gap-2 sm:flex" aria-label="Reporting period">
        {OPTIONS.map((option) => {
          const isSelected = option.value === selected;
          return (
            <Link
              key={option.value}
              href={getRangeHref(option.value, basePath)}
              className={`inline-flex min-h-10 items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                isSelected
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:underline"
              }`}
              aria-current={isSelected ? "page" : undefined}
            >
              {option.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
