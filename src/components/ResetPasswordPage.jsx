import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()

  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [done,       setDone]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri.')
      return
    }
    if (password !== confirm) {
      setError('Le password non coincidono.')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(err.message || 'Errore durante il cambio password. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">📔</div>
        <h1 className="font-serif text-3xl font-bold text-ink tracking-wide">Diario</h1>
      </div>

      <div className="paper-card rounded-2xl w-full max-w-sm p-6 shadow-lg">
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="font-serif text-lg font-bold text-ink mb-2">Password aggiornata</h2>
            <p className="text-sm text-ink-muted">Ora puoi accedere con la tua nuova password.</p>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-lg font-bold text-ink mb-1">Nuova password</h2>
            <p className="text-xs text-ink-muted mb-5">Scegli una nuova password per il tuo account.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">Nuova password</label>
                <input
                  type="password"
                  autoFocus
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimo 6 caratteri"
                  className="w-full border border-paper-300 rounded-lg px-3 py-2 text-sm bg-paper-50 outline-none focus:ring-2 focus:ring-ink/20 text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">Conferma password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Ripeti la password"
                  className="w-full border border-paper-300 rounded-lg px-3 py-2 text-sm bg-paper-50 outline-none focus:ring-2 focus:ring-ink/20 text-ink"
                />
              </div>

              {error && (
                <div className="text-xs text-missed bg-missed/10 border border-missed/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full py-2.5 rounded-xl bg-ink text-white text-sm font-medium hover:bg-ink-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvataggio…' : 'Salva nuova password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
