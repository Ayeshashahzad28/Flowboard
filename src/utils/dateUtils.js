export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function toISODate(date) {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export function isOverdue(dueDate, isDone) {
  if (!dueDate || isDone) return false
  return dueDate < todayISO()
}

export function daysUntil(dueDate) {
  if (!dueDate) return null
  const due = new Date(dueDate + 'T00:00:00')
  const now = new Date(todayISO() + 'T00:00:00')
  return Math.round((due - now) / 86400000)
}

export function formatDate(dateStr) {
  if (!dateStr) return 'No due date'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDueLabel(dueDate, isDone) {
  if (!dueDate) return 'No due date'
  if (isDone) return formatDate(dueDate)
  const diff = daysUntil(dueDate)
  if (diff < 0) return `${formatDate(dueDate)} · ${Math.abs(diff)}d overdue`
  if (diff === 0) return `${formatDate(dueDate)} · Due today`
  if (diff === 1) return `${formatDate(dueDate)} · Due tomorrow`
  return `${formatDate(dueDate)} · ${diff}d left`
}

export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n) => String(n).padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`
  return `${pad(m)}:${pad(sec)}`
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  const diffMs = Date.now() - timestamp
  const sec = Math.round(diffMs / 1000)
  if (sec < 5) return 'just now'
  if (sec < 60) return `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  return `${hr}h ago`
}

export function shiftDate(isoDate, days) {
  const d = new Date(isoDate + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
