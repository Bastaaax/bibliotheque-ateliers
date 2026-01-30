import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tag } from '../types'

export function useTags() {
  const queryClient = useQueryClient()

  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      if (error) throw error
      return (data ?? []) as Tag[]
    },
  })

  const createTag = useMutation({
    mutationFn: async (data: Omit<Tag, 'id' | 'created_at'>) => {
      const { data: tag, error } = await supabase
        .from('tags')
        .insert(data as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return tag as Tag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })

  const updateTag = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tag> }) => {
      const { data: tag, error } = await supabase
        .from('tags')
        .update(data as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return tag as Tag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tags').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })

  return {
    tags: tags ?? [],
    isLoading,
    createTag,
    updateTag,
    deleteTag,
  }
}
