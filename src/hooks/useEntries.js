import { useState, useCallback } from 'react'
import { getAllEntries, getEntry, saveEntry } from '../utils/storage'

export function useEntries() {
  const [entries, setEntries] = useState(() => getAllEntries())

  const refresh = useCallback(() => {
    setEntries(getAllEntries())
  }, [])

  const updateEntry = useCallback((date, data) => {
    saveEntry(date, data)
    setEntries(getAllEntries())
  }, [])

  return { entries, updateEntry, refresh, getEntry: (d) => entries[d] || null }
}
