// Thin wrapper around localStorage with JSON safety and a consistent key namespace.

export const KEYS = {
  USERS: 'flowboard_users',
  SESSION: 'flowboard_session',
  TASKS: 'flowboard_tasks',
  THEME: 'flowboard_theme',
  PRESENCE: 'flowboard_presence',
  SEEDED: 'flowboard_seeded_v1',
  LOG: 'flowboard_activity_log'
}

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null || raw === undefined) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.warn(`[storage] failed to read ${key}`, err)
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.warn(`[storage] failed to write ${key}`, err)
    return false
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.warn(`[storage] failed to remove ${key}`, err)
  }
}
