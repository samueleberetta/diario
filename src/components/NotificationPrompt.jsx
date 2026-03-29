import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationPrompt({ userId }) {
  const { permission, subscribed, loading, isSupported, requestAndSubscribe, unsubscribe } = useNotifications(userId)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('notif_dismissed') === '1'
  )

  if (!isSupported) return null
  if (dismissed && !subscribed) return null

  // Già iscritto → mostra solo il toggle nelle impostazioni (usato dall'header)
  if (subscribed) return null

  // Permesso negato dall'utente → non mostrare nulla
  if (permission === 'denied') return null

  async function handleEnable() {
    const ok = await requestAndSubscribe()
    if (!ok && Notification.permission === 'denied') {
      // Utente ha negato dal popup del browser
    }
  }

  function handleDismiss() {
    localStorage.setItem('notif_dismissed', '1')
    setDismissed(true)
  }

  return (
    <div className="mx-2 mb-4 flex items-start gap-3 bg-white border border-paper-300 rounded-xl px-4 py-3 shadow-sm">
      <span className="text-2xl mt-0.5">🔔</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">Attiva i promemoria</p>
        <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
          Ogni sera alle 21:30 riceverai una notifica: <em>"Com'è andata oggi?"</em>
        </p>
        <div className="flex gap-2 mt-2.5">
          <button
            onClick={handleEnable}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-ink text-white font-medium hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Attivazione…' : 'Attiva'}
          </button>
          <button
            onClick={handleDismiss}
            className="text-xs px-3 py-1.5 rounded-lg border border-paper-300 text-ink-muted hover:bg-paper-100 transition-colors"
          >
            Non ora
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente compatto per le impostazioni utente (nel dropdown header)
export function NotificationToggle({ userId }) {
  const { subscribed, loading, isSupported, requestAndSubscribe, unsubscribe, permission } = useNotifications(userId)

  if (!isSupported) return null
  if (permission === 'denied') return (
    <div className="px-3 py-2 text-xs text-ink-muted border-t border-paper-200">
      🔕 Notifiche bloccate dal browser
    </div>
  )

  return (
    <button
      onClick={subscribed ? unsubscribe : requestAndSubscribe}
      disabled={loading}
      className="w-full text-left px-3 py-2 text-sm text-ink-light hover:bg-paper-100 transition-colors border-t border-paper-200 flex items-center gap-2"
    >
      <span>{subscribed ? '🔔' : '🔕'}</span>
      <span>{loading ? '…' : subscribed ? 'Notifiche attive' : 'Attiva notifiche'}</span>
    </button>
  )
}
