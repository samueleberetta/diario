import { useState, useCallback } from 'react'
import { getAllEvents, saveEvent, deleteEvent } from '../utils/storage'

export function useEvents() {
  const [events, setEvents] = useState(() => getAllEvents())

  const addEvent = useCallback((event) => {
    saveEvent(event)
    setEvents(getAllEvents())
  }, [])

  const removeEvent = useCallback((id) => {
    deleteEvent(id)
    setEvents(getAllEvents())
  }, [])

  const eventsForDate = useCallback((date) => {
    return events.filter(e => e.date === date)
  }, [events])

  return { events, addEvent, removeEvent, eventsForDate }
}
