import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { WorkshopCard } from '@/components/workshop/WorkshopCard'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useWorkshops } from '@/hooks/useWorkshops'
import { useTags } from '@/hooks/useTags'
import { supabase } from '@/lib/supabase'
import type { WorkshopFilters } from '@/types'
import { Plus } from 'lucide-react'

export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const searchFromUrl = searchParams.get('q') ?? ''
  const [filters, setFilters] = useState<WorkshopFilters>({
    search: searchFromUrl || undefined,
    tagIds: undefined,
    creatorId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    durationMin: undefined,
    durationMax: undefined,
    participantsMin: undefined,
    participantsMax: undefined,
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [creators, setCreators] = useState<{ id: string; full_name: string | null }[]>([])

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchFromUrl || undefined }))
  }, [searchFromUrl])

  const effectiveFilters = useMemo(
    () => ({ ...filters, search: searchFromUrl.trim() || undefined }),
    [filters, searchFromUrl]
  )

  const { workshops, isLoading } = useWorkshops(effectiveFilters)
  const { tags } = useTags()

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name')
      .then(({ data }) => setCreators(data ?? []))
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        tags={tags}
        creators={creators}
        className="hidden md:block"
      />
      <div className="flex-1 p-4 md:p-6">
          {isLoading ? (
            <LoadingSpinner />
          ) : workshops.length === 0 ? (
            <EmptyState
              title="Aucun atelier"
              description="Créez votre premier atelier ou ajustez les filtres."
              actionLabel="Nouvel atelier"
              onAction={() => (window.location.href = '/workshops/new')}
            />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {workshops.length} atelier(s) trouvé(s)
                </p>
                <Link
                  to="/workshops/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Nouvel atelier
                </Link>
              </div>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'flex flex-col gap-2'
                }
              >
                {workshops.map((workshop) => (
                  <WorkshopCard key={workshop.id} workshop={workshop} />
                ))}
              </div>
            </>
          )}
      </div>
    </div>
  )
}
