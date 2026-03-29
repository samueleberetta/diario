import { useState, useEffect } from 'react'
import { QUESTIONS } from '../utils/storage'

function QuestionRow({ q, answer, note, onChange, readOnly }) {
  const [localNote, setLocalNote] = useState(note || '')

  useEffect(() => { setLocalNote(note || '') }, [note])

  function select(val) {
    if (readOnly) return
    const newNote = val === 'partial' ? (localNote || '') : ''
    onChange(q.key, { answer: val, note: newNote })
  }

  function handleNoteChange(e) {
    setLocalNote(e.target.value)
    onChange(q.key, { answer: 'partial', note: e.target.value })
  }

  const isPartial = answer === 'partial'

  return (
    <div className="py-3 border-b border-paper-200 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none mt-0.5">{q.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink mb-2">{q.label}</p>
          {readOnly ? (
            <div className="flex items-center gap-2">
              {answer === 'yes' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-done bg-done/10 px-2.5 py-1 rounded-full">
                  ✓ Sì
                </span>
              )}
              {answer === 'no' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-missed bg-missed/10 px-2.5 py-1 rounded-full">
                  ✗ No
                </span>
              )}
              {answer === 'partial' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-partial bg-partial/10 px-2.5 py-1 rounded-full">
                  ~ Parziale
                </span>
              )}
              {!answer && (
                <span className="text-xs text-ink-muted italic">—</span>
              )}
              {note && (
                <span className="text-xs text-ink-muted italic">"{note}"</span>
              )}
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => select('yes')}
                  className={`btn-yes ${answer === 'yes' ? 'active' : ''}`}
                >
                  ✓ Sì
                </button>
                <button
                  onClick={() => select('partial')}
                  className={`btn-partial ${answer === 'partial' ? 'active' : ''}`}
                >
                  ~ Parziale
                </button>
                <button
                  onClick={() => select('no')}
                  className={`btn-no ${answer === 'no' ? 'active' : ''}`}
                >
                  ✗ No
                </button>
              </div>
              {isPartial && (
                <textarea
                  className="mt-2 w-full text-sm rounded-lg border border-paper-300 bg-paper-50 px-3 py-2 outline-none focus:ring-1 focus:ring-partial/50 resize-none text-ink"
                  rows={2}
                  placeholder="Spiega brevemente…"
                  value={localNote}
                  onChange={handleNoteChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DailyQuestions({ questions, onChange, readOnly }) {
  const qs = questions || {}

  return (
    <div className="paper-card rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-paper-200">
        <span className="text-base">❓</span>
        <span className="font-serif text-base font-semibold text-ink">Domande del giorno</span>
      </div>
      <div className="px-4">
        {QUESTIONS.map(q => (
          <QuestionRow
            key={q.key}
            q={q}
            answer={qs[q.key]?.answer}
            note={qs[q.key]?.note}
            onChange={onChange}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  )
}
