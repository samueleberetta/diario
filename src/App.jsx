import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage            from './components/AuthPage'
import ResetPasswordPage   from './components/ResetPasswordPage'
import EmailConfirmedPage  from './components/EmailConfirmedPage'
import Calendar            from './components/Calendar'
import DayView             from './components/DayView'
import StatsPanel          from './components/StatsPanel'
import NotificationPrompt, { NotificationToggle } from './components/NotificationPrompt'
import { useEntries  } from './hooks/useEntries'
import { useEvents   } from './hooks/useEvents'
import { useQuestions } from './hooks/useQuestions'
import { today, getDayStatus } from './utils/storage'

// ---- Inner app (solo quando loggato) ----
function DiaryApp() {
  const { user, displayName, signOut } = useAuth()
  const { entries, updateEntry, getEntry } = useEntries(user.id)
  const { addEvent, removeEvent, eventsForDate } = useEvents(user.id)
  const { questions, saveQuestions } = useQuestions(user.id)

  const [selectedDate, setSelectedDate] = useState(null)
  const [calView] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try { await signOut() } finally { setSigningOut(false) }
  }

  // Passa questionDefs al Calendar per calcolare lo stato del giorno correttamente
  function getStatusForCalendar(entry) {
    return getDayStatus(entry, questions)
  }

  if (selectedDate) {
    return (
      <div className="min-h-screen bg-paper-100 pb-12">
        <DayView
          dateStr={selectedDate}
          entry={getEntry(selectedDate)}
          events={eventsForDate(selectedDate)}
          questionDefs={questions}
          onDiaryChange={(v)    => updateEntry(selectedDate, { diary: v })}
          onQuestionChange={(q) => updateEntry(selectedDate, { questions: q })}
          onAddEvent={addEvent}
          onRemoveEvent={removeEvent}
          onBack={() => setSelectedDate(null)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper-100 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-paper-100/90 backdrop-blur-sm border-b border-paper-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📔</span>
            <span className="font-serif text-lg font-bold text-ink tracking-wide">Diario</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDate(today())}
              className="text-sm px-4 py-1.5 rounded-full bg-ink text-white font-medium hover:bg-ink-light transition-colors shadow-sm"
            >
              Oggi
            </button>
            {/* User menu */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                <span className="w-7 h-7 rounded-full bg-paper-300 flex items-center justify-center text-xs font-bold text-ink uppercase">
                  {displayName.charAt(0)}
                </span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-44 hidden group-hover:block z-20">
                <div className="paper-card rounded-xl shadow-lg py-2 overflow-hidden">
                  <div className="px-3 py-2 border-b border-paper-200">
                    <p className="text-xs font-medium text-ink truncate">{displayName}</p>
                    <p className="text-xs text-ink-muted truncate">{user.email}</p>
                  </div>
                  <NotificationToggle userId={user.id} />
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full text-left px-3 py-2 text-sm text-missed hover:bg-missed/5 transition-colors"
                  >
                    {signingOut ? 'Uscita…' : 'Esci'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-2">
        <NotificationPrompt userId={user.id} />
        <Calendar
          entries={entries}
          questionDefs={questions}
          eventsForDate={eventsForDate}
          onSelectDay={setSelectedDate}
        />
        <div className="px-2 mt-2">
          <StatsPanel
            entries={entries}
            year={calView.year}
            month={calView.month}
            questionDefs={questions}
            onSaveQuestions={saveQuestions}
          />
        </div>
      </main>
    </div>
  )
}

// ---- Root ----
function Root() {
  const { user, loading, isRecovering, justConfirmed, dismissConfirmed } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">📔</div>
          <p className="text-ink-muted text-sm">Caricamento…</p>
        </div>
      </div>
    )
  }

  if (isRecovering)   return <ResetPasswordPage />
  if (justConfirmed)  return <EmailConfirmedPage onContinue={dismissConfirmed} />
  return user ? <DiaryApp /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
