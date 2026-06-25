// Centralized role -> permission mapping. Keep all access-control checks here so
// every component enforces the same rules.

export const ROLES = {
  OWNER: 'Owner',
  EDITOR: 'Editor',
  VIEWER: 'Viewer'
}

export const ROLE_ORDER = [ROLES.OWNER, ROLES.EDITOR, ROLES.VIEWER]

export function can(role, action) {
  switch (action) {
    case 'createTask':
    case 'editTask':
    case 'moveTask':
    case 'deleteSubtask':
    case 'editSubtask':
    case 'trackTime':
    case 'commentOrUpdate':
      return role === ROLES.OWNER || role === ROLES.EDITOR
    case 'deleteTask':
    case 'manageUsers':
    case 'forceUnlock':
    case 'changeRoles':
      return role === ROLES.OWNER
    case 'viewBoard':
    case 'viewAnalytics':
    case 'filterSearch':
      return true
    default:
      return false
  }
}

export function roleColor(role) {
  switch (role) {
    case ROLES.OWNER:
      return 'var(--role-owner)'
    case ROLES.EDITOR:
      return 'var(--role-editor)'
    default:
      return 'var(--role-viewer)'
  }
}
