import { useMemo, useState } from "react";
import FilterBar from "../FilterBar";
import KanbanBoard, { applyFilters } from "./KanbanBoard";
import TaskModal from "./TaskModal";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_FILTERS = {
  search: "",
  priority: "All",
  assignee: "All",
  overdueOnly: false,
};

export default function BoardView() {
  const { tasks, usersById, createTask } = useData();
  const { users } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const filtered = useMemo(
    () => applyFilters(tasks, filters, usersById),
    [tasks, filters, usersById],
  );
  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  return (
    <div className="board-view">
      <div className="board-view__header">
        <div>
          <h1 className="view-title">Sprint board</h1>
          <p className="view-subtitle">
            {filtered.length} of {tasks.length} tasks shown
          </p>
        </div>
      </div>

      <FilterBar users={users} filters={filters} onChange={setFilters} />

      <KanbanBoard
        tasks={filtered}
        onOpenTask={(task) => setActiveTaskId(task.id)}
        onCreateTask={(columnId) => createTask(columnId, { title: "New task" })}
      />

      {activeTask && (
        <TaskModal task={activeTask} onClose={() => setActiveTaskId(null)} />
      )}
    </div>
  );
}
