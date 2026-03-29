import { createClient } from '@supabase/supabase-js'

// L'anon key è pubblica per design: è sicura nel codice frontend
const url = import.meta.env.VITE_SUPABASE_URL
  || 'https://qxigdkunffvdbrsyyzej.supabase.co'

const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWdka3VuZmZ2ZGJyc3l5emVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDcxMzUsImV4cCI6MjA5MDM4MzEzNX0.yYaKCxskZU8aP1t2y0NlgtymSLQI9IILsUWaK-ZFdcU'

export const supabase = createClient(url, key)
