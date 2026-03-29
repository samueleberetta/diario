import { useState } from 'react'
import { getDayStatus, formatDate, parseDate, today } from '../utils/storage'

const MONTHS_IT = [
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
]
const DAYS_IT = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom']

const STATUS_DOT = {
  done:    'bg-done',
  partial: 'bg-partial',
  missed:  'bg-missed',
  empty:   'bg-transparent',
}

const STATUS_RING = {
  done:    'ring-done/40',
  partial: 'ring-partial/40',
  missed:  'ring-missed/40',
  empty:   'ring-transparent',
}

const STATUS_BG = {
  done:    'bg-done/10',
  partial: 'bg-partial/10',
  missed:  'bg-missed/10',
  empty:   '',
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  // Monday = 0
  let d = new Date(year, month, 1).getDay()
  return (d + 6) % 7
}

export default function Calendar({ entries, questionDefs, eventsForDate, onSelectDay }) {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const todayStr = today()

  const daysInMonth  = getDaysInMonth(year, month)
  const firstDayOfWeek = getFirstDayOfWeek(year, month)
  const cells = Array(firstDayOfWeek).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  )
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 py-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-paper-200 transition-colors text-ink-light"
          aria-label="Mese precedente"
        >
          ‹
        </button>
        <div className="text-center">
          <h2 className="font-serif text-2xl font-semibold text-ink tracking-wide">
            {MONTHS_IT[month]}
          </h2>
          <span className="text-sm text-ink-muted">{year}</span>
        </div>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-paper-200 transition-colors text-ink-light"
          aria-label="Mese successivo"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_IT.map(d => (
          <div key={d} className="text-center text-xs font-medium text-ink-muted py-1 tracking-wider uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />

          const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const entry   = entries[dateStr] || null
          const status  = getDayStatus(entry, questionDefs)
          const events  = eventsForDate(dateStr)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr
          const hasContent = status !== 'empty' || entry?.diary

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDay(dateStr)}
              className={[
                'relative flex flex-col items-center justify-start p-1 pt-1.5 rounded-lg',
                'min-h-[52px] transition-all duration-150 group',
                'border border-transparent',
                isToday
                  ? 'border-ink/30 bg-paper-100 shadow-sm'
                  : `hover:bg-paper-200 ${STATUS_BG[status]}`,
                isFuture && !isToday ? 'opacity-60' : '',
              ].join(' ')}
              aria-label={`${day} ${MONTHS_IT[month]} ${year}`}
            >
              {/* Day number */}
              <span className={[
                'text-sm leading-none font-medium',
                isToday ? 'font-bold text-ink' : 'text-ink-light',
              ].join(' ')}>
                {day}
              </span>

              {/* Status dot */}
              {status !== 'empty' && (
                <span className={`mt-1 w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
              )}

              {/* Today ring */}
              {isToday && (
                <span className="absolute inset-0 rounded-lg ring-2 ring-ink/20 pointer-events-none" />
              )}

              {/* Special events */}
              {events.length > 0 && (
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}

              {/* Hover tooltip: event titles */}
              {events.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 hidden group-hover:block">
                  <div className="bg-ink text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    {events.map(e => e.title).join(', ')}
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-5 text-xs text-ink-muted">
        {[
          { color: 'bg-done',    label: 'Completato' },
          { color: 'bg-partial', label: 'Parziale' },
          { color: 'bg-missed',  label: 'Non fatto' },
          { color: 'bg-amber-500', label: 'Evento' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
