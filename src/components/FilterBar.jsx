import { useEffect, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'

const PRIORITIES = ['All', 'High', 'Medium', 'Low']

export default function FilterBar({ users, filters, onChange }) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    onChange({ ...filters, search: debouncedSearch })
    // eslint disable next line react hooks/exhaustive deps
  }, [debouncedSearch])

  const activeCount = (filters.priority !== 'All' ? 1 : 0) + (filters.assignee !== 'All' ? 1 : 0) + (filters.overdueOnly ? 1 : 0)

  return (
    <div className="filter-bar" role="search">
      <div className="filter-search">
        <span aria-hidden="true" className="filter-search__icon">⌕</span>
        <input
          type="search"
          placeholder="Search tasks by title or description…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search tasks"
        />
      </div>

      <div className="filter-controls">
        <label className="filter-field">
          <span>Priority</span>
          <select value={filters.priority} onChange={(e) => onChange({ ...filters, priority: e.target.value })}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Assignee</span>
          <select value={filters.assignee} onChange={(e) => onChange({ ...filters, assignee: e.target.value })}>
            <option value="All">All</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </label>

        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.overdueOnly}
            onChange={(e) => onChange({ ...filters, overdueOnly: e.target.checked })}
          />
          <span>Overdue only</span>
        </label>

        {activeCount > 0 && (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => onChange({ search: filters.search, priority: 'All', assignee: 'All', overdueOnly: false })}
          >
            Clear filters ({activeCount})
          </button>
        )}
      </div>
    </div>
  )
}
