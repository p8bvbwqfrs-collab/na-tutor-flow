import Link from "next/link";

export type ChartRange = "3m" | "6m" | "12m" | "all";

type ChartRangeFilterProps = {
  selected: ChartRange;
};

const OPTIONS: Array<{ value: ChartRange; label: string }> = [
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
  { value: "all", label: "All time" },
];

export function ChartRangeFilter({ selected }: ChartRangeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Link
            key={option.value}
            href={option.value === "6m" ? "/app/dashboard" : `/app/dashboard?range=${option.value}`}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              isSelected
                ? "border-zinc-800 bg-zinc-800 text-white"
                : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:underline"
            }`}
            aria-current={isSelected ? "page" : undefined}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
