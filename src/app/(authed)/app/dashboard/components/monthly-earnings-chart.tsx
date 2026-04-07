type MonthlyPoint = {
  month: string;
  amountPence: number;
};

type MonthlyEarningsChartProps = {
  data: MonthlyPoint[];
};

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function MonthlyEarningsChart({ data }: MonthlyEarningsChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-sm text-zinc-600">
        No earnings data yet.
      </div>
    );
  }

  const chartWidth = 640;
  const chartHeight = 200;
  const leftPad = 42;
  const rightPad = 14;
  const topPad = 10;
  const bottomPad = 32;
  const plotWidth = chartWidth - leftPad - rightPad;
  const plotHeight = chartHeight - topPad - bottomPad;

  const maxAmount = Math.max(...data.map((point) => point.amountPence), 1);
  const niceTopRaw = Math.ceil(maxAmount / 5000) * 5000;
  const yMax = Math.max(niceTopRaw, 10000);
  const yTicks = 4;

  function getX(index: number) {
    if (data.length === 1) {
      return leftPad + plotWidth / 2;
    }

    return leftPad + (index / (data.length - 1)) * plotWidth;
  }

  function getY(amountPence: number) {
    return topPad + ((yMax - amountPence) / yMax) * plotHeight;
  }

  const points = data.map((point, index) => ({
    ...point,
    x: getX(index),
    y: getY(point.amountPence),
  }));
  const pathData = points.map((point) => `${point.x},${point.y}`).join(" ");
  const xLabelStep = data.length > 8 ? Math.ceil(data.length / 6) : 1;
  const plotBottom = topPad + plotHeight;

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="h-[160px] w-full sm:h-[180px] lg:h-[200px]"
      role="img"
      aria-label="Monthly earnings line chart"
    >
      {Array.from({ length: yTicks + 1 }, (_, tickIndex) => {
        const tickValue = Math.round((yMax / yTicks) * tickIndex);
        const y = getY(tickValue);
        return (
          <g key={tickValue}>
            <line x1={leftPad} y1={y} x2={chartWidth - rightPad} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x="0" y={y + 4} className="fill-zinc-500 text-[10px]">
              {currencyFormatter.format(tickValue / 100)}
            </text>
          </g>
        );
      })}

      {points.length > 1 ? <polyline fill="none" stroke="#334155" strokeWidth="1.5" points={pathData} /> : null}

      {points.map((point, index) => {
        const showLabel =
          index === 0 || index === data.length - 1 || index % xLabelStep === 0;
        return (
          <g key={`${point.month}-${index}`}>
            <circle cx={point.x} cy={point.y} r="2.6" fill="#334155" />
            {showLabel ? (
              <text x={point.x} y={plotBottom + 16} textAnchor="middle" className="fill-zinc-500 text-[10px]">
                {point.month}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
