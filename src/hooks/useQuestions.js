import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const DEFAULT_QUESTIONS = [
  { id: 'feeling',  emoji: '😊', label: 'Come stai oggi?' },
  { id: 'workout',  emoji: '💪', label: 'Ti sei allenato oggi?' },
  { id: 'japanese', emoji: '🇯🇵', label: 'Hai studiato giapponese oggi?' },
  { id: 'income',   emoji: '💶', label: 'Hai lavorato per raggiungere 2000€/mese?' },
]

export function useQuestions(userId) {
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchQuestions()
  }, [userId])

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from('profiles')
      .select('custom_questions')
      .eq('id', userId)
      .single()

    if (!error && data?.custom_questions) {
      setQuestions(data.custom_questions)
    }
    setLoading(false)
  }

  const saveQuestions = useCallback(async (newQuestions) => {
    setQuestions(newQuestions)
    await supabase
      .from('profiles')
      .upsert({ id: userId, custom_questions: newQuestions })
  }, [userId])

  return { questions, loading, saveQuestions }
}
