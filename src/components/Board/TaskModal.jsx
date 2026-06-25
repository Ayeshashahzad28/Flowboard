import { useEffect, useRef, useState } from "react";
import Modal from "../common/Modal";
import Avatar from "../common/Avatar";
import ProgressRing from "../common/ProgressRing";
import SubtaskList from "./SubtaskList";
import TimeTracker from "./TimeTracker";
import {
  useData,
  computeCompletion,
  isTaskLocked,
  COLUMNS,
} from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../utils/permissions";
import { formatRelativeTime, formatDuration } from "../../utils/dateUtils";

const PRIORITIES = ["Low", "Medium", "High"];
const HEARTBEAT_MS = 5000;

export default function TaskModal({ task, onClose }) {
  const {
    tasks,
    usersById,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    renameSubtask,
    deleteSubtask,
    acquireLock,
    heartbeatLock,
    releaseLock,
    forceUnlock,
    now,
  } = useData();
  const { currentUser, users } = useAuth();

  // simulated-bot are reflected while the modal is open.
  const live = tasks.find((t) => t.id === task.id) || task;

  const editAllowed = can(currentUser.role, "editTask");
  const lockedByOther = isTaskLocked(live, currentUser.id);
  const [holdingLock, setHoldingLock] = useState(false);
  const acquiredRef = useRef(false);

  useEffect(() => {
    if (editAllowed && !lockedByOther) {
      const ok = acquireLock(live.id, currentUser);
      acquiredRef.current = ok;
      setHoldingLock(ok);
    }
    return () => {
      if (acquiredRef.current) releaseLock(live.id, currentUser.id);
    };
    // eslint ignoring React hook dependency warning
  }, []);

  useEffect(() => {
    if (!holdingLock) return undefined;
    const id = setInterval(
      () => heartbeatLock(live.id, currentUser.id),
      HEARTBEAT_MS,
    );
    return () => clearInterval(id);
  }, [holdingLock, live.id, currentUser.id, heartbeatLock]);

  const readOnly = !editAllowed || (lockedByOther && !holdingLock);

  const handleTakeOver = () => {
    forceUnlock(live.id);
    const ok = acquireLock(live.id, currentUser);
    acquiredRef.current = ok;
    setHoldingLock(ok);
  };

  const completion = computeCompletion(live);
  const assigneeIds = new Set(live.assignees);

  const toggleAssignee = (userId) => {
    const next = new Set(assigneeIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    updateTask(live.id, { assignees: Array.from(next) });
  };

  const canDelete = can(currentUser.role, "deleteTask");

  return (
    <Modal
      title={readOnly ? "View task" : "Edit task"}
      onClose={onClose}
      wide
      footer={
        <div className="modal-footer__row">
          <div className="modal-footer__meta">
            Created {formatRelativeTime(live.createdAt)}{" "}
            {live.completedAt &&
              `· Completed ${formatRelativeTime(live.completedAt)}`}
          </div>
          <div className="modal-footer__actions">
            {canDelete && (
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  if (window.confirm("Delete this task permanently?")) {
                    deleteTask(live.id);
                    onClose();
                  }
                }}
              >
                Delete task
              </button>
            )}
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      }
    >
      {lockedByOther && (
        <div className="lock-banner" role="alert">
          <span
            className="lock-dot"
            style={{ background: live.lockedByColor }}
            aria-hidden="true"
          />
          <span>
            <strong>{live.lockedByName}</strong> is currently editing this task.
            You can view it, but changes are disabled until they finish.
          </span>
          {can(currentUser.role, "forceUnlock") && (
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={handleTakeOver}
            >
              Take over editing
            </button>
          )}
        </div>
      )}
      {!lockedByOther && readOnly && (
        <div className="lock-banner lock-banner--muted" role="status">
          You have view-only access to this task.
        </div>
      )}

      <div className="task-modal-grid">
        <div className="task-modal-main">
          <div className="field">
            <label htmlFor="t-title">Title</label>
            <input
              id="t-title"
              type="text"
              value={live.title}
              disabled={readOnly}
              onChange={(e) => updateTask(live.id, { title: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="t-desc">Description</label>
            <textarea
              id="t-desc"
              rows={4}
              value={live.description}
              disabled={readOnly}
              onChange={(e) =>
                updateTask(live.id, { description: e.target.value })
              }
              placeholder="Add more detail about this task…"
            />
          </div>

          <SubtaskList
            subtasks={live.subtasks}
            readOnly={readOnly}
            onAdd={(title) => addSubtask(live.id, title)}
            onToggle={(id) => toggleSubtask(live.id, id)}
            onRename={(id, title) => renameSubtask(live.id, id, title)}
            onDelete={(id) => deleteSubtask(live.id, id)}
          />
        </div>

        <div className="task-modal-side">
          <div className="side-block">
            <span className="side-block__label">Completion</span>
            <div className="completion-row">
              <ProgressRing percent={completion} size={56} strokeWidth={5} />
              <span className="completion-row__text">
                {live.subtasks.filter((s) => s.done).length}/
                {live.subtasks.length || 0} subtasks done
              </span>
            </div>
          </div>

          <div className="side-block">
            <span className="side-block__label">Status</span>
            <select
              value={live.columnId}
              disabled={!can(currentUser.role, "moveTask")}
              onChange={(e) =>
                updateTask(live.id, { columnId: e.target.value })
              }
            >
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="side-block">
            <span className="side-block__label">Priority</span>
            <select
              value={live.priority}
              disabled={readOnly}
              onChange={(e) =>
                updateTask(live.id, { priority: e.target.value })
              }
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="side-block">
            <label className="side-block__label" htmlFor="t-due">
              Due date
            </label>
            <input
              id="t-due"
              type="date"
              value={live.dueDate}
              disabled={readOnly}
              onChange={(e) => updateTask(live.id, { dueDate: e.target.value })}
            />
          </div>

          <div className="side-block">
            <span className="side-block__label">Assignees</span>
            <div className="assignee-list">
              {users.map((u) => (
                <label
                  key={u.id}
                  className={`assignee-row ${readOnly ? "is-disabled" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={assigneeIds.has(u.id)}
                    disabled={readOnly}
                    onChange={() => toggleAssignee(u.id)}
                  />
                  <Avatar name={u.name} color={u.color} size={22} />
                  <span>{u.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="side-block">
            <span className="side-block__label">Time tracked</span>
            <TimeTracker task={live} />
            {live.timeTracking.isRunning && (
              <p className="side-block__hint">
                Running for{" "}
                {formatDuration((now - live.timeTracking.startedAt) / 1000)} so
                far, started by{" "}
                {usersById[live.timeTracking.runningBy]?.name || "a teammate"}
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
