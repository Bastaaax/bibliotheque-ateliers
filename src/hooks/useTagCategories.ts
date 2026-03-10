import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { TagCategory } from '../types'

export function useTagCategories() {
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['tag-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tag_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name')
      if (error) throw error
      return (data ?? []) as TagCategory[]
    },
  })

  const createCategory = useMutation({
    mutationFn: async (data: { name: string; sort_order?: number }) => {
      const { data: cat, error } = await supabase
        .from('tag_categories')
        .insert(data as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return cat as TagCategory
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-categories'] })
    },
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TagCategory> }) => {
      const { data: cat, error } = await supabase
        .from('tag_categories')
        .update(data as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return cat as TagCategory
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-categories'] })
    },
  })

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tag_categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-categories'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })

  return {
    categories: categories ?? [],
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
