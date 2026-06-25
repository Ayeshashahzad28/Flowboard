export default function BurndownChart({ data }) {
  const width = 640;
  const height = 260;
  const padding = { top: 16, right: 16, bottom: 32, left: 32 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(1, ...data.map((d) => Math.max(d.remaining, d.ideal)));
  const stepX = innerW / (data.length - 1 || 1);

  const pointFor = (value, idx) => {
    const x = padding.left + idx * stepX;
    const y = padding.top + innerH - (value / max) * innerH;
    return [x, y];
  };

  const pathFor = (key) =>
    data
      .map((d, i) => {
        const [x, y] = pointFor(d[key], i);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const labelEvery = Math.ceil(data.length / 7);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="chart-svg"
      role="img"
      aria-label={`Burndown chart comparing ideal versus actual remaining tasks across ${data.length} days`}
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

      <path
        d={pathFor("ideal")}
        className="chart-line chart-line--ideal"
        fill="none"
      />
      <path
        d={pathFor("remaining")}
        className="chart-line chart-line--actual"
        fill="none"
      />

      {data.map((d, i) => {
        const [x, y] = pointFor(d.remaining, i);
        const label = new Date(d.date + "T00:00:00").toLocaleDateString(
          undefined,
          { day: "numeric", month: "short" },
        );
        return (
          <g key={d.date}>
            <circle cx={x} cy={y} r={3} className="chart-line--actual-dot" />
            {i % labelEvery === 0 && (
              <text
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="chart-axis-label"
              >
                {label}
              </text>
            )}
            <title>{`${label}: ${d.remaining} remaining (ideal ${d.ideal})`}</title>
          </g>
        );
      })}

      <g className="chart-legend" transform={`translate(${width - 150}, 8)`}>
        <line
          x1="0"
          y1="6"
          x2="18"
          y2="6"
          className="chart-line chart-line--ideal"
        />
        <text x="24" y="10" className="chart-axis-label">
          Ideal
        </text>
        <line
          x1="0"
          y1="22"
          x2="18"
          y2="22"
          className="chart-line chart-line--actual"
        />
        <text x="24" y="26" className="chart-axis-label">
          Actual
        </text>
      </g>
    </svg>
  );
}
