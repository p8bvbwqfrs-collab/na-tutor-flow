type TrendPoint = {
  label: string;
  confidence: number;
  effort: number;
};

type StudentTrendChartProps = {
  points: TrendPoint[];
};

export function StudentTrendChart({ points }: StudentTrendChartProps) {
  if (points.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5">
        <p className="text-sm font-medium text-zinc-900">No learning trend yet</p>
        <p className="mt-1 text-sm text-zinc-600">
          Confidence and effort will appear here after the first completed lesson.
        </p>
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
  const confidencePath =
    points.length > 1
      ? points
          .map((point, index) => `${getX(index)},${getY(point.confidence)}`)
          .join(" ")
      : "";
  const effortPath =
    points.length > 1
      ? points
          .map((point, index) => `${getX(index)},${getY(point.effort)}`)
          .join(" ")
      : "";

  const labelStep = points.length > 7 ? Math.ceil(points.length / 6) : 1;

  const latestPoint = points[points.length - 1];
  const accessibleSummary = points
    .map(
      (point) =>
        `${point.label}: confidence ${point.confidence} out of 5, effort ${point.effort} out of 5`,
    )
    .join("; ");

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-3 text-xs font-medium text-zinc-700" aria-hidden="true">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-700" /> Confidence
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Effort
          </span>
        </div>
        <p className="text-xs text-zinc-600">
          Latest: confidence {latestPoint.confidence}/5 · effort {latestPoint.effort}/5
        </p>
      </div>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="mt-2 h-[180px] w-full"
        role="img"
        aria-label={`Recent learning trend. ${accessibleSummary}`}
      >
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
          <>
            <polyline fill="none" stroke="#1d4ed8" strokeWidth="2" points={confidencePath} />
            <polyline fill="none" stroke="#059669" strokeWidth="2" points={effortPath} />
          </>
        ) : null}

        {points.map((point, index) => {
          const x = getX(index);
          const confidenceY = getY(point.confidence);
          const effortY = getY(point.effort);
          const shouldShowLabel =
            index === 0 || index === points.length - 1 || index % labelStep === 0;

          return (
            <g key={`${point.label}-${index}`}>
              <circle cx={x} cy={confidenceY} r="3" fill="#1d4ed8" />
              <circle cx={x} cy={effortY} r="3" fill="#059669" />
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
        <p className="mt-1 text-xs text-zinc-600">
          One lesson so far. The direction will become clearer after more lessons.
        </p>
      ) : null}
    </div>
  );
}
