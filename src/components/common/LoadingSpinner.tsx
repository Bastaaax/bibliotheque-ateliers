import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  message?: string
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
}

export function LoadingSpinner({
  className,
  size = 'md',
  fullScreen = false,
  message = 'Chargement...',
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen ? 'fixed inset-0 z-50 bg-background' : 'p-8'
      )}
      role="status"
      aria-label="Chargement"
    >
      <Loader2
        className={cn('animate-spin text-primary', sizeClasses[size], className)}
        aria-hidden
      />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}
