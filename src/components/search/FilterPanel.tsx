import { useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
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

interface FilterPanelProps {
  filters: WorkshopFilters
  onFiltersChange: (filters: WorkshopFilters) => void
  tags: Tag[]
  creators: { id: string; full_name: string | null }[]
}

export function FilterPanel({ filters, onFiltersChange, tags, creators }: FilterPanelProps) {
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

  return (
    <div className="space-y-6">
      {tags.length > 0 && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
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

      {creators.length > 0 && (
        <div className="space-y-2">
          <Label>Créateur</Label>
          <Select
            value={filters.creatorId ?? 'all'}
            onValueChange={(v) => updateFilters({ creatorId: v === 'all' ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les créateurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les créateurs</SelectItem>
              {creators.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.full_name ?? c.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Durée (min) : {filters.durationMin ?? 0} - {filters.durationMax ?? '∞'}</Label>
        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Min</span>
            <Slider
              value={[filters.durationMin ?? 0]}
              onValueChange={([v]) => updateFilters({ durationMin: v === 0 ? undefined : v })}
              max={240}
              step={15}
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Max</span>
            <Slider
              value={[filters.durationMax ?? 240]}
              onValueChange={([v]) => updateFilters({ durationMax: v === 240 ? undefined : v })}
              max={240}
              step={15}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Participants</Label>
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
