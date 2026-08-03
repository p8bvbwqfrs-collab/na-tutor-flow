import { formatCurrencyFromMinorUnits, type SupportedCurrencyCode } from "@/lib/currency";
import type { IncomeTrendPoint } from "@/lib/financial-reporting";

type IncomeTrendChartProps = {
  data: IncomeTrendPoint[];
  currencyCode: SupportedCurrencyCode;
};

function getBarClassName(point: IncomeTrendPoint) {
  if (point.state === "future") {
    return "border border-dashed border-zinc-300 bg-zinc-50";
  }

  if (point.state === "current") {
    return "bg-blue-300 group-hover:bg-blue-400 group-focus-visible:bg-blue-400";
  }

  return "bg-blue-700 group-hover:bg-blue-600 group-focus-visible:bg-blue-600";
}

export function IncomeTrendChart({ data, currencyCode }: IncomeTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-sm text-zinc-600">
        No income data yet.
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((point) => point.amountPence), 1);
  const labelStep = data.length > 10 ? Math.ceil(data.length / 6) : 1;

  return (
    <div>
      <ol
        className="flex min-w-0 items-end gap-1.5 border-b border-zinc-200 px-1 sm:gap-2"
        aria-label="Income received by period"
      >
        {data.map((point, index) => {
          const amountLabel = formatCurrencyFromMinorUnits(point.amountPence, currencyCode);
          const heightPercent =
            point.amountPence > 0 ? Math.max(8, Math.round((point.amountPence / maxAmount) * 78)) : 2;
          const showVisibleLabel = index === 0 || index === data.length - 1 || index % labelStep === 0;

          return (
            <li key={point.key} className="min-w-0 flex-1">
              <div
                className="group relative flex h-36 items-end justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                role="img"
                tabIndex={0}
                aria-label={`${point.accessibleLabel}: ${amountLabel}`}
              >
                <span className="pointer-events-none absolute left-1/2 top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-1 text-[10px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {amountLabel}
                </span>
                <span
                  className={`w-full max-w-10 rounded-t-sm transition-colors ${getBarClassName(point)}`}
                  style={{
                    height: point.state === "future" ? "6px" : `${heightPercent}%`,
                  }}
                  aria-hidden="true"
                />
              </div>
              <p
                className={`mt-2 truncate text-center text-[10px] sm:text-xs ${
                  point.state === "future" ? "text-zinc-400" : "text-zinc-600"
                }`}
                title={point.label}
                aria-hidden={!showVisibleLabel}
              >
                {showVisibleLabel ? point.label : "\u00a0"}
              </p>
            </li>
          );
        })}
      </ol>
      {data.some((point) => point.state === "current") ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-300" aria-hidden="true" />
          The lighter bar is still in progress.
        </p>
      ) : null}
    </div>
  );
}
