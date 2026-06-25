import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import ProgressRing from "../common/ProgressRing";
import TimeTracker from "./TimeTracker";
import {
  useData,
  computeCompletion,
  isTaskLocked,
  COLUMNS,
} from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { formatDueLabel, isOverdue } from "../../utils/dateUtils";
import { can } from "../../utils/permissions";

const PRIORITY_TONE = { High: "danger", Medium: "warning", Low: "neutral" };

export default function TaskCard({ task, onOpen, dragProps }) {
  const { usersById, moveTaskTo } = useData();
  const { currentUser } = useAuth();

  const completion = computeCompletion(task);
  const overdue = isOverdue(task.dueDate, task.columnId === "done");
  const locked = isTaskLocked(task, currentUser.id);
  const canMove = can(currentUser.role, "moveTask");
  const assignees = task.assignees.map((id) => usersById[id]).filter(Boolean);

  return (
    <article
      className={`task-card priority-${task.priority.toLowerCase()} ${locked ? "is-locked" : ""}`}
      draggable={canMove}
      onDragStart={canMove ? dragProps.onDragStart : undefined}
      onDragEnd={canMove ? dragProps.onDragEnd : undefined}
      tabIndex={0}
      role="button"
      aria-label={`Open task ${task.title}${locked ? `, currently locked by ${task.lockedByName}` : ""}`}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(task);
        }
      }}
    >
      {locked && (
        <div
          className="task-card__lock"
          title={`Being edited by ${task.lockedByName}`}
        >
          <span
            className="lock-dot"
            style={{ background: task.lockedByColor }}
            aria-hidden="true"
          />
          {task.lockedByName} is editing…
        </div>
      )}

      <div className="task-card__top">
        <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
        {task.subtasks.length > 0 && (
          <ProgressRing percent={completion} size={28} strokeWidth={3} />
        )}
      </div>

      <h3 className="task-card__title">{task.title}</h3>

      <div className={`task-card__due ${overdue ? "is-overdue" : ""}`}>
        {overdue && <span aria-hidden="true">⚠ </span>}
        {formatDueLabel(task.dueDate, task.columnId === "done")}
      </div>

      {task.subtasks.length > 0 && (
        <div className="task-card__subtasks">
          {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}{" "}
          subtasks
        </div>
      )}

      <div className="task-card__footer">
        <div className="task-card__assignees">
          {assignees.slice(0, 3).map((u) => (
            <Avatar
              key={u.id}
              name={u.name}
              color={u.color}
              size={24}
              title={u.name}
            />
          ))}
          {assignees.length === 0 && (
            <span className="task-card__unassigned">Unassigned</span>
          )}
        </div>
        <TimeTracker task={task} compact />
      </div>

      {canMove && (
        <div className="task-card__move" onClick={(e) => e.stopPropagation()}>
          <label htmlFor={`move-${task.id}`} className="task-card__move-label">
            Move
          </label>
          <select
            id={`move-${task.id}`}
            value={task.columnId}
            aria-label={`Move "${task.title}" to a different column`}
            onChange={(e) => moveTaskTo(task.id, e.target.value, 0)}
          >
            {COLUMNS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </article>
  );
}
