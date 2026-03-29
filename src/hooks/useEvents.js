import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useEvents(userId) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId])

  async function fetchAll() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (!error && data) {
      setEvents(data.map(r => ({ id: r.id, date: r.date, title: r.title })))
    }
  }

  const addEvent = useCallback(async (event) => {
    const { data, error } = await supabase
      .from('events')
      .insert({ user_id: userId, date: event.date, title: event.title })
      .select()
      .single()
    if (!error && data) {
      setEvents(prev => [...prev, { id: data.id, date: data.date, title: data.title }])
    }
  }, [userId])

  const removeEvent = useCallback(async (id) => {
    // Ottimistic remove
    setEvents(prev => prev.filter(e => e.id !== id))
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) {
      console.error('Errore rimozione evento:', error.message)
      fetchAll()
    }
  }, [userId])

  const eventsForDate = useCallback((date) => {
    return events.filter(e => e.date === date)
  }, [events])

  return { events, addEvent, removeEvent, eventsForDate }
}
