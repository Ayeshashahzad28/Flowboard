import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { KEYS, readJSON, writeJSON } from "../utils/storage";
import { seedTasks, BOT_PERSONAS } from "../utils/seedData";
import { makeId } from "../utils/id";
import { useInterval } from "../hooks/useInterval";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

export const COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "inprogress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

const LOCK_TTL_MS = 15000;
const BOT_TICK_MS = 9000;
const PRESENCE_HEARTBEAT_MS = 4000;
const PRESENCE_TTL_MS = 13000;

function ensureTasksSeeded() {
  const existing = readJSON(KEYS.TASKS, null)
  if (!existing || existing.length === 0) {
    const seeded = seedTasks()
    writeJSON(KEYS.TASKS, seeded)
    return seeded
  }
  return existing
}
function reindex(tasks, columnId) {
  const inCol = tasks
    .filter((t) => t.columnId === columnId)
    .sort((a, b) => a.order - b.order);
  const others = tasks.filter((t) => t.columnId !== columnId);
  const reindexed = inCol.map((t, idx) => ({ ...t, order: idx }));
  return [...others, ...reindexed];
}

export function isTaskLocked(task, requesterId) {
  if (!task.lockedBy) return false;
  if (task.lockedBy === requesterId) return false;
  return Date.now() - (task.lockedAt || 0) < LOCK_TTL_MS;
}

export function computeCompletion(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return task.columnId === "done" ? 100 : 0;
  }
  const done = task.subtasks.filter((s) => s.done).length;
  return Math.round((done / task.subtasks.length) * 100);
}

