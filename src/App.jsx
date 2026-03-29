import { useState } from 'react'
import { useEntries } from './hooks/useEntries'
import { useEvents }  from './hooks/useEvents'
import Calendar   from './components/Calendar'
import DayView    from './components/DayView'
import StatsPanel from './components/StatsPanel'
import { today }  from './utils/storage'

export default function App() {
  const { entries, updateEntry, getEntry } = useEntries()
  const { addEvent, removeEvent, eventsForDate } = useEvents()

  const [selectedDate, setSelectedDate] = useState(null)
  const [calendarView, setCalendarView] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  function openDay(dateStr) {
    setSelectedDate(dateStr)
  }

  function closeDay() {
    setSelectedDate(null)
  }

  function handleDiaryChange(dateStr, text) {
    updateEntry(dateStr, { diary: text })
  }

  function handleQuestionChange(dateStr, questions) {
    updateEntry(dateStr, { questions })
  }

  function handleAddEvent(event) {
    addEvent(event)
  }

  function handleRemoveEvent(id) {
    removeEvent(id)
  }

  if (selectedDate) {
    const entry = getEntry(selectedDate)
    const events = eventsForDate(selectedDate)
    return (
      <div className="min-h-screen bg-paper-100 pb-12">
        <DayView
          dateStr={selectedDate}
          entry={entry}
          events={events}
          onDiaryChange={(v)   => handleDiaryChange(selectedDate, v)}
          onQuestionChange={(q) => handleQuestionChange(selectedDate, q)}
          onAddEvent={handleAddEvent}
          onRemoveEvent={handleRemoveEvent}
          onBack={closeDay}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper-100 pb-12">
      {/* App header */}
      <header className="sticky top-0 z-10 bg-paper-100/90 backdrop-blur-sm border-b border-paper-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📔</span>
            <span className="font-serif text-lg font-bold text-ink tracking-wide">Diario</span>
          </div>
          <button
            onClick={() => openDay(today())}
            className="text-sm px-4 py-1.5 rounded-full bg-ink text-white font-medium hover:bg-ink-light transition-colors shadow-sm"
          >
            Oggi
          </button>
        </div>
      </header>

      {/* Calendar */}
      <main className="max-w-2xl mx-auto px-2">
        <Calendar
          entries={entries}
          eventsForDate={eventsForDate}
          onSelectDay={openDay}
        />

        {/* Stats */}
        <div className="px-2 mt-2">
          <StatsPanel
            entries={entries}
            year={calendarView.year}
            month={calendarView.month}
          />
        </div>
      </main>
    </div>
  )
}
