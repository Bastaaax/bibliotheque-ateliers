import { useCallback } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagBadge } from '@/components/tags/TagBadge'
import type { WorkshopFilters } from '@/types'
import type { Tag } from '@/types'

const DURATION_OPTIONS = [
  { value: 'none', label: '—' },
  { value: '0', label: '0 min' },
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 h' },
  { value: '90', label: '1 h 30' },
  { value: '120', label: '2 h' },
  { value: '180', label: '3 h' },
  { value: '240', label: '4 h ou plus' },
]

interface FilterPanelProps {
  filters: WorkshopFilters
  onFiltersChange: (filters: WorkshopFilters) => void
  tags: Tag[]
  creators: { id: string; full_name: string | null }[]
  /** Objectifs distincts (pour filtre par objectif) */
  objectives?: string[]
  /** Masquer le filtre par créateur ou créatrice (ex. page "Mes ateliers") */
  hideCreatorFilter?: boolean
}

export function FilterPanel({
  filters,
  onFiltersChange,
  tags,
  creators,
  objectives = [],
  hideCreatorFilter,
}: FilterPanelProps) {
  const updateFilters = useCallback(
    (patch: Partial<WorkshopFilters>) => {
      onFiltersChange({ ...filters, ...patch })
    },
    [filters, onFiltersChange]
  )

  const toggleTag = useCallback(
    (tagId: string) => {
      const current = filters.tagIds ?? []
      const next = current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId]
      updateFilters({ tagIds: next.length > 0 ? next : undefined })
    },
    [filters.tagIds, updateFilters]
  )

  const tagsStages = tags.filter((t) => t.category === 'stage_type')
  const tagsWorkshopTypes = tags.filter((t) => t.category === 'workshop_type')
  const tagsOthers = tags.filter((t) => t.category === 'custom' || !['stage_type', 'workshop_type'].includes(t.category))

  return (
    <div className="space-y-8">
      {/* Stages */}
      {tagsStages.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Stages</Label>
          <div className="flex flex-wrap gap-2">
            {tagsStages.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                onClick={() => toggleTag(tag.id)}
                className={
                  filters.tagIds?.includes(tag.id)
                    ? 'ring-2 ring-primary ring-offset-2'
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Types d'ateliers */}
      {tagsWorkshopTypes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Types d&apos;ateliers</Label>
          <div className="flex flex-wrap gap-2">
            {tagsWorkshopTypes.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                onClick={() => toggleTag(tag.id)}
                className={
                  filters.tagIds?.includes(tag.id)
                    ? 'ring-2 ring-primary ring-offset-2'
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Autres tags */}
      {tagsOthers.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Autres</Label>
          <div className="flex flex-wrap gap-2">
            {tagsOthers.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                onClick={() => toggleTag(tag.id)}
                className={
                  filters.tagIds?.includes(tag.id)
                    ? 'ring-2 ring-primary ring-offset-2'
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Objectifs */}
      {objectives.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Objectif</Label>
          <Select
            value={filters.objectiveText ?? 'all'}
            onValueChange={(v) => updateFilters({ objectiveText: v === 'all' ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les objectifs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les objectifs</SelectItem>
              {objectives.map((obj) => (
                <SelectItem key={obj} value={obj}>
                  {obj.length > 60 ? `${obj.slice(0, 60)}…` : obj}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {creators.length > 0 && !hideCreatorFilter && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Créateur ou créatrice</Label>
          <Select
            value={filters.creatorId ?? 'all'}
            onValueChange={(v) => updateFilters({ creatorId: v === 'all' ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les créateurs et créatrices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les créateurs et créatrices</SelectItem>
              {creators.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.full_name ?? c.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Durée : selects simples */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Durée</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Min</span>
            <Select
              value={filters.durationMin != null ? filters.durationMin.toString() : 'none'}
              onValueChange={(v) =>
                updateFilters({ durationMin: v === 'none' ? undefined : parseInt(v, 10) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Max</span>
            <Select
              value={filters.durationMax != null ? filters.durationMax.toString() : 'none'}
              onValueChange={(v) =>
                updateFilters({ durationMax: v === 'none' ? undefined : parseInt(v, 10) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Participants</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Min</span>
            <Select
              value={filters.participantsMin?.toString() ?? 'any'}
              onValueChange={(v) =>
                updateFilters({
                  participantsMin: v === 'any' ? undefined : parseInt(v, 10),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">—</SelectItem>
                {[5, 10, 15, 20, 30, 50].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Max</span>
            <Select
              value={filters.participantsMax?.toString() ?? 'any'}
              onValueChange={(v) =>
                updateFilters({
                  participantsMax: v === 'any' ? undefined : parseInt(v, 10),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">—</SelectItem>
                {[5, 10, 15, 20, 30, 50, 100].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
