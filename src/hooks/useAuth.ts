import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  return typeof url === 'string' && url.length > 0
}

export function useAuth() {
  const queryClient = useQueryClient()
  const configured = isSupabaseConfigured()

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      if (!configured) return null
      const { data } = await supabase.auth.getSession()
      return data.session
    },
    enabled: configured,
    retry: false,
  })

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (error) throw error
      return data as Profile
    },
    enabled: !!session?.user?.id,
  })

  const signIn = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })

  const signUp = useMutation({
    mutationFn: async ({
      email,
      password,
      fullName,
    }: {
      email: string
      password: string
      fullName: string
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })

  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })

  return {
    session,
    profile,
    isAdmin: profile?.role === 'admin',
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session,
    isLoading: configured ? (sessionLoading || profileLoading) : false,
    isSupabaseConfigured: configured,
  }
}
