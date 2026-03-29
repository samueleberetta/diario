import { useState } from 'react'
import { DEFAULT_QUESTIONS } from '../hooks/useQuestions'

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

const EMOJI_SUGGESTIONS = ['😊','💪','📚','💶','🧘','🥗','💧','😴','📖','🎯','🌿','✍️','🎵','🏃','🧠','❤️']

function QuestionRow({ q, index, total, onChange, onDelete, onMove }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ emoji: q.emoji, label: q.label })

  function save() {
    if (!draft.label.trim()) return
    onChange(q.id, { emoji: draft.emoji || '❓', label: draft.label.trim() })
    setEditing(false)
  }

  function cancel() {
    setDraft({ emoji: q.emoji, label: q.label })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="bg-paper-50 border border-paper-300 rounded-xl p-3 space-y-2">
        <div className="flex gap-2">
          <div className="w-16">
            <label className="text-xs text-ink-muted block mb-1">Emoji</label>
            <input
              type="text"
              value={draft.emoji}
              onChange={e => setDraft(d => ({ ...d, emoji: e.target.value }))}
              className="w-full border border-paper-300 rounded-lg px-2 py-1.5 text-center text-lg bg-white outline-none focus:ring-2 focus:ring-ink/20"
              maxLength={4}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-ink-muted block mb-1">Domanda</label>
            <input
              type="text"
              autoFocus
              value={draft.label}
              onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
              className="w-full border border-paper-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-ink/20 text-ink"
              placeholder="Scrivi la domanda…"
            />
          </div>
        </div>
        {/* Emoji quick-pick */}
        <div className="flex flex-wrap gap-1">
          {EMOJI_SUGGESTIONS.map(e => (
            <button
              key={e}
              onClick={() => setDraft(d => ({ ...d, emoji: e }))}
              className={`text-lg w-8 h-8 rounded-lg transition-colors ${draft.emoji === e ? 'bg-paper-300' : 'hover:bg-paper-200'}`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={cancel} className="flex-1 py-1.5 text-sm border border-paper-300 rounded-lg text-ink-muted hover:bg-paper-100 transition-colors">
            Annulla
          </button>
          <button
            onClick={save}
            disabled={!draft.label.trim()}
            className="flex-1 py-1.5 text-sm bg-ink text-white rounded-lg hover:bg-ink-light transition-colors disabled:opacity-40"
          >
            Salva
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-2 px-1 group">
      {/* Reorder */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          className="text-ink-muted/40 hover:text-ink-muted disabled:opacity-20 text-xs leading-none"
        >▲</button>
        <button
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
          className="text-ink-muted/40 hover:text-ink-muted disabled:opacity-20 text-xs leading-none"
        >▼</button>
      </div>

      <span className="text-xl w-7 text-center shrink-0">{q.emoji}</span>

      <span className="flex-1 text-sm text-ink">{q.label}</span>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="text-xs px-2.5 py-1 rounded-lg border border-paper-300 text-ink-muted hover:bg-paper-200 transition-colors"
        >
          Modifica
        </button>
        <button
          onClick={() => onDelete(q.id)}
          className="text-xs px-2 py-1 rounded-lg border border-missed/30 text-missed hover:bg-missed/10 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function QuestionsManager({ questions, onSave, onClose }) {
  const [list, setList] = useState(questions)
  const [adding, setAdding] = useState(false)
  const [newQ, setNewQ] = useState({ emoji: '🎯', label: '' })
  const [dirty, setDirty] = useState(false)

  function mark(fn) {
    setList(prev => { const next = fn(prev); setDirty(true); return next })
  }

  function handleChange(id, updates) {
    mark(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  function handleDelete(id) {
    mark(prev => prev.filter(q => q.id !== id))
  }

  function handleMove(index, dir) {
    mark(prev => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function handleAdd() {
    if (!newQ.label.trim()) return
    mark(prev => [...prev, { id: genId(), emoji: newQ.emoji || '❓', label: newQ.label.trim() }])
    setNewQ({ emoji: '🎯', label: '' })
    setAdding(false)
  }

  function handleReset() {
    setList(DEFAULT_QUESTIONS)
    setDirty(true)
  }

  async function handleSave() {
    await onSave(list)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative paper-card rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-200 shrink-0">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink">Obiettivi giornalieri</h2>
            <p className="text-xs text-ink-muted mt-0.5">Personalizza le domande del tuo diario</p>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors text-lg">✕</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-paper-200">
          {list.length === 0 && (
            <p className="text-center text-sm text-ink-muted italic py-6">
              Nessun obiettivo. Aggiungine uno!
            </p>
          )}
          {list.map((q, i) => (
            <QuestionRow
              key={q.id}
              q={q}
              index={i}
              total={list.length}
              onChange={handleChange}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
        </div>

        {/* Add new */}
        <div className="px-4 py-3 border-t border-paper-200 shrink-0">
          {adding ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQ.emoji}
                  onChange={e => setNewQ(d => ({ ...d, emoji: e.target.value }))}
                  className="w-14 border border-paper-300 rounded-lg px-2 py-1.5 text-center text-lg bg-white outline-none focus:ring-2 focus:ring-ink/20"
                  maxLength={4}
                />
                <input
                  type="text"
                  autoFocus
                  value={newQ.label}
                  onChange={e => setNewQ(d => ({ ...d, label: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
                  placeholder="Nuova domanda / obiettivo…"
                  className="flex-1 border border-paper-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-ink/20 text-ink"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)} className="flex-1 py-1.5 text-sm border border-paper-300 rounded-lg text-ink-muted hover:bg-paper-100 transition-colors">
                  Annulla
                </button>
                <button onClick={handleAdd} disabled={!newQ.label.trim()} className="flex-1 py-1.5 text-sm bg-ink text-white rounded-lg hover:bg-ink-light transition-colors disabled:opacity-40">
                  Aggiungi
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full py-2 text-sm border border-dashed border-paper-300 rounded-xl text-ink-muted hover:border-ink/30 hover:text-ink transition-colors"
            >
              + Aggiungi obiettivo
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-paper-200 bg-paper-50 rounded-b-2xl shrink-0">
          <button
            onClick={handleReset}
            className="text-xs text-ink-muted hover:text-ink underline underline-offset-2 transition-colors"
          >
            Ripristina predefiniti
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-ink text-white text-sm font-medium rounded-xl hover:bg-ink-light transition-colors"
          >
            {dirty ? 'Salva modifiche' : 'Chiudi'}
          </button>
        </div>
      </div>
    </div>
  )
}
