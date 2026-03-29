import { useState, useEffect, useRef, useCallback } from 'react'

export default function DiaryEditor({ value, onChange, readOnly }) {
  const [text, setText] = useState(value || '')
  const [saved, setSaved] = useState(true)
  const timerRef = useRef(null)
  const prevValue = useRef(value)

  // Sync if parent changes value (e.g., switching days)
  useEffect(() => {
    if (value !== prevValue.current) {
      setText(value || '')
      setSaved(true)
      prevValue.current = value
    }
  }, [value])

  const handleChange = useCallback((e) => {
    const v = e.target.value
    setText(v)
    setSaved(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(v)
      setSaved(true)
    }, 800)
  }, [onChange])

  const handleSaveNow = () => {
    clearTimeout(timerRef.current)
    onChange(text)
    setSaved(true)
  }

  return (
    <div className="paper-card rounded-lg overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-paper-200">
        <div className="flex items-center gap-2">
          <span className="text-base">✍️</span>
          <span className="font-serif text-base font-semibold text-ink">Diario</span>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {!saved && (
              <span className="text-xs text-ink-muted italic">modificato…</span>
            )}
            {saved && text && (
              <span className="text-xs text-done">✓ salvato</span>
            )}
            <button
              onClick={handleSaveNow}
              disabled={saved}
              className={[
                'text-xs px-3 py-1 rounded-full border transition-all',
                saved
                  ? 'border-paper-200 text-ink-muted cursor-default'
                  : 'border-done text-done hover:bg-done hover:text-white',
              ].join(' ')}
            >
              Salva
            </button>
          </div>
        )}
      </div>

      {/* Writing area */}
      <div className="px-5 py-4 lined-paper min-h-[220px]">
        {readOnly ? (
          <p className="font-serif text-[1.05rem] leading-[1.9] text-ink whitespace-pre-wrap">
            {text || <span className="text-ink-muted italic">Nessuna nota scritta.</span>}
          </p>
        ) : (
          <textarea
            className="journal-textarea min-h-[200px]"
            value={text}
            onChange={handleChange}
            placeholder="Scrivi qualcosa su oggi…"
            rows={8}
          />
        )}
      </div>
    </div>
  )
}
