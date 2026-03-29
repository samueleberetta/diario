import { useState } from 'react'
import SpecialEventModal from './SpecialEventModal'

export default function EventsSection({ date, events, onAdd, onRemove }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="paper-card rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-paper-200">
        <div className="flex items-center gap-2">
          <span className="text-base">⭐</span>
          <span className="font-serif text-base font-semibold text-ink">Eventi speciali</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs px-3 py-1 rounded-full border border-ink/20 text-ink-light hover:bg-paper-200 transition-colors"
        >
          + Aggiungi
        </button>
      </div>

      <div className="px-4 py-3 min-h-[56px] flex flex-col gap-2">
        {events.length === 0 ? (
          <p className="text-sm text-ink-muted italic text-center py-2">Nessun evento per questo giorno.</p>
        ) : (
          events.map(e => (
            <div
              key={e.id}
              className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-500">★</span>
                <span className="text-sm font-medium text-ink">{e.title}</span>
              </div>
              <button
                onClick={() => onRemove(e.id)}
                className="text-ink-muted hover:text-missed transition-colors text-xs px-1"
                aria-label="Rimuovi evento"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <SpecialEventModal
          date={date}
          onSave={onAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
