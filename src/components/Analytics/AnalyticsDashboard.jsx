import { useMemo } from "react";
import MetricsCards from "./MetricsCards";
import DailyCompletedChart from "./DailyCompletedChart";
import BurndownChart from "./BurndownChart";
import {
  computeMetrics,
  dailyCompletedSeries,
  burndownSeries,
  priorityBreakdown,
} from "../../utils/analytics";

export default function AnalyticsDashboard({ tasks }) {
  const metrics = useMemo(() => computeMetrics(tasks), [tasks]);
  const daily = useMemo(() => dailyCompletedSeries(tasks, 10), [tasks]);
  const burndown = useMemo(() => burndownSeries(tasks, 14), [tasks]);
  const priorities = useMemo(() => priorityBreakdown(tasks), [tasks]);
  const maxPriority = Math.max(1, ...Object.values(priorities));

  return (
    <div className="analytics">
      <h1 className="view-title">Analytics</h1>
      <p className="view-subtitle">
        Productivity metrics computed live from the current board state.
      </p>

      <MetricsCards metrics={metrics} />

      <div className="analytics-grid">
        <section className="chart-card">
          <h2>Daily completed tasks</h2>
          <p className="chart-card__sub">Last 10 days</p>
          <DailyCompletedChart data={daily} />
        </section>

        <section className="chart-card">
          <h2>Burndown</h2>
          <p className="chart-card__sub">
            Remaining tasks vs. ideal pace, 14-day window
          </p>
          <BurndownChart data={burndown} />
        </section>

        <section className="chart-card">
          <h2>Priority mix</h2>
          <p className="chart-card__sub">Open and closed tasks by priority</p>
          <div className="priority-bars">
            {Object.entries(priorities).map(([label, count]) => (
              <div key={label} className="priority-bar-row">
                <span className="priority-bar-row__label">{label}</span>
                <div className="priority-bar-row__track">
                  <div
                    className={`priority-bar-row__fill priority-bar-row__fill--${label.toLowerCase()}`}
                    style={{ width: `${(count / maxPriority) * 100}%` }}
                  />
                </div>
                <span className="priority-bar-row__count">{count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
