import Link from "next/link";
import type { ReportingRange } from "@/lib/financial-reporting";

type ChartRangeFilterProps = {
  selected: ReportingRange;
  basePath?: string;
};

const OPTIONS: Array<{ value: ReportingRange; label: string }> = [
  { value: "month", label: "This month" },
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
  { value: "all", label: "All time" },
];

export function ChartRangeFilter({ selected, basePath = "/app/dashboard" }: ChartRangeFilterProps) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Reporting timeframe">
      {OPTIONS.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Link
            key={option.value}
            href={option.value === "month" ? basePath : `${basePath}?range=${option.value}`}
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
  );
}
