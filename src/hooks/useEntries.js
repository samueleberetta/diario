import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useEntries(userId) {
  const [entries, setEntries] = useState({})   // { 'YYYY-MM-DD': entry }
  const [loading, setLoading] = useState(true)

  // Carica tutti gli entries del mese visibile (e vicini) al mount
  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId])

  async function fetchAll() {
    setLoading(true)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
    if (!error && data) {
      const map = {}
      data.forEach(row => {
        map[row.date] = {
          date:      row.date,
          diary:     row.diary     || '',
          questions: row.questions || {},
        }
      })
      setEntries(map)
    }
    setLoading(false)
  }

  const updateEntry = useCallback(async (date, data) => {
    // Ottimistic update locale immediato
    setEntries(prev => ({
      ...prev,
      [date]: { ...prev[date], ...data, date },
    }))

    // Upsert su Supabase
    const { error } = await supabase
      .from('entries')
      .upsert(
        { user_id: userId, date, ...data },
        { onConflict: 'user_id,date' }
      )

    if (error) {
      console.error('Errore salvataggio entry:', error.message)
      // In caso di errore, ricarica dal server
      fetchAll()
    }
  }, [userId])

  const getEntry = useCallback((date) => entries[date] || null, [entries])

  return { entries, loading, updateEntry, getEntry }
}
