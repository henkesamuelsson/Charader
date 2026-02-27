import { useState } from 'react'
import { themes } from '../cards/themes.js'

export default function ThemeStep({ selected, onChange }) {
  const [expanded, setExpanded] = useState(new Set())

  function toggleTheme(id) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    onChange(next)
  }

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    const all = new Set()
    themes.forEach(t => { all.add(t.id); t.subcategories?.forEach(s => all.add(s.id)) })
    onChange(all)
  }

  function clearAll() { onChange(new Set()) }

  const allIds = []
  themes.forEach(t => { allIds.push(t.id); t.subcategories?.forEach(s => allIds.push(s.id)) })
  const allSelected = allIds.every(id => selected.has(id))

  return (
    <div>
      <div className="theme-select-actions">
        <button className="theme-action-btn" onClick={allSelected ? clearAll : selectAll}>
          {allSelected ? 'Rensa alla' : 'Välj alla'}
        </button>
        {selected.size > 0 && <span className="theme-count-badge">{selected.size} valda</span>}
      </div>

      <div className="theme-grid">
        {themes.map(theme => {
          const isSelected = selected.has(theme.id)
          const isExpanded = expanded.has(theme.id)
          const hasSubs = !!theme.subcategories?.length

          return (
            <div key={theme.id} className="theme-item-wrapper">
              <button
                className={`theme-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => { toggleTheme(theme.id); if (hasSubs && !isExpanded) toggleExpand(theme.id) }}
              >
                <span className="theme-chip-emoji">{theme.emoji}</span>
                <span className="theme-chip-label">{theme.label}</span>
                {hasSubs && (
                  <span
                    className={`theme-chip-arrow ${isExpanded ? 'open' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleExpand(theme.id) }}
                  >▾</span>
                )}
              </button>

              {hasSubs && isExpanded && (
                <div className="subcategory-grid">
                  {theme.subcategories.map(sub => (
                    <button
                      key={sub.id}
                      className={`theme-chip sub-chip ${selected.has(sub.id) ? 'selected' : ''}`}
                      onClick={() => toggleTheme(sub.id)}
                    >
                      <span className="theme-chip-emoji">{sub.emoji}</span>
                      <span className="theme-chip-label">{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
