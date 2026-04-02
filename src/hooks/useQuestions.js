import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const DEFAULT_QUESTIONS = [
  { id: 'workout', emoji: '💪', label: 'Ti sei allenato oggi?' },
  { id: 'feeling', emoji: '😊', label: 'Stai bene oggi?' },
]

const lsKey = (uid) => `diario_questions_${uid}`

function readLS(userId) {
  try {
    const raw = localStorage.getItem(lsKey(userId))
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function writeLS(userId, questions) {
  try { localStorage.setItem(lsKey(userId), JSON.stringify(questions)) } catch {}
}

export function useQuestions(userId) {
  // Inizializza SUBITO dal localStorage — nessun flash dei default
  const [questions, setQuestions] = useState(() => readLS(userId) ?? DEFAULT_QUESTIONS)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!userId) return
    syncFromDB()
  }, [userId])

  async function syncFromDB() {
    const { data, error } = await supabase
      .from('profiles')
      .select('custom_questions')
      .eq('id', userId)
      .single()

    if (error?.code === 'PGRST116') {
      // Profilo mancante — crealo
      await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' })
      return
    }

    if (!error && data?.custom_questions) {
      // DB ha dati validi → aggiorna stato e cache locale
      setQuestions(data.custom_questions)
      writeLS(userId, data.custom_questions)
    }
    // Se DB ha custom_questions null, teniamo quelli in localStorage (già nello stato)
  }

  const saveQuestions = useCallback(async (newQuestions) => {
    setSaveError(null)
    // 1. Aggiorna stato e localStorage immediatamente (sincrono)
    setQuestions(newQuestions)
    writeLS(userId, newQuestions)

    // 2. Persiste su DB
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, custom_questions: newQuestions },
        { onConflict: 'id' }
      )

    if (error) {
      const detail = error.message || error.details || error.hint || error.code || JSON.stringify(error)
      console.error('[useQuestions] Errore salvataggio DB:', error)
      setSaveError(`Salvataggio DB fallito: ${detail}`)
    }
  }, [userId])

  return { questions, saveError, saveQuestions }
}
