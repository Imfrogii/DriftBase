'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type DbUser = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  dbUser: DbUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({
  children,
  initialUser,
  initialDbUser,
}: {
  children: React.ReactNode
  initialUser: User | null
  initialDbUser: DbUser | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [dbUser, setDbUser] = useState<DbUser | null>(initialDbUser)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Fetch user profile from database
        const { data: dbUserData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setDbUser(dbUserData)
      } else {
        setDbUser(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setDbUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
