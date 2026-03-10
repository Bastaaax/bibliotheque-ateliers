import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const SUGGESTED_EMOJIS = [
  '🎯', '📋', '✏️', '🎨', '🪵', '🔥', '🌟', '💡', '📌', '🗂️',
  '🧩', '🎭', '🖌️', '📖', '🔧', '🌿', '⛺', '🪢', '🎪', '📝',
  '🧭', '🔦', '🎪', '🏕️', '🛠️', '📦', '🎁', '🌈', '⚡', '🍃',
]

interface EmojiPickerProps {
  value: string | null
  onChange: (emoji: string | null) => void
  className?: string
  triggerClassName?: string
}

export function EmojiPicker({
  value,
  onChange,
  className,
  triggerClassName,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('')

  const handleSelect = (emoji: string) => {
    onChange(emoji || null)
    setOpen(false)
  }

  const handleCustom = () => {
    const trimmed = custom.trim()
    if (trimmed) {
      onChange(trimmed)
      setCustom('')
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn('h-10 w-10 shrink-0 text-2xl', triggerClassName)}
          aria-label="Choisir un emoji"
        >
          {value || '😀'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-72 p-3', className)} align="start">
        <div className="grid grid-cols-6 gap-1">
          {SUGGESTED_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded p-2 text-2xl hover:bg-muted"
              onClick={() => handleSelect(emoji)}
              aria-label={`Choisir ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2 border-t pt-3">
          <Input
            placeholder="Coller un emoji"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustom())}
            className="flex-1"
          />
          <Button type="button" size="sm" variant="secondary" onClick={handleCustom}>
            OK
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-muted-foreground"
          onClick={() => handleSelect('')}
        >
          Supprimer l’emoji
        </Button>
      </PopoverContent>
    </Popover>
  )
}
