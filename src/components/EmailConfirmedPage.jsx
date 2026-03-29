export default function EmailConfirmedPage({ onContinue }) {
  return (
    <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center px-4">
      <div className="paper-card rounded-2xl w-full max-w-sm p-8 shadow-lg text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="font-serif text-2xl font-bold text-ink mb-3">
          Email confermata!
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed mb-6">
          Il tuo account è stato verificato con successo.<br />
          Ora puoi accedere al tuo Diario con le tue credenziali.
        </p>
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl bg-ink text-white text-sm font-medium hover:bg-ink-light transition-colors"
        >
          Vai al Diario →
        </button>
      </div>
      <p className="mt-6 text-xs text-ink-muted text-center">
        I tuoi dati sono privati e visibili solo a te.
      </p>
    </div>
  )
}
