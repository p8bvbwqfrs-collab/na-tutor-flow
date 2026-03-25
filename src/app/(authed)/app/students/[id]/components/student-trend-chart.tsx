type TrendPoint = {
  label: string;
  value: number;
};

type StudentTrendChartProps = {
  title: string;
  points: TrendPoint[];
};

export function StudentTrendChart({ title, points }: StudentTrendChartProps) {
  if (points.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        <p className="mt-2 text-xs text-zinc-600">No lesson data yet.</p>
      </div>
    );
  }

  const minValue = 1;
  const maxValue = 5;
  const chartWidth = 560;
  const chartHeight = 200;
  const leftPad = 22;
  const rightPad = 14;
  const topPad = 8;
  const bottomPad = 30;
  const plotWidth = chartWidth - leftPad - rightPad;
  const plotHeight = chartHeight - topPad - bottomPad;

  function getX(index: number) {
    if (points.length === 1) {
      return leftPad + plotWidth / 2;
    }

    return leftPad + (index / (points.length - 1)) * plotWidth;
  }

  function getY(value: number) {
    const clamped = Math.max(minValue, Math.min(maxValue, value));
    return topPad + ((maxValue - clamped) / (maxValue - minValue)) * plotHeight;
  }

  const plotBottom = topPad + plotHeight;
  const path =
    points.length > 1
      ? points
          .map((point, index) => `${getX(index)},${getY(point.value)}`)
          .join(" ")
      : "";

  const labelStep = points.length > 7 ? Math.ceil(points.length / 6) : 1;

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="mt-2 h-[200px] w-full" role="img" aria-label={title}>
        {[1, 2, 3, 4, 5].map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line x1={leftPad} y1={y} x2={chartWidth - rightPad} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x="4" y={y + 3} className="fill-zinc-500 text-[10px]">
                {tick}
              </text>
            </g>
          );
        })}

        {points.length > 1 ? (
          <polyline fill="none" stroke="#27272a" strokeWidth="1.75" points={path} />
        ) : null}

        {points.map((point, index) => {
          const x = getX(index);
          const y = getY(point.value);
          const shouldShowLabel =
            index === 0 || index === points.length - 1 || index % labelStep === 0;

          return (
            <g key={`${point.label}-${index}`}>
              <circle cx={x} cy={y} r="2.8" fill="#27272a" />
              {shouldShowLabel ? (
                <text x={x} y={plotBottom + 15} textAnchor="middle" className="fill-zinc-500 text-[10px]">
                  {point.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {points.length === 1 ? (
        <p className="mt-1 text-xs text-zinc-600">One lesson so far. Trend will appear after more lessons.</p>
      ) : null}
    </div>
  );
}
