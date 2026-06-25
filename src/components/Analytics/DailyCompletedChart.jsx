export default function DailyCompletedChart({ data }) {
  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 32, left: 32 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(1, ...data.map((d) => d.count));
  const barGap = 10;
  const barWidth = innerW / data.length - barGap;

  const yTicks = Array.from({ length: max + 1 }, (_, i) => i).filter(
    (_, i, arr) => arr.length <= 6 || i % Math.ceil(arr.length / 5) === 0,
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="chart-svg"
      role="img"
      aria-label={`Daily completed tasks over the last ${data.length} days, peak of ${max} tasks`}
    >
      {yTicks.map((tick) => {
        const y = padding.top + innerH - (tick / max) * innerH;
        return (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              className="chart-gridline"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="chart-axis-label"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const barH = (d.count / max) * innerH;
        const x = padding.left + i * (barWidth + barGap);
        const y = padding.top + innerH - barH;
        const label = new Date(d.date + "T00:00:00").toLocaleDateString(
          undefined,
          { day: "numeric", month: "short" },
        );
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={Math.max(barWidth, 4)}
              height={Math.max(barH, 1)}
              rx={3}
              className="chart-bar"
            >
              <title>{`${label}: ${d.count} completed`}</title>
            </rect>
            {d.count > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="chart-bar-value"
              >
                {d.count}
              </text>
            )}
            <text
              x={x + barWidth / 2}
              y={height - 10}
              textAnchor="middle"
              className="chart-axis-label"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
