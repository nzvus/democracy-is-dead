'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
        } else {
          const { data: anonData, error } = await supabase.auth.signInAnonymously()
          if (error) throw error
          setUser(anonData.user)
        }
      } catch (error: any) {
        console.error("Auth error:", error)
        toast.error("Errore di autenticazione: " + error.message)
      } finally {
        setLoading(false)
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    }

    initAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)