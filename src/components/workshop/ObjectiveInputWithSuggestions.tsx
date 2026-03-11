import { useMemo, useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Mots significatifs (longueur >= 2) pour filtrer les objectifs existants */
function getWords(text: string): string[] {
  return text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 2)
}

/** Objectifs dont le texte contient au moins un des mots tapés, triés par pertinence */
function matchObjectives(objectives: string[], input: string): string[] {
  const words = getWords(input)
  if (words.length === 0) return []
  const inputLower = input.trim().toLowerCase()
  return objectives
    .filter((obj) => {
      const o = obj.toLowerCase()
      return words.some((w) => o.includes(w)) && o !== inputLower
    })
    .sort((a, b) => {
      const aLower = a.toLowerCase()
      const bLower = b.toLowerCase()
      const aMatches = words.filter((w) => aLower.includes(w)).length
      const bMatches = words.filter((w) => bLower.includes(w)).length
      if (bMatches !== aMatches) return bMatches - aMatches
      return a.localeCompare(b, 'fr')
    })
    .slice(0, 8)
}

interface ObjectiveInputWithSuggestionsProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  existingObjectives: string[]
  onRemove?: () => void
  canRemove?: boolean
}

export function ObjectiveInputWithSuggestions({
  value,
  onChange,
  placeholder = 'Objectif',
  existingObjectives,
  onRemove,
  canRemove = true,
}: ObjectiveInputWithSuggestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(
    () => matchObjectives(existingObjectives, value),
    [existingObjectives, value]
  )
  const showList = showSuggestions && (value.trim().length >= 2 || suggestions.length > 0)
  const listItems = useMemo(() => {
    const items: { type: 'existing' | 'new'; text: string }[] = suggestions.map((t) => ({ type: 'existing', text: t }))
    if (value.trim() && !existingObjectives.some((o) => o.trim().toLowerCase() === value.trim().toLowerCase())) {
      items.push({ type: 'new', text: value.trim() })
    }
    return items
  }, [suggestions, value, existingObjectives])

  useEffect(() => {
    setHighlightIndex(0)
  }, [value, suggestions])

  useEffect(() => {
    if (!showList) return
    const el = containerRef.current
    if (!el) return
    const handleClickOutside = (e: MouseEvent) => {
      if (el.contains(e.target as Node)) return
      setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showList])

  const selectItem = (text: string) => {
    onChange(text)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showList || listItems.length === 0) {
      if (e.key === 'Escape') setShowSuggestions(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => (i + 1) % listItems.length)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => (i - 1 + listItems.length) % listItems.length)
      return
    }
    if (e.key === 'Enter' && listItems[highlightIndex]) {
      e.preventDefault()
      selectItem(listItems[highlightIndex].text)
      return
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={containerRef} className="relative flex gap-2">
      <div className="relative flex-1 min-w-0">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {}}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls="objective-suggestions"
        />
        {showList && listItems.length > 0 && (
          <ul
            id="objective-suggestions"
            role="listbox"
            className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover py-1 shadow-md"
          >
            {listItems.map((item, idx) => (
              <li
                key={item.type === 'new' ? `new-${item.text}` : item.text}
                role="option"
                aria-selected={idx === highlightIndex}
                className={cn(
                  'cursor-pointer px-3 py-2 text-sm',
                  idx === highlightIndex ? 'bg-accent text-accent-foreground' : ''
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectItem(item.text)
                }}
                onMouseEnter={() => setHighlightIndex(idx)}
              >
                {item.type === 'new' ? (
                  <span className="text-muted-foreground">
                    Créer : <span className="text-foreground">{item.text}</span>
                  </span>
                ) : (
                  item.text.length > 70 ? `${item.text.slice(0, 70)}…` : item.text
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Supprimer"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
