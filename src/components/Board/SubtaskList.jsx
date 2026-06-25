import { useState } from "react";

export default function SubtaskList({
  subtasks,
  readOnly,
  onAdd,
  onToggle,
  onRename,
  onDelete,
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const done = subtasks.filter((s) => s.done).length;

  const submitAdd = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onAdd(draft.trim());
    setDraft("");
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditValue(s.title);
  };

  const commitEdit = (id) => {
    if (editValue.trim()) onRename(id, editValue.trim());
    setEditingId(null);
  };

  return (
    <div className="subtasks">
      <div className="subtasks__summary">
        Subtasks{" "}
        <span>
          {done}/{subtasks.length}
        </span>
      </div>

      <ul className="subtasks__list">
        {subtasks.map((s) => (
          <li key={s.id} className="subtasks__item">
            <input
              type="checkbox"
              checked={s.done}
              disabled={readOnly}
              onChange={() => onToggle(s.id)}
              aria-label={`Mark "${s.title}" ${s.done ? "not done" : "done"}`}
            />
            {editingId === s.id ? (
              <input
                className="subtasks__edit-input"
                value={editValue}
                autoFocus
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitEdit(s.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit(s.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                aria-label="Edit subtask title"
              />
            ) : (
              <span
                className={`subtasks__title ${s.done ? "is-done" : ""}`}
                onClick={() => !readOnly && startEdit(s)}
                tabIndex={readOnly ? -1 : 0}
                role={readOnly ? undefined : "button"}
                onKeyDown={(e) => {
                  if (!readOnly && e.key === "Enter") startEdit(s);
                }}
              >
                {s.title}
              </span>
            )}
            {!readOnly && (
              <button
                type="button"
                className="icon-btn icon-btn--small"
                onClick={() => onDelete(s.id)}
                aria-label={`Delete subtask "${s.title}"`}
              >
                ✕
              </button>
            )}
          </li>
        ))}
        {subtasks.length === 0 && (
          <li className="subtasks__empty">No subtasks yet.</li>
        )}
      </ul>

      {!readOnly && (
        <form className="subtasks__add" onSubmit={submitAdd}>
          <input
            type="text"
            placeholder="Add a subtask…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="New subtask title"
          />
          <button type="submit" className="btn btn--secondary btn--small">
            Add
          </button>
        </form>
      )}
    </div>
  );
}