export function DataProvider({ children }) {
  const { currentUser, users } = useAuth();
  const [tasks, setTasks] = useState(() => ensureTasksSeeded());
  const [presenceMap, setPresenceMap] = useState(() =>
    readJSON(KEYS.PRESENCE, {}),
  );
  const [toasts, setToasts] = useState([]);
  const [now, setNow] = useState(Date.now());
  const botTimeouts = useRef([]);

  //  persistence + cross-tab sync
  useEffect(() => {
    writeJSON(KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === KEYS.TASKS) {
        const next = readJSON(KEYS.TASKS, null);
        if (next) setTasks(next);
      }
      if (e.key === KEYS.PRESENCE) {
        setPresenceMap(readJSON(KEYS.PRESENCE, {}));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // clock tick for live timers + relative "x ago" labels
  useInterval(() => setNow(Date.now()), 1000);

  //  presence heartbeat
  useInterval(
    () => {
      if (!currentUser) return;
      const latest = readJSON(KEYS.PRESENCE, {});
      latest[currentUser.id] = {
        id: currentUser.id,
        name: currentUser.name,
        color: currentUser.color,
        role: currentUser.role,
        lastSeen: Date.now(),
      };
      writeJSON(KEYS.PRESENCE, latest);
      setPresenceMap(latest);
    },
    currentUser ? PRESENCE_HEARTBEAT_MS : null,
  );

  useEffect(() => {
    if (!currentUser) return;
    const latest = readJSON(KEYS.PRESENCE, {});
    latest[currentUser.id] = {
      id: currentUser.id,
      name: currentUser.name,
      color: currentUser.color,
      role: currentUser.role,
      lastSeen: Date.now(),
    };
    writeJSON(KEYS.PRESENCE, latest);
    setPresenceMap(latest);
    // eslint disable next line react hooks/exhaustive deps
  }, [currentUser?.id]);

  const onlineUsers = useMemo(() => {
    return Object.values(presenceMap).filter(
      (p) => now - p.lastSeen < PRESENCE_TTL_MS,
    );
  }, [presenceMap, now]);

  // toasts (simulated sync update notifications)
  const pushToast = useCallback((message) => {
    const id = makeId("toast");
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // simulated bot collaborators
  useInterval(() => {
    setTasks((prev) => {
      const candidates = prev.filter(
        (t) =>
          t.columnId !== "done" &&
          !isTaskLocked(t, "__bot_check__") &&
          !t.lockedBy,
      );
      if (candidates.length === 0) return prev;
      if (Math.random() > 0.55) return prev; // keep it sparse, not noisy
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const bot = BOT_PERSONAS[Math.floor(Math.random() * BOT_PERSONAS.length)];

      const releaseDelay = 4000 + Math.random() * 5000;
      const timeoutId = setTimeout(() => {
        setTasks((cur) =>
          cur.map((t) => {
            if (t.id !== target.id || t.lockedBy !== bot.id) return t;
            let updated = {
              ...t,
              lockedBy: null,
              lockedByName: null,
              lockedByColor: null,
              lockedAt: null,
            };
            if (Math.random() < 0.4 && updated.subtasks.some((s) => !s.done)) {
              const idx = updated.subtasks.findIndex((s) => !s.done);
              const nextSubtasks = updated.subtasks.map((s, i) =>
                i === idx ? { ...s, done: true } : s,
              );
              updated = { ...updated, subtasks: nextSubtasks };
              pushToast(
                `${bot.name} checked off "${nextSubtasks[idx].title}" on "${updated.title}"`,
              );
            } else {
              pushToast(`${bot.name} finished reviewing "${updated.title}"`);
            }
            return updated;
          }),
        );
      }, releaseDelay);
      botTimeouts.current.push(timeoutId);

      return prev.map((t) =>
        t.id === target.id
          ? {
              ...t,
              lockedBy: bot.id,
              lockedByName: bot.name,
              lockedByColor: bot.color,
              lockedAt: Date.now(),
            }
          : t,
      );
    });
  }, BOT_TICK_MS);

  useEffect(() => {
    return () => botTimeouts.current.forEach((id) => clearTimeout(id));
  }, []);

  // task CRUD
  const createTask = useCallback((columnId, partial = {}) => {
    setTasks((prev) => {
      const order = prev.filter((t) => t.columnId === columnId).length;
      const task = {
        id: makeId("task"),
        title: "New task",
        description: "",
        priority: "Medium",
        dueDate: "",
        assignees: [],
        subtasks: [],
        columnId,
        order,
        timeTracking: {
          totalSeconds: 0,
          isRunning: false,
          startedAt: null,
          runningBy: null,
        },
        createdAt: Date.now(),
        completedAt: null,
        lockedBy: null,
        lockedAt: null,
        ...partial,
      };
      return [...prev, task];
    });
  }, []);

  const updateTask = useCallback((taskId, patch) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
    );
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const moveTaskTo = useCallback((taskId, toColumnId, toIndex) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;
      const fromColumnId = task.columnId;

      const destTasks = prev
        .filter((t) => t.columnId === toColumnId && t.id !== taskId)
        .sort((a, b) => a.order - b.order);
      const clampedIndex = Math.max(0, Math.min(toIndex, destTasks.length));
      destTasks.splice(clampedIndex, 0, task);

      const isCompleting = toColumnId === "done" && fromColumnId !== "done";
      const isReopening = toColumnId !== "done" && fromColumnId === "done";

      let next = prev.map((t) => {
        if (t.id !== taskId) return t;
        let updated = { ...t, columnId: toColumnId };
        if (isCompleting) {
          updated.completedAt = Date.now();
          if (updated.timeTracking.isRunning) {
            const elapsed =
              (Date.now() - updated.timeTracking.startedAt) / 1000;
            updated.timeTracking = {
              totalSeconds: updated.timeTracking.totalSeconds + elapsed,
              isRunning: false,
              startedAt: null,
              runningBy: null,
            };
          }
        }
        if (isReopening) updated.completedAt = null;
        return updated;
      });

      next = next.map((t) => {
        if (t.columnId !== toColumnId || t.id === taskId) return t;
        const idx = destTasks.findIndex((d) => d.id === t.id);
        return { ...t, order: idx };
      });
      const movedIdx = destTasks.findIndex((d) => d.id === taskId);
      next = next.map((t) => (t.id === taskId ? { ...t, order: movedIdx } : t));

      if (fromColumnId !== toColumnId) {
        next = reindex(next, fromColumnId);
      }
      return next;
    });
  }, []);

  // subtasks
  const addSubtask = useCallback((taskId, title) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [
                ...t.subtasks,
                { id: makeId("sub"), title, done: false },
              ],
            }
          : t,
      ),
    );
  }, []);

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, done: !s.done } : s,
              ),
            }
          : t,
      ),
    );
  }, []);

  const renameSubtask = useCallback((taskId, subtaskId, title) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, title } : s,
              ),
            }
          : t,
      ),
    );
  }, []);

  const deleteSubtask = useCallback((taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
          : t,
      ),
    );
  }, []);

  //  edit locks
  const acquireLock = useCallback((taskId, user) => {
    let ok = false;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        if (isTaskLocked(t, user.id)) {
          ok = false;
          return t;
        }
        ok = true;
        return {
          ...t,
          lockedBy: user.id,
          lockedByName: user.name,
          lockedByColor: user.color,
          lockedAt: Date.now(),
        };
      }),
    );
    return ok;
  }, []);

  const heartbeatLock = useCallback((taskId, userId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId && t.lockedBy === userId
          ? { ...t, lockedAt: Date.now() }
          : t,
      ),
    );
  }, []);

  const releaseLock = useCallback((taskId, userId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId && t.lockedBy === userId
          ? {
              ...t,
              lockedBy: null,
              lockedByName: null,
              lockedByColor: null,
              lockedAt: null,
            }
          : t,
      ),
    );
  }, []);

  const forceUnlock = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              lockedBy: null,
              lockedByName: null,
              lockedByColor: null,
              lockedAt: null,
            }
          : t,
      ),
    );
  }, []);

  //  time tracking
  const startTimer = useCallback((taskId, userId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (
          t.timeTracking.isRunning &&
          t.timeTracking.runningBy === userId &&
          t.id !== taskId
        ) {
          const elapsed = (Date.now() - t.timeTracking.startedAt) / 1000;
          return {
            ...t,
            timeTracking: {
              totalSeconds: t.timeTracking.totalSeconds + elapsed,
              isRunning: false,
              startedAt: null,
              runningBy: null,
            },
          };
        }
        if (t.id === taskId) {
          return {
            ...t,
            timeTracking: {
              ...t.timeTracking,
              isRunning: true,
              startedAt: Date.now(),
              runningBy: userId,
            },
          };
        }
        return t;
      }),
    );
  }, []);

  const pauseTimer = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.timeTracking.isRunning) return t;
        const elapsed = (Date.now() - t.timeTracking.startedAt) / 1000;
        return {
          ...t,
          timeTracking: {
            totalSeconds: t.timeTracking.totalSeconds + elapsed,
            isRunning: false,
            startedAt: null,
            runningBy: null,
          },
        };
      }),
    );
  }, []);

  const stopAllRunningTimersForUser = useCallback((userId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (!t.timeTracking.isRunning || t.timeTracking.runningBy !== userId)
          return t;
        const elapsed = (Date.now() - t.timeTracking.startedAt) / 1000;
        return {
          ...t,
          timeTracking: {
            totalSeconds: t.timeTracking.totalSeconds + elapsed,
            isRunning: false,
            startedAt: null,
            runningBy: null,
          },
        };
      }),
    );
  }, []);

  // Auto stop on hard tab close / refresh too.
  useEffect(() => {
    const handler = () => {
      if (!currentUser) return;
      const raw = readJSON(KEYS.TASKS, []);
      const next = raw.map((t) => {
        if (
          !t.timeTracking.isRunning ||
          t.timeTracking.runningBy !== currentUser.id
        )
          return t;
        const elapsed = (Date.now() - t.timeTracking.startedAt) / 1000;
        return {
          ...t,
          timeTracking: {
            totalSeconds: t.timeTracking.totalSeconds + elapsed,
            isRunning: false,
            startedAt: null,
            runningBy: null,
          },
        };
      });
      writeJSON(KEYS.TASKS, next);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [currentUser]);

  const usersById = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  const value = useMemo(
    () => ({
      tasks,
      columns: COLUMNS,
      now,
      onlineUsers,
      toasts,
      pushToast,
      dismissToast,
      usersById,
      createTask,
      updateTask,
      deleteTask,
      moveTaskTo,
      addSubtask,
      toggleSubtask,
      renameSubtask,
      deleteSubtask,
      acquireLock,
      heartbeatLock,
      releaseLock,
      forceUnlock,
      startTimer,
      pauseTimer,
      stopAllRunningTimersForUser,
    }),
    [
      tasks,
      now,
      onlineUsers,
      toasts,
      usersById,
      pushToast,
      dismissToast,
      createTask,
      updateTask,
      deleteTask,
      moveTaskTo,
      addSubtask,
      toggleSubtask,
      renameSubtask,
      deleteSubtask,
      acquireLock,
      heartbeatLock,
      releaseLock,
      forceUnlock,
      startTimer,
      pauseTimer,
      stopAllRunningTimersForUser,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
