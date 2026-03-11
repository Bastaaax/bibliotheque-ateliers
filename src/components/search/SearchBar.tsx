import { forwardRef, useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
  id?: string
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    value: controlledValue,
    onChange,
    placeholder = 'Rechercher des ateliers...',
    debounceMs = 300,
    className,
    id = 'search-input',
  },
  ref
) {
  const [localValue, setLocalValue] = useState(controlledValue ?? '')
  const [debounceRef, setDebounceRef] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setLocalValue(v)
      if (debounceRef) clearTimeout(debounceRef)
      const timeoutId = setTimeout(() => {
        onChange(v)
        setDebounceRef(null)
      }, debounceMs)
      setDebounceRef(timeoutId)
    },
    [onChange, debounceMs, debounceRef]
  )

  const displayValue = controlledValue !== undefined ? controlledValue : localValue

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        ref={ref}
        id={id}
        type="search"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9"
        aria-label="Recherche"
      />
    </div>
  )
})
