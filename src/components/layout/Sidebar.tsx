import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FilterPanel } from '@/components/search/FilterPanel'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkshopFilters } from '@/types'

interface SidebarProps {
  filters: WorkshopFilters
  onFiltersChange: (filters: WorkshopFilters) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  tags: { id: string; name: string; color: string }[]
  creators: { id: string; full_name: string | null }[]
  className?: string
}

export function Sidebar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  tags,
  creators,
  className,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-muted/30 transition-all duration-300',
        collapsed ? 'w-0 overflow-hidden md:w-14' : 'w-full md:w-72',
        className
      )}
    >
      {!collapsed && (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">Filtres</h2>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('grid')}
                aria-label="Vue grille"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('list')}
                aria-label="Vue liste"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <FilterPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
            tags={tags}
            creators={creators}
          />
        </div>
      )}
    </aside>
  )
}
