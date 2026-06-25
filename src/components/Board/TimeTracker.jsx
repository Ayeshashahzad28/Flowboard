import { formatDuration } from "../../utils/dateUtils";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../utils/permissions";

export default function TimeTracker({ task, compact }) {
  const { now, startTimer, pauseTimer } = useData();
  const { currentUser } = useAuth();

  const isRunning = task.timeTracking.isRunning;
  const runningByMe =
    isRunning && task.timeTracking.runningBy === currentUser.id;
  const runningByOther =
    isRunning && task.timeTracking.runningBy !== currentUser.id;

  const elapsed = isRunning
    ? task.timeTracking.totalSeconds +
      (now - task.timeTracking.startedAt) / 1000
    : task.timeTracking.totalSeconds;

  const allowed = can(currentUser.role, "trackTime");

  return (
    <div className={`time-tracker ${compact ? "time-tracker--compact" : ""}`}>
      <span
        className={`time-tracker__display ${isRunning ? "is-running" : ""}`}
        aria-live="polite"
      >
        {formatDuration(elapsed)}
      </span>
      {allowed && (
        <button
          type="button"
          className="icon-btn icon-btn--small"
          disabled={runningByOther}
          title={
            runningByOther
              ? "Timer running for another teammate"
              : runningByMe
                ? "Pause timer"
                : "Start timer"
          }
          onClick={(e) => {
            e.stopPropagation();
            if (runningByMe) pauseTimer(task.id);
            else if (!runningByOther) startTimer(task.id, currentUser.id);
          }}
        >
          {runningByMe ? "⏸" : "▶"}
        </button>
      )}
    </div>
  );
}
