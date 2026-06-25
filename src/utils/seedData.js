import { makeId } from './id'
import { shiftDate, todayISO } from './dateUtils'
import { ROLES } from './permissions'

export const AVATAR_PALETTE = ['#2E5EAA', '#B7791F', '#2F855A', '#9B2C8F', '#C53030', '#1A7A8A']

export function seedUsers() {
  return [
    { id: 'u_owner', username: 'owner', password: 'owner123', name: 'Ayesha Shahzad', role: ROLES.OWNER, color: AVATAR_PALETTE[0] },
    { id: 'u_editor', username: 'editor', password: 'editor123', name: 'Sara Khan', role: ROLES.EDITOR, color: AVATAR_PALETTE[1] },
    { id: 'u_editor2', username: 'bilal', password: 'bilal123', name: 'Bilal Ahmed', role: ROLES.EDITOR, color: AVATAR_PALETTE[2] },
    { id: 'u_viewer', username: 'viewer', password: 'viewer123', name: 'Mehak Raza', role: ROLES.VIEWER, color: AVATAR_PALETTE[3] }
  ]
}

// Fake collaborators used only to simulate live multi-user presence/editing.
// They never authenticate; they just animate presence + occasional task nudges.
export const BOT_PERSONAS = [
  { id: 'bot_1', name: 'Ayesha (bot)', color: '#C53030' },
  { id: 'bot_2', name: 'Usman (bot)', color: '#1A7A8A' }
]

