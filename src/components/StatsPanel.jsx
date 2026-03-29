import { useMemo, useState } from 'react'
import { getDayStatus, formatDate } from '../utils/storage'
import QuestionsManager from './QuestionsManager'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export default function StatsPanel({ entries, year, month, questionDefs, onSaveQuestions }) {
  const [showManager, setShowManager] = useState(false)

  const stats = useMemo(() => {
    const today = formatDate(new Date())
    const daysInMonth = getDaysInMonth(year, month)
    let done = 0, partial = 0, missed = 0, total = 0

    const questionCounts = Object.fromEntries(
      (questionDefs || []).map(q => [q.id, { yes: 0, partial: 0, no: 0, total: 0 }])
    )

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      if (dateStr > today) continue
      total++
      const entry = entries[dateStr] || null
      const status = getDayStatus(entry, questionDefs)
      if (status === 'done')         done++
      else if (status === 'partial') partial++
      else if (status === 'missed')  missed++

      if (entry?.questions) {
        ;(questionDefs || []).forEach(q => {
          const ans = entry.questions[q.id]?.answer
          if (ans) {
            questionCounts[q.id].total++
            questionCounts[q.id][ans === 'yes' ? 'yes' : ans === 'partial' ? 'partial' : 'no']++
          }
        })
      }
    }

    const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0
    return { done, partial, missed, total, pct, questionCounts }
  }, [entries, year, month, questionDefs])

  return (
    <div className="paper-card rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-paper-200">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="font-serif text-base font-semibold text-ink">Statistiche del mese</span>
        </div>
        <button
          onClick={() => setShowManager(true)}
          className="text-xs px-3 py-1 rounded-full border border-paper-300 text-ink-muted hover:bg-paper-200 hover:text-ink transition-colors"
        >
          ✎ Modifica obiettivi
        </button>
      </div>

      {stats.total === 0 ? (
        <p className="text-sm text-ink-muted italic text-center py-6">
          Nessun dato per questo mese ancora.
        </p>
      ) : (
        <div className="px-4 py-4 space-y-4">
          {/* Counters */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Completati', value: stats.done,    color: 'text-done',    bg: 'bg-done/10' },
              { label: 'Parziali',   value: stats.partial, color: 'text-partial', bg: 'bg-partial/10' },
              { label: 'Non fatti',  value: stats.missed,  color: 'text-missed',  bg: 'bg-missed/10' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-lg py-3`}>
                <div className={`text-2xl font-bold font-serif ${color}`}>{value}</div>
                <div className="text-xs text-ink-muted mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-ink-muted mb-1">
              <span>Giorni positivi</span>
              <span>{stats.pct(stats.done + stats.partial)}% su {stats.total} giorni</span>
            </div>
            <div className="h-2 bg-paper-200 rounded-full overflow-hidden flex">
              <div className="bg-done    h-full transition-all" style={{ width: `${stats.pct(stats.done)}%` }} />
              <div className="bg-partial h-full transition-all" style={{ width: `${stats.pct(stats.partial)}%` }} />
              <div className="bg-missed  h-full transition-all" style={{ width: `${stats.pct(stats.missed)}%` }} />
            </div>
          </div>

          {/* Per-question */}
          {(questionDefs || []).length > 0 && (
            <div className="space-y-2">
              {(questionDefs || []).map(q => {
                const c = stats.questionCounts[q.id]
                if (!c || c.total === 0) return null
                const yesPct = Math.round((c.yes / c.total) * 100)
                return (
                  <div key={q.id} className="flex items-center gap-2">
                    <span className="text-sm">{q.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-ink-muted truncate">{q.label}</span>
                        <span className="text-ink-muted ml-1 shrink-0">{yesPct}%</span>
                      </div>
                      <div className="h-1.5 bg-paper-200 rounded-full overflow-hidden">
                        <div className="bg-done h-full rounded-full transition-all" style={{ width: `${yesPct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {showManager && (
        <QuestionsManager
          questions={questionDefs || []}
          onSave={onSaveQuestions}
          onClose={() => setShowManager(false)}
        />
      )}
    </div>
  )
}
