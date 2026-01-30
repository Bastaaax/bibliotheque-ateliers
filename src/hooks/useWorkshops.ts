import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Workshop, WorkshopFilters, WorkshopFormData } from '../types'

export function useWorkshops(filters?: WorkshopFilters) {
  const queryClient = useQueryClient()

  const { data: workshops, isLoading } = useQuery({
    queryKey: ['workshops', filters],
    queryFn: async () => {
      let query = supabase
        .from('workshops')
        .select(
          `
          *,
          creator:profiles(*),
          tags:workshop_tags(tag:tags(*)),
          attachments(*)
        `
        )
        .order('created_at', { ascending: false })

      if (filters?.search?.trim()) {
        const { data: searchResults } = await supabase.rpc('search_workshops', {
          search_query: filters.search.trim(),
        })
        if (searchResults && searchResults.length > 0) {
          const ids = searchResults.map((r: { id: string }) => r.id)
          query = query.in('id', ids)
        } else if (searchResults && searchResults.length === 0) {
          return []
        }
      }

      if (filters?.tagIds && filters.tagIds.length > 0) {
        const { data: workshopIds } = await supabase
          .from('workshop_tags')
          .select('workshop_id')
          .in('tag_id', filters.tagIds)
        if (workshopIds && workshopIds.length > 0) {
          const ids = [...new Set(workshopIds.map((wt) => wt.workshop_id))]
          query = query.in('id', ids)
        } else {
          return []
        }
      }

      if (filters?.creatorId) {
        query = query.eq('creator_id', filters.creatorId)
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }
      if (filters?.durationMin != null) {
        query = query.gte('duration_minutes', filters.durationMin)
      }
      if (filters?.durationMax != null) {
        query = query.lte('duration_minutes', filters.durationMax)
      }
      if (filters?.participantsMin != null) {
        query = query.gte('participants_max', filters.participantsMin)
      }
      if (filters?.participantsMax != null) {
        query = query.lte('participants_min', filters.participantsMax)
      }

      const { data, error } = await query
      if (error) throw error

      return (data || []).map((w: Record<string, unknown>) => ({
        ...w,
        tags: Array.isArray(w.tags)
          ? (w.tags as { tag: unknown }[]).map((t) => t.tag).filter(Boolean)
          : [],
      })) as Workshop[]
    },
  })

  const createWorkshop = useMutation({
    mutationFn: async (data: WorkshopFormData) => {
      const { tagIds, ...workshopData } = data
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data: workshop, error: workshopError } = await supabase
        .from('workshops')
        .insert({
          ...workshopData,
          creator_id: user.id,
        })
        .select()
        .single()

      if (workshopError) throw workshopError

      if (tagIds.length > 0) {
        const { error: tagsError } = await supabase.from('workshop_tags').insert(
          tagIds.map((tagId) => ({
            workshop_id: workshop.id,
            tag_id: tagId,
          }))
        )
        if (tagsError) throw tagsError
      }

      return workshop as Workshop
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
    },
  })

  const updateWorkshop = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkshopFormData }) => {
      const { tagIds, ...workshopData } = data

      const { data: workshop, error: workshopError } = await supabase
        .from('workshops')
        .update(workshopData)
        .eq('id', id)
        .select()
        .single()

      if (workshopError) throw workshopError

      await supabase.from('workshop_tags').delete().eq('workshop_id', id)
      if (tagIds.length > 0) {
        const { error: tagsError } = await supabase.from('workshop_tags').insert(
          tagIds.map((tagId) => ({
            workshop_id: id,
            tag_id: tagId,
          }))
        )
        if (tagsError) throw tagsError
      }

      return workshop as Workshop
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
    },
  })

  const deleteWorkshop = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workshops').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
    },
  })

  return {
    workshops: workshops ?? [],
    isLoading,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
  }
}

export function useWorkshop(id: string | undefined) {
  return useQuery({
    queryKey: ['workshop', id],
    queryFn: async () => {
      if (!id) throw new Error('No id')
      const { data, error } = await supabase
        .from('workshops')
        .select(
          `
          *,
          creator:profiles(*),
          tags:workshop_tags(tag:tags(*)),
          attachments(*)
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        ...data,
        tags: Array.isArray(data?.tags)
          ? (data.tags as { tag: unknown }[]).map((t) => t.tag).filter(Boolean)
          : [],
      } as Workshop
    },
    enabled: !!id,
  })
}
