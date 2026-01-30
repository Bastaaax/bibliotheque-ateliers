import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TagBadge } from '@/components/tags/TagBadge'
import { formatRelativeTime, truncate, formatDuration } from '@/utils/helpers'
import type { Workshop } from '@/types'
import { Clock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkshopCardProps {
  workshop: Workshop
  className?: string
}

export function WorkshopCard({ workshop, className }: WorkshopCardProps) {
  const creatorName = workshop.creator?.full_name ?? workshop.creator?.email ?? 'Inconnu'
  const tags = workshop.tags ?? []

  return (
    <Link to={`/workshops/${workshop.id}`} className="block">
      <Card
        className={cn(
          'card-workshop h-full transition-shadow hover:shadow-md',
          className
        )}
      >
        <CardHeader className="pb-2">
          <h3 className="font-heading text-xl font-semibold leading-tight line-clamp-2">
            {workshop.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {truncate(workshop.description ?? '', 120)}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pb-2">
          {tags.slice(0, 4).map((tag) => (
            <TagBadge key={tag.id} tag={tag} size="sm" />
          ))}
          {tags.length > 4 && (
            <span className="text-xs text-muted-foreground">+{tags.length - 4}</span>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
          <span>{creatorName}</span>
          <div className="flex items-center gap-3">
            {workshop.duration_minutes != null && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(workshop.duration_minutes)}
              </span>
            )}
            {(workshop.participants_min != null || workshop.participants_max != null) && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {workshop.participants_min ?? '?'}–{workshop.participants_max ?? '?'}
              </span>
            )}
            <span>{formatRelativeTime(workshop.created_at)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
