import { makeId } from "./id";
import { shiftDate, todayISO } from "./dateUtils";
import { ROLES } from "./permissions";

export const AVATAR_PALETTE = [
  "#2E5EAA",
  "#B7791F",
  "#2F855A",
  "#9B2C8F",
  "#C53030",
  "#1A7A8A",
];

export function seedUsers() {
  return [
    {
      id: "u_owner",
      username: "owner",
      password: "owner123",
      name: "Ayesha Shahzad",
      role: ROLES.OWNER,
      color: AVATAR_PALETTE[0],
    },
    {
      id: "u_editor",
      username: "editor",
      password: "editor123",
      name: "Sara Khan",
      role: ROLES.EDITOR,
      color: AVATAR_PALETTE[1],
    },
    {
      id: "u_editor2",
      username: "bilal",
      password: "bilal123",
      name: "Bilal Ahmed",
      role: ROLES.EDITOR,
      color: AVATAR_PALETTE[2],
    },
    {
      id: "u_viewer",
      username: "viewer",
      password: "viewer123",
      name: "Mehak Raza",
      role: ROLES.VIEWER,
      color: AVATAR_PALETTE[3],
    },
  ];
}

// Fake collaborators used only to simulate live multi-user presence/editing.
// They never authenticate; they just animate presence + occasional task nudges.
export const BOT_PERSONAS = [
  { id: "bot_1", name: "Ayesha (bot)", color: "#C53030" },
  { id: "bot_2", name: "Usman (bot)", color: "#1A7A8A" },
];

export function seedTasks() {
  const today = todayISO();
  const mk = (overrides) => ({
    id: makeId("task"),
    title: "Untitled task",
    description: "",
    priority: "Medium",
    dueDate: shiftDate(today, 3),
    assignees: [],
    subtasks: [],
    columnId: "todo",
    order: 0,
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
    ...overrides,
  });

  return [
    mk({
      title: "Full Stack Web Development",
      description:
        "Build a basic full stack app with frontend and backend connection.",
      priority: "High",
      dueDate: shiftDate(today, -1),
      assignees: ["u_owner"],
      tech: ["React", "Node.js", "Express", "MongoDB"],
      subtasks: [
        { id: makeId("sub"), title: "Setup frontend project", done: true },
        { id: makeId("sub"), title: "Create backend API", done: true },
        {
          id: makeId("sub"),
          title: "Connect frontend and backend",
          done: false,
        },
      ],
      columnId: "todo",
      order: 0,
    }),

    mk({
      title: "CI Pipeline Setup",
      description: "Setup CI pipeline to run tests and build automatically.",
      priority: "Medium",
      dueDate: shiftDate(today, 5),
      assignees: ["u_editor2"],
      tech: ["GitHub Actions", "CI/CD", "Node.js"],
      subtasks: [
        { id: makeId("sub"), title: "Choose CI tool", done: true },
        { id: makeId("sub"), title: "Create workflow file", done: false },
      ],
      columnId: "todo",
      order: 1,
    }),

    mk({
      title: "Onboarding UI Design",
      description: "Create simple onboarding screens for new users.",
      priority: "Low",
      dueDate: shiftDate(today, 9),
      assignees: ["u_editor", "u_viewer"],
      tech: ["React", "CSS"],
      subtasks: [
        { id: makeId("sub"), title: "Design layout", done: false },
        { id: makeId("sub"), title: "Add basic UI components", done: false },
      ],
      columnId: "todo",
      order: 2,
    }),

    mk({
      title: "Kanban Drag and Drop",
      description: "Make tasks draggable between columns.",
      priority: "High",
      dueDate: shiftDate(today, 1),
      assignees: ["u_editor"],
      tech: ["React", "HTML5 Drag & Drop"],
      subtasks: [
        { id: makeId("sub"), title: "Drag task card", done: true },
        { id: makeId("sub"), title: "Drop into column", done: true },
        { id: makeId("sub"), title: "Fix reorder issue", done: false },
      ],
      columnId: "inprogress",
      order: 0,
      timeTracking: {
        totalSeconds: 5400,
        isRunning: false,
        startedAt: null,
        runningBy: null,
      },
    }),

    mk({
      title: "API Documentation",
      description: "Write simple API documentation for backend.",
      priority: "Medium",
      dueDate: shiftDate(today, 2),
      assignees: ["u_editor2", "u_owner"],
      tech: ["Swagger", "Node.js"],
      subtasks: [
        { id: makeId("sub"), title: "Write endpoints list", done: true },
        { id: makeId("sub"), title: "Add request examples", done: false },
      ],
      columnId: "inprogress",
      order: 1,
    }),

    mk({
      title: "Accessibility Review",
      description: "Check keyboard navigation and UI contrast.",
      priority: "High",
      dueDate: shiftDate(today, 0),
      assignees: ["u_owner", "u_editor"],
      tech: ["HTML", "CSS", "Accessibility"],
      subtasks: [
        { id: makeId("sub"), title: "Check keyboard navigation", done: true },
        { id: makeId("sub"), title: "Fix contrast issues", done: true },
      ],
      columnId: "review",
      order: 0,
    }),

    mk({
      title: "User Feedback Review",
      description: "Review user feedback and make task improvements.",
      priority: "Medium",
      dueDate: shiftDate(today, -3),
      assignees: ["u_viewer"],
      tech: ["Product Thinking"],
      subtasks: [
        { id: makeId("sub"), title: "Read feedback", done: true },
        { id: makeId("sub"), title: "Create improvement tasks", done: false },
      ],
      columnId: "review",
      order: 1,
    }),

    mk({
      title: "Project Setup Complete",
      description: "Initial project setup and planning completed.",
      priority: "Low",
      dueDate: shiftDate(today, -10),
      assignees: ["u_owner", "u_editor"],
      tech: ["Git", "Project Management"],
      subtasks: [
        { id: makeId("sub"), title: "Setup repo", done: true },
        { id: makeId("sub"), title: "Assign roles", done: true },
      ],
      columnId: "done",
      order: 0,
      completedAt: Date.now() - 9 * 86400000,
      timeTracking: {
        totalSeconds: 7200,
        isRunning: false,
        startedAt: null,
        runningBy: null,
      },
    }),
  ];
}
