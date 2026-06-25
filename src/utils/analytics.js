import { todayISO, toISODate, isOverdue, shiftDate } from './dateUtils'

export function computeMetrics(tasks) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.columnId === 'done').length
  const inProgress = tasks.filter((t) => t.columnId === 'inprogress' || t.columnId === 'review').length
  const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.columnId === 'done')).length
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

  const completedWithTime = tasks.filter((t) => t.columnId === 'done' && (t.timeTracking?.totalSeconds || 0) > 0)
  const avgSeconds = completedWithTime.length
    ? completedWithTime.reduce((sum, t) => sum + (t.timeTracking?.totalSeconds || 0), 0) / completedWithTime.length
    : 0

  const totalTrackedSeconds = tasks.reduce((sum, t) => sum + (t.timeTracking?.totalSeconds || 0), 0)

  return { total, completed, inProgress, overdue, completionRate, avgSeconds, totalTrackedSeconds }
}

export function dailyCompletedSeries(tasks, days = 10) {
  const today = todayISO()
  const dates = []
  for (let i = days - 1; i >= 0; i -= 1) dates.push(shiftDate(today, -i))

  return dates.map((date) => {
    const count = tasks.filter((t) => t.completedAt && toISODate(t.completedAt) === date).length
    return { date, count }
  })
}

export function burndownSeries(tasks, days = 14) {
  const today = todayISO()
  const dates = []
  for (let i = days - 1; i >= 0; i -= 1) dates.push(shiftDate(today, -i))

  const scope = tasks.length
  const lastIdx = dates.length - 1

  return dates.map((date, idx) => {
    const remaining = tasks.filter((t) => !t.completedAt || toISODate(t.completedAt) > date).length
    const ideal = lastIdx === 0 ? 0 : Math.max(0, scope - (scope * idx) / lastIdx)
    return { date, remaining, ideal: Math.round(ideal * 10) / 10 }
  })
}

export function priorityBreakdown(tasks) {
  const byPriority = { High: 0, Medium: 0, Low: 0 }
  tasks.forEach((t) => {
    if (byPriority[t.priority] !== undefined) byPriority[t.priority] += 1
  })
  return byPriority
}
