import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isConfigured: false,
})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function initSession() {
      try {
        if (!isSupabaseConfigured) {
          if (isMounted) {
            setLoading(false)
          }
          return
        }

        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.warn('Supabase getSession error:', error.message)
        }

        if (isMounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
        }
      } catch (err) {
        console.warn('Auth initialization error:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initSession()

    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
      )
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null)
      setSession(null)
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    isConfigured: isSupabaseConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

