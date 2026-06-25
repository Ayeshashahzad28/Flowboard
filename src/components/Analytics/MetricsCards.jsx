import { formatDuration } from "../../utils/dateUtils";

export default function MetricsCards({ metrics }) {
  const cards = [
    { label: "Total tasks", value: metrics.total, tone: "neutral" },
    { label: "Completed", value: metrics.completed, tone: "success" },
    { label: "In progress", value: metrics.inProgress, tone: "neutral" },
    { label: "Overdue", value: metrics.overdue, tone: "danger" },
    {
      label: "Completion rate",
      value: `${metrics.completionRate}%`,
      tone: "accent",
    },
    {
      label: "Avg time / completed task",
      value: formatDuration(metrics.avgSeconds),
      tone: "neutral",
    },
  ];

  return (
    <div className="metrics-grid">
      {cards.map((c) => (
        <div key={c.label} className={`metric-card metric-card--${c.tone}`}>
          <span className="metric-card__value">{c.value}</span>
          <span className="metric-card__label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
