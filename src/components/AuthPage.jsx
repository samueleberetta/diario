import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

function ForgotPasswordForm({ onBack }) {
  const { forgotPassword } = useAuth()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [sent,    setSent]    = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Inserisci la tua email.'); return }
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err.message || 'Errore durante l\'invio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="paper-card rounded-2xl w-full max-w-sm p-6 shadow-lg">
      {sent ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">📬</div>
          <h2 className="font-serif text-lg font-bold text-ink mb-2">Email inviata</h2>
          <p className="text-sm text-ink-muted mb-4">
            Controlla la tua casella di posta. Ti abbiamo inviato un link per reimpostare la password.
          </p>
          <button onClick={onBack} className="text-sm text-ink-muted underline underline-offset-2 hover:text-ink">
            Torna al login
          </button>
        </div>
      ) : (
        <>
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink mb-4 transition-colors">
            ← Torna al login
          </button>
          <h2 className="font-serif text-lg font-bold text-ink mb-1">Password dimenticata</h2>
          <p className="text-xs text-ink-muted mb-5">
            Inserisci la tua email e ti mandiamo un link per reimpostare la password.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Email</label>
              <input
                type="email"
                autoFocus
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="la-tua@email.com"
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
              {loading ? 'Invio in corso…' : 'Invia link di reset'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

function InstallBanner() {
  const { prompt, isInstalled, triggerInstall, showIOSInstructions, showAndroidInstructions } = useInstallPrompt()
  const [showIOS,     setShowIOS]     = useState(false)
  const [showAndroid, setShowAndroid] = useState(false)
  const [installed,   setInstalled]   = useState(false)

  if (isInstalled || installed) return null

  // Android/Chrome: prompt nativo disponibile
  if (prompt) {
    return (
      <button
        onClick={async () => { const ok = await triggerInstall(); if (ok) setInstalled(true) }}
        className="flex items-center gap-2 w-full max-w-sm px-4 py-3 rounded-2xl border border-paper-300 bg-white/70 hover:bg-white transition-colors shadow-sm"
      >
        <span className="text-xl">📲</span>
        <div className="text-left flex-1">
          <p className="text-sm font-medium text-ink">Scarica l'app</p>
          <p className="text-xs text-ink-muted">Installa sul tuo dispositivo</p>
        </div>
        <span className="text-ink-muted text-xs border border-paper-300 rounded-lg px-2 py-1">Installa</span>
      </button>
    )
  }

  // Android/Chrome: prompt non ancora disponibile → istruzioni manuali
  if (showAndroidInstructions) {
    return (
      <div className="w-full max-w-sm">
        <button
          onClick={() => setShowAndroid(s => !s)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-2xl border border-paper-300 bg-white/70 hover:bg-white transition-colors shadow-sm"
        >
          <span className="text-xl">📲</span>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-ink">Scarica l'app</p>
            <p className="text-xs text-ink-muted">Aggiungi alla schermata Home</p>
          </div>
          <span className="text-ink-muted text-lg">{showAndroid ? '▲' : '▼'}</span>
        </button>

        {showAndroid && (
          <div className="mt-2 bg-white border border-paper-300 rounded-2xl px-4 py-4 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Come installare su Android</p>
            {[
              { n: '1', icon: '⋮',  text: 'Tocca i tre puntini in alto a destra in Chrome' },
              { n: '2', icon: '➕', text: 'Tocca "Aggiungi a schermata Home" o "Installa app"' },
              { n: '3', icon: '✅', text: 'Conferma toccando "Aggiungi"' },
            ].map(({ n, icon, text }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-ink text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                <div className="flex items-start gap-1.5">
                  <span className="text-lg leading-none">{icon}</span>
                  <p className="text-sm text-ink">{text}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-ink-muted pt-1 border-t border-paper-200">
              L'app apparirà nella home come un'icona normale, senza barra del browser.
            </p>
          </div>
        )}
      </div>
    )
  }

  // iPhone/Safari: istruzioni manuali
  if (showIOSInstructions) {
    return (
      <div className="w-full max-w-sm">
        <button
          onClick={() => setShowIOS(s => !s)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-2xl border border-paper-300 bg-white/70 hover:bg-white transition-colors shadow-sm"
        >
          <span className="text-xl">📲</span>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-ink">Scarica l'app</p>
            <p className="text-xs text-ink-muted">Aggiungi alla schermata Home</p>
          </div>
          <span className="text-ink-muted text-lg">{showIOS ? '▲' : '▼'}</span>
        </button>

        {showIOS && (
          <div className="mt-2 bg-white border border-paper-300 rounded-2xl px-4 py-4 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Come installare su iPhone</p>
            {[
              { n: '1', icon: '⬆️', text: 'Tocca il tasto Condividi in fondo allo schermo' },
              { n: '2', icon: '➕', text: 'Scorri e tocca "Aggiungi a schermata Home"' },
              { n: '3', icon: '✅', text: 'Tocca "Aggiungi" in alto a destra' },
            ].map(({ n, icon, text }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-ink text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                <div className="flex items-start gap-1.5">
                  <span>{icon}</span>
                  <p className="text-sm text-ink">{text}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-ink-muted pt-1 border-t border-paper-200">
              L'app apparirà nella home come un'icona normale, senza barra del browser.
            </p>
          </div>
        )}
      </div>
    )
  }

  return null
}

export default function AuthPage() {
  const { signIn, signUp } = useAuth()

  const [mode,        setMode]        = useState('login')
  const [showForgot,  setShowForgot]  = useState(false)
  const [checkEmail,  setCheckEmail]  = useState(false)
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [displayName, setDisplayName] = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  function reset() {
    setError('')
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
        setCheckEmail(true)
      }
    } catch (err) {
      const msg = typeof err.message === 'string' ? err.message : ''
      if (msg.includes('Invalid login credentials'))
        setError('Email o password errati.')
      else if (msg.includes('User already registered') || msg.includes('already been registered'))
        setError('Questa email è già registrata. Prova ad accedere.')
      else if (msg.includes('Password should be at least'))
        setError('La password deve avere almeno 6 caratteri.')
      else if (msg.includes('Unable to validate email'))
        setError('Inserisci un indirizzo email valido.')
      else if (msg.includes('sending') || msg.includes('email') || msg === '{}' || msg === '')
        setError('Errore nell\'invio dell\'email di conferma. Controlla le impostazioni SMTP in Supabase.')
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

  if (showForgot) {
    return (
      <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center px-4 gap-4">
        <div className="mb-2 text-center">
          <div className="text-5xl mb-3">📔</div>
          <h1 className="font-serif text-3xl font-bold text-ink tracking-wide">Diario</h1>
        </div>
        <ForgotPasswordForm onBack={() => setShowForgot(false)} />
      </div>
    )
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center px-4">
        <div className="paper-card rounded-2xl w-full max-w-sm p-8 shadow-lg text-center">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="font-serif text-2xl font-bold text-ink mb-3">
            Controlla la tua email
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed mb-2">
            Ti abbiamo inviato un link di conferma a
          </p>
          <p className="text-sm font-medium text-ink mb-5 break-all">{email}</p>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            Clicca il link nell'email per attivare il tuo account e iniziare a usare il Diario.
          </p>
          <div className="border-t border-paper-200 pt-4">
            <p className="text-xs text-ink-muted mb-2">Non hai ricevuto nulla?</p>
            <button
              onClick={() => { setCheckEmail(false); setMode('register') }}
              className="text-xs text-ink underline underline-offset-2 hover:text-ink-light transition-colors"
            >
              Torna indietro e riprova
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center px-4 gap-4">
      {/* Logo */}
      <div className="mb-2 text-center">
        <div className="text-5xl mb-3">📔</div>
        <h1 className="font-serif text-3xl font-bold text-ink tracking-wide">Diario</h1>
        <p className="text-sm text-ink-muted mt-1">Il tuo spazio personale</p>
      </div>

      {/* Install banner */}
      <InstallBanner />

      {/* Card */}
      <div className="paper-card rounded-2xl w-full max-w-sm p-6 shadow-lg">
        {/* Tab switch */}
        <div className="flex bg-paper-200 rounded-xl p-1 mb-6">
          {[
            { key: 'login',    label: 'Accedi'     },
            { key: 'register', label: 'Registrati' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={[
                'flex-1 py-1.5 text-sm font-medium rounded-lg transition-all',
                mode === key ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Nome visualizzato</label>
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-ink-muted">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-ink-muted hover:text-ink underline underline-offset-2 transition-colors"
                >
                  Password dimenticata?
                </button>
              )}
            </div>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Minimo 6 caratteri' : '••••••••'}
              className="w-full border border-paper-300 rounded-lg px-3 py-2 text-sm bg-paper-50 outline-none focus:ring-2 focus:ring-ink/20 text-ink"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Conferma password</label>
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
            {loading
              ? (mode === 'login' ? 'Accesso in corso…' : 'Registrazione…')
              : (mode === 'login' ? 'Accedi' : 'Crea account')
            }
          </button>
        </form>
      </div>

      <p className="text-xs text-ink-muted text-center pb-8">
        I tuoi dati sono privati e visibili solo a te.
      </p>
    </div>
  )
}
