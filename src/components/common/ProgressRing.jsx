export default function ProgressRing({
  percent = 0,
  size = 40,
  strokeWidth = 4,
  label,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div
      className="progress-ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label || `${percent}% complete`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <span className="progress-ring__label">{percent}%</span>
    </div>
  );
}
