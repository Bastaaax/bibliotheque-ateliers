import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = <FileQuestion className="h-16 w-16 text-muted-foreground" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="font-heading text-2xl font-semibold">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
