import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()

  const [mode,        setMode]        = useState('login')   // 'login' | 'register'
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [displayName, setDisplayName] = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')
  const [loading,     setLoading]     = useState(false)

  function reset() {
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    reset()

    if (!email.trim() || !password.trim()) {
      setError('Email e password sono obbligatorie.')
      return
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setError('Inserisci un nome visualizzato.')
        return
      }
      if (password.length < 6) {
        setError('La password deve avere almeno 6 caratteri.')
        return
      }
      if (password !== confirmPwd) {
        setError('Le password non coincidono.')
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password, displayName.trim())
        setSuccess('Account creato! Puoi accedere ora.')
        setMode('login')
        setPassword('')
        setConfirmPwd('')
      }
    } catch (err) {
      // Traduce i messaggi Supabase in italiano
      const msg = err.message || ''
      if (msg.includes('Invalid login credentials'))
        setError('Email o password errati.')
      else if (msg.includes('User already registered') || msg.includes('already been registered'))
        setError('Questa email è già registrata. Prova ad accedere.')
      else if (msg.includes('Password should be at least'))
        setError('La password deve avere almeno 6 caratteri.')
      else if (msg.includes('Unable to validate email'))
        setError('Inserisci un indirizzo email valido.')
      else
        setError(msg || 'Errore sconosciuto. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  function switchMode(m) {
    setMode(m)
    reset()
    setPassword('')
    setConfirmPwd('')
  }

  return (
    <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">📔</div>
        <h1 className="font-serif text-3xl font-bold text-ink tracking-wide">Diario</h1>
        <p className="text-sm text-ink-muted mt-1">Il tuo spazio personale</p>
      </div>

      {/* Card */}
      <div className="paper-card rounded-2xl w-full max-w-sm p-6 shadow-lg">

        {/* Tab switch */}
        <div className="flex bg-paper-200 rounded-xl p-1 mb-6">
          {[
            { key: 'login',    label: 'Accedi'    },
            { key: 'register', label: 'Registrati' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={[
                'flex-1 py-1.5 text-sm font-medium rounded-lg transition-all',
                mode === key
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>

          {/* Nome visualizzato (solo registrazione) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Nome visualizzato
              </label>
              <input
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Come vuoi essere chiamato?"
                className="w-full border border-paper-300 rounded-lg px-3 py-2 text-sm bg-paper-50 outline-none focus:ring-2 focus:ring-ink/20 text-ink"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="la-tua@email.com"
              className="w-full border border-paper-300 rounded-lg px-3 py-2 text-sm bg-paper-50 outline-none focus:ring-2 focus:ring-ink/20 text-ink"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">Password</label>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Minimo 6 caratteri' : '••••••••'}
              className="w-full border border-paper-300 rounded-lg px-3 py-2 text-sm bg-paper-50 outline-none focus:ring-2 focus:ring-ink/20 text-ink"
            />
          </div>

          {/* Conferma password (solo registrazione) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Conferma password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="Ripeti la password"
                className="w-full border border-paper-300 rounded-lg px-3 py-2 text-sm bg-paper-50 outline-none focus:ring-2 focus:ring-ink/20 text-ink"
              />
            </div>
          )}

          {/* Errore */}
          {error && (
            <div className="text-xs text-missed bg-missed/10 border border-missed/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Successo */}
          {success && (
            <div className="text-xs text-done bg-done/10 border border-done/20 rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-2.5 rounded-xl bg-ink text-white text-sm font-medium hover:bg-ink-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? (mode === 'login' ? 'Accesso in corso…' : 'Registrazione…')
              : (mode === 'login' ? 'Accedi' : 'Crea account')
            }
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-ink-muted text-center">
        I tuoi dati sono privati e visibili solo a te.
      </p>
    </div>
  )
}
