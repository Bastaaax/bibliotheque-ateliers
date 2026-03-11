import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

/**
 * Retourne la liste des objectifs distincts utilisés dans les ateliers
 * (pour filtre et suggestions dans le formulaire).
 */
export function useUniqueObjectives() {
  const { data: objectives = [], isLoading } = useQuery({
    queryKey: ['workshops-objectives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workshops')
        .select('objectives')
      if (error) throw error
      const set = new Set<string>()
      ;(data ?? []).forEach((row: { objectives: string[] | null }) => {
        const arr = row?.objectives
        if (Array.isArray(arr)) arr.forEach((o) => o?.trim() && set.add(o.trim()))
      })
      return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
    },
  })
  return { objectives, isLoading }
}
