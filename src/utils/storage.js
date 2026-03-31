// Storage keys
const KEYS = {
  ENTRIES: 'diario_entries',
  EVENTS:  'diario_events',
}

// ---- Day entries ----
// Entry shape:
// {
//   date: 'YYYY-MM-DD',
//   diary: string,
//   questions: {
//     feeling:  { answer: 'yes'|'no'|'partial', note: string },
//     workout:  { answer: 'yes'|'no'|'partial', note: string },
//     japanese: { answer: 'yes'|'no'|'partial', note: string },
//     income:   { answer: 'yes'|'no'|'partial', note: string },
//   }
// }

export function getAllEntries() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.ENTRIES) || '{}')
  } catch {
    return {}
  }
}

export function getEntry(date) {
  const all = getAllEntries()
  return all[date] || null
}

export function saveEntry(date, data) {
  const all = getAllEntries()
  all[date] = { ...all[date], ...data, date }
  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(all))
}

// ---- Special events ----
// Event shape: { id: string, date: 'YYYY-MM-DD', title: string }

export function getAllEvents() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.EVENTS) || '[]')
  } catch {
    return []
  }
}

export function saveEvent(event) {
  const all = getAllEvents()
  all.push({ ...event, id: Date.now().toString() })
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(all))
}

export function deleteEvent(id) {
  const all = getAllEvents().filter(e => e.id !== id)
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(all))
}

// ---- Day status helpers ----
export const QUESTIONS = [
  { key: 'feeling',  label: 'Come stai oggi?',                       emoji: '😊' },
  { key: 'workout',  label: 'Ti sei allenato oggi?',                  emoji: '💪' },
  { key: 'japanese', label: 'Hai studiato giapponese oggi?',          emoji: '🇯🇵' },
  { key: 'income',   label: 'Hai lavorato per raggiungere 2000€/mese?', emoji: '💶' },
]

/**
 * Returns 'done' | 'partial' | 'missed' | 'empty'
 * questionDefs: array of { id, emoji, label } — se omesso usa QUESTIONS di default
 */
export function getDayStatus(entry, questionDefs) {
  if (!entry) return 'empty'
  const qs = entry.questions || {}
  const defs = questionDefs && questionDefs.length > 0 ? questionDefs : QUESTIONS.map(q => ({ id: q.key }))
  const answers = defs.map(q => qs[q.id]?.answer).filter(Boolean)
  if (answers.length === 0) return entry.diary ? 'partial' : 'empty'

  // Punteggio: yes=1, partial=0.5, no=0 — verde se media ≥50%
  const score = answers.reduce((sum, a) => sum + (a === 'yes' ? 1 : a === 'partial' ? 0.5 : 0), 0)
  const ratio = score / answers.length
  if (ratio >= 0.5) return 'done'
  if (ratio > 0)   return 'partial'
  return 'missed'
}

export function formatDate(date) {
  // date is a Date object → 'YYYY-MM-DD'
  return date.toISOString().slice(0, 10)
}

export function parseDate(str) {
  // 'YYYY-MM-DD' → Date (local midnight)
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function today() {
  return formatDate(new Date())
}
