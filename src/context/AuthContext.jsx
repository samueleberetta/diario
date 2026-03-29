import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,         setUser]         = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [isRecovering, setIsRecovering] = useState(false)
  // Rilevato sincronicamente prima che Supabase pulisca l'hash
  const [justConfirmed, setJustConfirmed] = useState(() => {
    const params = new URLSearchParams(window.location.hash.replace('#', ''))
    return params.get('type') === 'signup'
  })

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true)
      }
      if (event === 'USER_UPDATED') {
        setIsRecovering(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) throw error
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function forgotPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) throw error
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    setIsRecovering(false)
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Utente'

  function dismissConfirmed() {
    setJustConfirmed(false)
    // Pulisce l'hash dall'URL senza ricaricare la pagina
    history.replaceState(null, '', window.location.pathname)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, displayName, isRecovering, justConfirmed,
      signUp, signIn, signOut, forgotPassword, updatePassword, dismissConfirmed,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve essere dentro AuthProvider')
  return ctx
}
