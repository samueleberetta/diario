import { useState } from 'react'

const TUTORIALS = {
  'ios-safari': {
    title: 'Installa su iPhone / iPad',
    steps: [
      { icon: '⬆️', text: 'Tocca il tasto Condividi in basso (Safari)' },
      { icon: '➕', text: 'Scorri e tocca "Aggiungi a schermata Home"' },
      { icon: '✅', text: 'Tocca "Aggiungi" in alto a destra' },
    ],
  },
  'ios-chrome': {
    title: 'Installa su iPhone',
    steps: [
      { icon: '🔗', text: 'Apri questa pagina in Safari (Chrome su iOS non supporta l\'installazione diretta)' },
      { icon: '⬆️', text: 'Tocca il tasto Condividi in basso' },
      { icon: '➕', text: 'Tocca "Aggiungi a schermata Home" → "Aggiungi"' },
    ],
  },
  'android-chrome': {
    title: 'Installa su Android',
    steps: [
      { icon: '⋮', text: 'Tocca i tre puntini in alto a destra in Chrome' },
      { icon: '➕', text: 'Tocca "Aggiungi a schermata Home" o "Installa app"' },
      { icon: '✅', text: 'Conferma toccando "Aggiungi"' },
    ],
  },
  'android-samsung': {
    title: 'Installa su Samsung Internet',
    steps: [
      { icon: '☰', text: 'Tocca il menu (tre linee) in basso a destra' },
      { icon: '➕', text: 'Tocca "Aggiungi pagina a" → "Schermata Home"' },
      { icon: '✅', text: 'Tocca "Aggiungi"' },
    ],
  },
  'android-firefox': {
    title: 'Installa su Android',
    steps: [
      { icon: '⋮', text: 'Tocca i tre puntini in alto a destra in Firefox' },
      { icon: '➕', text: 'Tocca "Installa"' },
      { icon: '✅', text: 'Conferma l\'installazione' },
    ],
  },
  'desktop-prompt': {
    title: 'Installa sul tuo computer',
    steps: [
      { icon: '⬇️', text: 'Clicca il pulsante "Installa subito" qui sotto' },
      { icon: '✅', text: 'Conferma l\'installazione nel popup del browser' },
    ],
  },
}

export default function InstallModal({ platform, prompt, triggerInstall, onClose }) {
  const [installed, setInstalled] = useState(false)

  if (installed) return null

  const tutorial = TUTORIALS[platform]

  async function handleInstall() {
    const ok = await triggerInstall()
    if (ok) { setInstalled(true); onClose() }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-paper-50 rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">📲</span>
            <p className="font-serif text-base font-bold text-ink">Scarica l'app</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Bottone nativo se disponibile */}
          {prompt && (
            <button
              onClick={handleInstall}
              className="w-full py-2.5 rounded-xl bg-ink text-white text-sm font-medium hover:bg-ink-light transition-colors"
            >
              Installa subito →
            </button>
          )}

          {tutorial && (
            <>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider pt-1">
                {tutorial.title}
              </p>
              {tutorial.steps.map(({ icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-ink text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex items-start gap-1.5">
                    <span className="text-lg leading-none">{icon}</span>
                    <p className="text-sm text-ink">{text}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {!tutorial && platform === 'unknown' && (
            <p className="text-sm text-ink-muted text-center py-2">
              Usa il menu del tuo browser per aggiungere questa pagina alla schermata Home.
            </p>
          )}
        </div>

        <div className="px-5 pb-4">
          <p className="text-xs text-ink-muted border-t border-paper-200 pt-3">
            L'app apparirà nella home come un'icona normale, senza barra del browser.
          </p>
        </div>
      </div>
    </div>
  )
}
