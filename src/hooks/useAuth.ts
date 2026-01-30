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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      // Requête directe avec Accept: application/json (évite 406 PostgREST)
      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(session.user.id)}`,
        {
          method: 'GET',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${session.access_token}`,
            Accept: 'application/json',
            'Accept-Profile': 'public',
          },
        }
      )
      if (!res.ok) {
        if (res.status === 406) return null
        throw new Error(`Profiles: ${res.status}`)
      }
      const data = await res.json()
      const existing = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (existing) return existing as Profile
      // Profil absent ou non visible (RLS) : upsert (insert ou update) pour le créer/récupérer
      const newProfile = {
        id: session.user.id,
        email: session.user.email ?? '',
        full_name: (session.user.user_metadata?.full_name as string) ?? null,
        role: 'contributor',
        avatar_url: null,
      }
      const { data: upserted, error: upsertError } = await supabase
        .from('profiles')
        .upsert(newProfile as Record<string, unknown>, { onConflict: 'id' })
        .select()
      if (!upsertError && Array.isArray(upserted) && upserted.length > 0) {
        return upserted[0] as Profile
      }
      if (upsertError) {
        console.warn('Profil upsert échoué (RLS ? exécute supabase/fix-profiles-rls.sql):', upsertError.message)
      }
      return null
    },
    enabled: !!session?.user?.id,
    retry: false,
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
