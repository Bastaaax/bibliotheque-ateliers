import { cn } from '@/lib/utils'
import type { Tag } from '@/types'

interface TagBadgeProps {
  tag: Tag
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md'
}

export function TagBadge({ tag, onClick, className, size = 'md' }: TagBadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors',
        sizeClass,
        onClick && 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        borderColor: tag.color,
        borderWidth: '1px',
      }}
    >
      {tag.name}
    </span>
  )
}
