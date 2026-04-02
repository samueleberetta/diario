import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const DEFAULT_QUESTIONS = [
  { id: 'workout', emoji: '💪', label: 'Ti sei allenato oggi?' },
  { id: 'feeling', emoji: '😊', label: 'Stai bene oggi?' },
]

const LS_KEY = (uid) => `diario_questions_${uid}`

export function useQuestions(userId) {
  const [questions,    setQuestions]    = useState(DEFAULT_QUESTIONS)
  const [loading,      setLoading]      = useState(true)
  const [saveError,    setSaveError]    = useState(null)

  useEffect(() => {
    if (!userId) return
    fetchQuestions()
  }, [userId])

  async function fetchQuestions() {
    // 1. Carica subito dal localStorage per evitare il flash dei default
    try {
      const cached = localStorage.getItem(LS_KEY(userId))
      if (cached) setQuestions(JSON.parse(cached))
    } catch {}

    // 2. Legge dal DB (fonte di verità)
    const { data, error } = await supabase
      .from('profiles')
      .select('custom_questions')
      .eq('id', userId)
      .single()

    if (error?.code === 'PGRST116') {
      // Profilo mancante — lo crea (trigger non è girato)
      await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' })
    } else if (!error && data?.custom_questions) {
      setQuestions(data.custom_questions)
      // Aggiorna la cache locale con i dati freschi dal DB
      try { localStorage.setItem(LS_KEY(userId), JSON.stringify(data.custom_questions)) } catch {}
    }

    setLoading(false)
  }

  const saveQuestions = useCallback(async (newQuestions) => {
    setSaveError(null)
    setQuestions(newQuestions)

    // Salva subito nel localStorage (backup immediato)
    try { localStorage.setItem(LS_KEY(userId), JSON.stringify(newQuestions)) } catch {}

    // Salva nel DB
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, custom_questions: newQuestions },
        { onConflict: 'id' }
      )

    if (error) {
      const detail = error.message || error.details || error.hint || error.code || JSON.stringify(error)
      console.error('[useQuestions] Errore salvataggio su DB:', error)
      setSaveError(`Salvataggio DB fallito: ${detail}`)
    }
  }, [userId])

  return { questions, loading, saveError, saveQuestions }
}
