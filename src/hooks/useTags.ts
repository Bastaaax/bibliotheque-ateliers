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
      return (data ?? []).map((row) => ({
        ...row,
        category_id: row.category_id ?? null,
      })) as Tag[]
    },
  })

  const createTag = useMutation({
    mutationFn: async (data: Omit<Tag, 'id' | 'created_at'>) => {
      const { category_id, ...rest } = data as Tag & { category_id?: string | null }
      const payload: Record<string, unknown> = { ...rest }
      if (category_id != null) payload.category_id = category_id
      const { data: tag, error } = await supabase
        .from('tags')
        .insert(payload)
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
      const payload = { ...data } as Record<string, unknown>
      if ('category_id' in payload && payload.category_id === undefined) delete payload.category_id
      const { data: tag, error } = await supabase
        .from('tags')
        .update(payload)
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
