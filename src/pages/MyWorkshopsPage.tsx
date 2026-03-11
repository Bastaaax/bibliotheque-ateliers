import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { WorkshopCard } from '@/components/workshop/WorkshopCard'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useWorkshops } from '@/hooks/useWorkshops'
import { useTags } from '@/hooks/useTags'
import { useUniqueObjectives } from '@/hooks/useObjectives'
import { useAuth } from '@/hooks/useAuth'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterPanel } from '@/components/search/FilterPanel'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { WorkshopFilters } from '@/types'
import { Plus, Filter, LayoutGrid, List, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

function countActiveFilters(f: WorkshopFilters, excludeCreator = false): number {
  let n = 0
  if (f.tagIds?.length) n += f.tagIds.length
  if (!excludeCreator && f.creatorId) n += 1
  if (f.durationMin != null && f.durationMin > 0) n += 1
  if (f.durationMax != null && f.durationMax < 240) n += 1
  if (f.participantsMin != null) n += 1
  if (f.participantsMax != null) n += 1
  if (f.objectiveText) n += 1
  return n
}

function ActiveFilterChips({
  filters,
  onFiltersChange,
  tags,
  excludeCreator,
}: {
  filters: WorkshopFilters
  onFiltersChange: (f: WorkshopFilters) => void
  tags: { id: string; name: string; color: string }[]
  excludeCreator?: boolean
}) {
  const chips: { key: string; label: string; onRemove: () => void }[] = []

  filters.tagIds?.forEach((tagId) => {
    const tag = tags.find((t) => t.id === tagId)
    chips.push({
      key: `tag-${tagId}`,
      label: tag ? tag.name : 'Tag',
      onRemove: () => {
        const next = (filters.tagIds ?? []).filter((id) => id !== tagId)
        onFiltersChange({ ...filters, tagIds: next.length ? next : undefined })
      },
    })
  })
  if (!excludeCreator && filters.creatorId) {
    chips.push({
      key: 'creator',
      label: 'Créateur ou créatrice (moi)',
      onRemove: () => onFiltersChange({ ...filters, creatorId: undefined }),
    })
  }
  if (filters.durationMin != null && filters.durationMin > 0) {
    chips.push({
      key: 'durationMin',
      label: `Durée min : ${filters.durationMin} min`,
      onRemove: () => onFiltersChange({ ...filters, durationMin: undefined }),
    })
  }
  if (filters.durationMax != null && filters.durationMax < 240) {
    chips.push({
      key: 'durationMax',
      label: `Durée max : ${filters.durationMax} min`,
      onRemove: () => onFiltersChange({ ...filters, durationMax: undefined }),
    })
  }
  if (filters.participantsMin != null) {
    chips.push({
      key: 'participantsMin',
      label: `Participants min : ${filters.participantsMin}`,
      onRemove: () => onFiltersChange({ ...filters, participantsMin: undefined }),
    })
  }
  if (filters.participantsMax != null) {
    chips.push({
      key: 'participantsMax',
      label: `Participants max : ${filters.participantsMax}`,
      onRemove: () => onFiltersChange({ ...filters, participantsMax: undefined }),
    })
  }
  if (filters.objectiveText) {
    chips.push({
      key: 'objective',
      label: `Objectif : ${filters.objectiveText.length > 40 ? `${filters.objectiveText.slice(0, 40)}…` : filters.objectiveText}`,
      onRemove: () => onFiltersChange({ ...filters, objectiveText: undefined }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ key, label, onRemove }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-3 pr-1 text-sm text-primary"
        >
          {label}
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full p-1 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={`Retirer le filtre : ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-muted-foreground"
        onClick={() =>
          onFiltersChange({
            ...filters,
            tagIds: undefined,
            creatorId: excludeCreator ? filters.creatorId : undefined,
            durationMin: undefined,
            durationMax: undefined,
            participantsMin: undefined,
            participantsMax: undefined,
            objectiveText: undefined,
          })
        }
      >
        Tout effacer
      </Button>
    </div>
  )
}

export default function MyWorkshopsPage() {
  const { profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchFromUrl = searchParams.get('q') ?? ''
  const [filters, setFilters] = useState<WorkshopFilters>({
    search: searchFromUrl || undefined,
    tagIds: undefined,
    creatorId: profile?.id,
    dateFrom: undefined,
    dateTo: undefined,
    durationMin: undefined,
    durationMax: undefined,
    participantsMin: undefined,
    participantsMax: undefined,
    objectiveText: undefined,
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterOpen, setFilterOpen] = useState(false)
  const [creators, setCreators] = useState<{ id: string; full_name: string | null }[]>([])

  useEffect(() => {
    if (profile?.id) {
      setFilters((prev) => ({ ...prev, creatorId: profile.id }))
    }
  }, [profile?.id])

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchFromUrl || undefined }))
  }, [searchFromUrl])

  const onSearchChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    setSearchParams(next)
  }

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      search: searchFromUrl.trim() || undefined,
      creatorId: profile?.id ?? filters.creatorId,
    }),
    [filters, searchFromUrl, profile?.id]
  )

  const { workshops, isLoading } = useWorkshops(effectiveFilters)
  const { tags } = useTags()
  const { objectives } = useUniqueObjectives()
  const activeCount = countActiveFilters(filters, true)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name')
      .then(({ data }) => setCreators(data ?? []))
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="w-full min-w-0 sm:max-w-xs lg:max-w-sm">
              <SearchBar
                value={searchFromUrl}
                onChange={onSearchChange}
                placeholder="Rechercher dans mes ateliers…"
              />
            </div>
            <div className="flex items-center gap-2">
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" aria-label="Ouvrir les filtres">
                    <Filter className="h-4 w-4" aria-hidden />
                    Filtres
                    {activeCount > 0 && (
                      <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                        {activeCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6">
                    <FilterPanel
                      filters={filters}
                      onFiltersChange={(f) => setFilters({ ...f, creatorId: profile?.id ?? f.creatorId })}
                      tags={tags}
                      creators={creators}
                      objectives={objectives}
                      hideCreatorFilter
                    />
                  </div>
                  <div className="border-t px-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setFilters({
                          ...filters,
                          tagIds: undefined,
                          creatorId: profile?.id,
                          durationMin: undefined,
                          durationMax: undefined,
                          participantsMin: undefined,
                          participantsMax: undefined,
                          objectiveText: undefined,
                        })
                        setFilterOpen(false)
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <div className="flex rounded-lg border border-input p-0.5" role="group" aria-label="Mode d'affichage">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 gap-1.5 px-2.5"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  aria-label="Vue grille"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Grille</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 gap-1.5 px-2.5"
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  aria-label="Vue liste"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Liste</span>
                </Button>
              </div>
            </div>
          </div>
          <Link to="/workshops/new" className="shrink-0">
            <Button variant="brand" size="sm" className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" aria-hidden />
              Nouvel atelier
            </Button>
          </Link>
        </div>
        <ActiveFilterChips
          filters={filters}
          onFiltersChange={(f) => setFilters({ ...f, creatorId: profile?.id ?? f.creatorId })}
          tags={tags}
          excludeCreator
        />
      </div>

      <div className="flex-1 p-4 md:p-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : workshops.length === 0 ? (
          <EmptyState
            title="Aucun atelier créé"
            description="Les ateliers que vous créez apparaîtront ici."
            actionLabel="Créer un atelier"
            actionVariant="brand"
            onAction={() => (window.location.href = '/workshops/new')}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
              {workshops.length} atelier{workshops.length > 1 ? 's' : ''}
            </p>
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'flex flex-col gap-2'
              )}
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