export function seedTasks() {
  const today = todayISO()
  const mk = (overrides) => ({
    id: makeId('task'),
    title: 'Untitled task',
    description: '',
    priority: 'Medium',
    dueDate: shiftDate(today, 3),
    assignees: [],
    subtasks: [],
    columnId: 'todo',
    order: 0,
    timeTracking: { totalSeconds: 0, isRunning: false, startedAt: null, runningBy: null },
    createdAt: Date.now(),
    completedAt: null,
    lockedBy: null,
    lockedAt: null,
    ...overrides
  })

  return [
    mk({
      title: 'Define sprint goals',
      description: 'Draft the goals for this two-week sprint and align with stakeholders before kickoff.',
      priority: 'High',
      dueDate: shiftDate(today, -1),
      assignees: ['u_owner'],
      subtasks: [
        { id: makeId('sub'), title: 'Collect feedback from last retro', done: true },
        { id: makeId('sub'), title: 'Draft goal statement', done: true },
        { id: makeId('sub'), title: 'Review with team lead', done: false }
      ],
      columnId: 'todo',
      order: 0
    }),
    mk({
      title: 'Set up CI pipeline',
      description: 'Automate build, lint and test on every pull request.',
      priority: 'Medium',
      dueDate: shiftDate(today, 5),
      assignees: ['u_editor2'],
      subtasks: [
        { id: makeId('sub'), title: 'Choose CI provider', done: true },
        { id: makeId('sub'), title: 'Write workflow file', done: false }
      ],
      columnId: 'todo',
      order: 1
    }),
    mk({
      title: 'Design the onboarding flow',
      description: 'Wireframe the first-run experience for new workspace members.',
      priority: 'Low',
      dueDate: shiftDate(today, 9),
      assignees: ['u_editor', 'u_viewer'],
      subtasks: [],
      columnId: 'todo',
      order: 2
    }),
    mk({
      title: 'Build the Kanban drag-and-drop',
      description: 'Implement native HTML5 drag and drop with reordering and keyboard fallback.',
      priority: 'High',
      dueDate: shiftDate(today, 1),
      assignees: ['u_editor'],
      subtasks: [
        { id: makeId('sub'), title: 'Drag handlers on cards', done: true },
        { id: makeId('sub'), title: 'Drop handlers on columns', done: true },
        { id: makeId('sub'), title: 'Reorder within column', done: false },
        { id: makeId('sub'), title: 'Keyboard move fallback', done: false }
      ],
      columnId: 'inprogress',
      order: 0,
      timeTracking: { totalSeconds: 5400, isRunning: false, startedAt: null, runningBy: null }
    }),
    mk({
      title: 'Write API documentation',
      description: 'Document the task and user endpoints for the internal wiki.',
      priority: 'Medium',
      dueDate: shiftDate(today, 2),
      assignees: ['u_editor2', 'u_owner'],
      subtasks: [
        { id: makeId('sub'), title: 'Outline sections', done: true },
        { id: makeId('sub'), title: 'Document task model', done: false }
      ],
      columnId: 'inprogress',
      order: 1
    }),
    mk({
      title: 'Review accessibility pass',
      description: 'Audit focus order, color contrast and screen-reader labels across the board.',
      priority: 'High',
      dueDate: shiftDate(today, 0),
      assignees: ['u_owner', 'u_editor'],
      subtasks: [
        { id: makeId('sub'), title: 'Keyboard navigation audit', done: true },
        { id: makeId('sub'), title: 'Contrast check in high-contrast theme', done: true }
      ],
      columnId: 'review',
      order: 0
    }),
    mk({
      title: 'User testing feedback triage',
      description: 'Go through usability session notes and convert findings into tickets.',
      priority: 'Medium',
      dueDate: shiftDate(today, -3),
      assignees: ['u_viewer'],
      subtasks: [
        { id: makeId('sub'), title: 'Tag findings by severity', done: true }
      ],
      columnId: 'review',
      order: 1
    }),
    mk({
      title: 'Project kickoff',
      description: 'Initial planning meeting and charter sign-off.',
      priority: 'Low',
      dueDate: shiftDate(today, -10),
      assignees: ['u_owner', 'u_editor', 'u_editor2'],
      subtasks: [
        { id: makeId('sub'), title: 'Charter approved', done: true },
        { id: makeId('sub'), title: 'Roles assigned', done: true }
      ],
      columnId: 'done',
      order: 0,
      completedAt: Date.now() - 9 * 86400000,
      timeTracking: { totalSeconds: 7200, isRunning: false, startedAt: null, runningBy: null }
    }),
    mk({
      title: 'Wireframe the login screen',
      description: 'Low-fidelity wireframes for the authentication flow.',
      priority: 'Low',
      dueDate: shiftDate(today, -7),
      assignees: ['u_editor'],
      subtasks: [
        { id: makeId('sub'), title: 'Sketch layout', done: true },
        { id: makeId('sub'), title: 'Get sign-off', done: true }
      ],
      columnId: 'done',
      order: 1,
      completedAt: Date.now() - 6 * 86400000,
      timeTracking: { totalSeconds: 3600, isRunning: false, startedAt: null, runningBy: null }
    }),
    mk({
      title: 'Set up local-storage auth',
      description: 'Username/password check against seeded users, with session persistence.',
      priority: 'Medium',
      dueDate: shiftDate(today, -5),
      assignees: ['u_editor2'],
      subtasks: [
        { id: makeId('sub'), title: 'Seed demo accounts', done: true },
        { id: makeId('sub'), title: 'Persist session', done: true }
      ],
      columnId: 'done',
      order: 2,
      completedAt: Date.now() - 4 * 86400000,
      timeTracking: { totalSeconds: 4500, isRunning: false, startedAt: null, runningBy: null }
    }),
    mk({
      title: 'Theme system (light / dark / high-contrast)',
      description: 'CSS variable based theming with system preference detection.',
      priority: 'Medium',
      dueDate: shiftDate(today, -2),
      assignees: ['u_owner'],
      subtasks: [
        { id: makeId('sub'), title: 'Detect prefers-color-scheme', done: true },
        { id: makeId('sub'), title: 'Persist user choice', done: true },
        { id: makeId('sub'), title: 'High-contrast palette', done: true }
      ],
      columnId: 'done',
      order: 3,
      completedAt: Date.now() - 1 * 86400000,
      timeTracking: { totalSeconds: 6300, isRunning: false, startedAt: null, runningBy: null }
    })
  ]
}
