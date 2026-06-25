import TaskCard from "./TaskCard";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../utils/permissions";

export default function Column({
  column,
  tasks,
  onOpenTask,
  onCreateTask,
  dnd,
}) {
  const { currentUser } = useAuth();
  const canCreate = can(currentUser.role, "createTask");
  const canMove = can(currentUser.role, "moveTask");

  const isDragOverColumn = dnd.dragOverColumnId === column.id;

  return (
    <section
      className="kanban-column"
      aria-label={`${column.label} column, ${tasks.length} tasks`}
    >
      <header className="kanban-column__header">
        <span
          className={`kanban-column__dot kanban-column__dot--${column.id}`}
          aria-hidden="true"
        />
        <h2>{column.label}</h2>
        <span className="kanban-column__count">{tasks.length}</span>
      </header>

      <div
        className={`kanban-column__body ${isDragOverColumn ? "is-drag-over" : ""}`}
        onDragOver={
          canMove
            ? (e) => dnd.onDragOverColumn(e, column.id, tasks.length)
            : undefined
        }
        onDrop={canMove ? (e) => dnd.onDrop(e, column.id) : undefined}
      >
        {tasks.length === 0 && (
          <div className="kanban-column__empty">
            {isDragOverColumn ? "Drop here" : "No tasks"}
          </div>
        )}
        {tasks.map((task, idx) => (
          <div key={task.id}>
            {dnd.insertionIndex(column.id, idx)}
            <TaskCard
              task={task}
              onOpen={onOpenTask}
              dragProps={{
                onDragStart: (e) => dnd.onDragStart(e, task, column.id),
                onDragEnd: dnd.onDragEnd,
              }}
            />
          </div>
        ))}
        {dnd.insertionIndex(column.id, tasks.length)}
      </div>

      {canCreate && (
        <button
          type="button"
          className="kanban-column__add"
          onClick={() => onCreateTask(column.id)}
        >
          + Add task
        </button>
      )}
    </section>
  );
}
