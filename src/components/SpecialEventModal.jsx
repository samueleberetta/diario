import { useState } from 'react'

export default function SpecialEventModal({ date, onSave, onClose }) {
  const [title, setTitle] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ date, title: title.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative paper-card rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <h3 className="font-serif text-lg font-semibold text-ink mb-1">
          Aggiungi evento speciale
        </h3>
        <p className="text-sm text-ink-muted mb-4">{date}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Es: Go Kart, Compleanno, Cena…"
            className="w-full border border-paper-300 rounded-lg px-3 py-2 text-sm bg-paper-50 outline-none focus:ring-2 focus:ring-ink/20 text-ink"
          />
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-paper-300 text-sm text-ink-muted hover:bg-paper-100 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-2 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
