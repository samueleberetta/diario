import DiaryEditor    from './DiaryEditor'
import DailyQuestions from './DailyQuestions'
import EventsSection  from './EventsSection'
import { parseDate, today } from '../utils/storage'

const MONTHS_IT = [
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
]
const DAYS_IT = ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato']

function formatDateLabel(dateStr) {
  const d = parseDate(dateStr)
  return `${DAYS_IT[d.getDay()]}, ${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`
}

export default function DayView({
  dateStr, entry, events, questionDefs,
  onDiaryChange, onQuestionChange, onAddEvent, onRemoveEvent, onBack,
}) {
  const todayStr = today()
  const isToday  = dateStr === todayStr
  const isPast   = dateStr < todayStr
  const isFuture = dateStr > todayStr

  const answers = entry?.questions || {}
  const diary   = entry?.diary     || ''

  function handleQuestionChange(id, val) {
    onQuestionChange({ ...answers, [id]: val })
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper-200 transition-colors text-ink-muted"
          aria-label="Torna al calendario"
        >
          ←
        </button>
        <div>
          <h1 className="font-serif text-xl font-bold text-ink leading-tight">
            {formatDateLabel(dateStr)}
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            {isToday  && '📅 Oggi'}
            {isPast   && '📖 Giorno passato'}
            {isFuture && '🔮 Giorno futuro'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DiaryEditor
          value={diary}
          onChange={onDiaryChange}
          readOnly={false}
        />

        <DailyQuestions
          questionDefs={questionDefs}
          answers={answers}
          onChange={handleQuestionChange}
          readOnly={false}
        />

        <EventsSection
          date={dateStr}
          events={events}
          onAdd={onAddEvent}
          onRemove={onRemoveEvent}
        />
      </div>
    </div>
  )
}
