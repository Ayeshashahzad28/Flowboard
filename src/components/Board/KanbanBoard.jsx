import { useMemo, useState } from "react";
import Column from "./Column";
import { useData, COLUMNS } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { isOverdue } from "../../utils/dateUtils";

function useDragAndDrop(moveTaskTo) {
  const [dragTaskId, setDragTaskId] = useState(null);
  const [dragFromColumnId, setDragFromColumnId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const reset = () => {
    setDragTaskId(null);
    setDragFromColumnId(null);
    setDragOverColumnId(null);
    setDragOverIndex(null);
  };

  return {
    dragOverColumnId,
    onDragStart(e, task, columnId) {
      setDragTaskId(task.id);
      setDragFromColumnId(columnId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", task.id);
    },
    onDragEnd() {
      reset();
    },
    onDragOverColumn(e, columnId, fallbackIndex) {
      e.preventDefault();
      const target = e.target.closest(".task-card");
      if (!target) {
        setDragOverColumnId(columnId);
        setDragOverIndex(fallbackIndex);
        return;
      }
      const rect = target.getBoundingClientRect();
      const isAfter = e.clientY > rect.top + rect.height / 2;
      const cards = Array.from(e.currentTarget.querySelectorAll(".task-card"));
      const idx = cards.indexOf(target);
      setDragOverColumnId(columnId);
      setDragOverIndex(isAfter ? idx + 1 : idx);
    },
    onDrop(e, columnId) {
      e.preventDefault();
      if (!dragTaskId) return;
      const toIndex = dragOverIndex === null ? 0 : dragOverIndex;
      moveTaskTo(dragTaskId, columnId, toIndex);
      reset();
    },
    insertionIndex(columnId, idx) {
      if (dragOverColumnId !== columnId || dragOverIndex !== idx) return null;
      return <div className="drop-indicator" aria-hidden="true" />;
    },
  };
}

export default function KanbanBoard({ tasks, onOpenTask, onCreateTask }) {
  const { moveTaskTo } = useData();
  const { currentUser } = useAuth();
  const dnd = useDragAndDrop(moveTaskTo);

  const byColumn = useMemo(() => {
    const map = {};
    COLUMNS.forEach((c) => {
      map[c.id] = [];
    });
    tasks.forEach((t) => {
      if (map[t.columnId]) map[t.columnId].push(t);
    });
    Object.keys(map).forEach((k) => map[k].sort((a, b) => a.order - b.order));
    return map;
  }, [tasks]);

  return (
    <div
      className="kanban-board"
      role="region"
      aria-label="Kanban board, drag cards or use the move dropdown to change status"
    >
      {COLUMNS.map((col) => (
        <Column
          key={col.id}
          column={col}
          tasks={byColumn[col.id]}
          onOpenTask={onOpenTask}
          onCreateTask={onCreateTask}
          dnd={dnd}
        />
      ))}
    </div>
  );
}

export function applyFilters(tasks, filters, usersById) {
  const search = filters.search.trim().toLowerCase();
  return tasks.filter((t) => {
    if (filters.priority !== "All" && t.priority !== filters.priority)
      return false;
    if (filters.assignee !== "All" && !t.assignees.includes(filters.assignee))
      return false;
    if (filters.overdueOnly && !isOverdue(t.dueDate, t.columnId === "done"))
      return false;
    if (search) {
      const haystack = `${t.title} ${t.description}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}
