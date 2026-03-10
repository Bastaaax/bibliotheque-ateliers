import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Integration } from '../types'

const INTEGRATION_TYPE_GDRIVE = 'gdrive'

export function useIntegrations() {
  const queryClient = useQueryClient()

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)
      if (error) throw error
      return (data ?? []) as Integration[]
    },
  })

  const gdrive = integrations?.find((i) => i.type === INTEGRATION_TYPE_GDRIVE) ?? null
  const isGDriveConnected = !!gdrive?.access_token || !!gdrive?.refresh_token

  const disconnectGDrive = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      const { error } = await supabase
        .from('integrations')
        .update({
          access_token: null,
          refresh_token: null,
          config: {},
        } as Record<string, unknown>)
        .eq('user_id', user.id)
        .eq('type', INTEGRATION_TYPE_GDRIVE)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
  })

  return {
    integrations: integrations ?? [],
    gdrive,
    isGDriveConnected,
    disconnectGDrive,
    isLoading,
  }
}
