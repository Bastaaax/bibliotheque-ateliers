import { useCallback, useEffect, useState } from 'react'
import { Clock, Hourglass, User, Pencil, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { WorkshopEditor } from './WorkshopEditor'
import { cn } from '@/lib/utils'

export interface DerouleSection {
  id: string
  title: string
  time: string
  duration: string
  who: string
  content: string
}

export interface DerouleData {
  type: 'deroule'
  sections: DerouleSection[]
}

const DEFAULT_SECTIONS: DerouleSection[] = [
  { id: 'intro', title: 'INTRODUCTION', time: '0h00', duration: "10'", who: '', content: '' },
  { id: 'experimentation', title: 'EXPÉRIMENTATION', time: '', duration: '', who: '', content: '' },
  { id: 'analyse', title: 'ANALYSE', time: '', duration: '', who: '', content: '' },
  { id: 'conclusion', title: 'CONCLUSION', time: '', duration: '', who: '', content: '' },
]

function parseContent(value: string): DerouleData | null {
  if (!value?.trim()) return null
  try {
    const data = JSON.parse(value) as { type?: string; sections?: DerouleSection[]; rows?: unknown[] }
    if (data?.type === 'deroule' && Array.isArray(data.sections) && data.sections.length > 0) {
      return data as DerouleData
    }
    if (data?.type === 'deroule' && Array.isArray(data.rows)) {
      const rows = data.rows as { time: string; duration: string; program: string; who: string }[]
      const sections: DerouleSection[] = DEFAULT_SECTIONS.map((sec, i) => ({
        ...sec,
        time: rows[i]?.time ?? sec.time,
        duration: rows[i]?.duration ?? sec.duration,
        who: rows[i]?.who ?? '',
        content: rows[i]?.program ?? '',
      }))
      return { type: 'deroule', sections }
    }
  } catch {
    // ignore
  }
  return null
}

export function isDerouleContent(value: string): boolean {
  return parseContent(value) !== null
}

export function getDerouleData(value: string): DerouleData {
  const parsed = parseContent(value)
  if (parsed) return parsed
  return { type: 'deroule', sections: DEFAULT_SECTIONS.map((s) => ({ ...s })) }
}

interface DerouleTableEditorProps {
  value?: string
  onChange: (content: string) => void
  className?: string
  disabled?: boolean
}

const EDITOR_MIN_HEIGHT = 320

export function DerouleTableEditor({ value = '', onChange, className, disabled }: DerouleTableEditorProps) {
  const [data, setData] = useState<DerouleData>(() => getDerouleData(value))
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null)

  useEffect(() => {
    const parsed = parseContent(value)
    if (parsed) {
      setData(parsed)
    } else if (!value?.trim()) {
      const defaultData = getDerouleData('')
      setData(defaultData)
      onChange(JSON.stringify(defaultData))
    }
  }, [value])

  const emit = useCallback(
    (next: DerouleData) => {
      setData(next)
      onChange(JSON.stringify(next))
    },
    [onChange]
  )

  const updateSection = useCallback(
    (index: number, field: keyof DerouleSection, cellValue: string) => {
      const next = {
        ...data,
        sections: data.sections.map((s, i) =>
          i === index ? { ...s, [field]: cellValue } : s
        ),
      }
      emit(next)
    },
    [data, emit]
  )

  return (
    <div className={cn('space-y-8', className)}>
      <p className="text-sm text-muted-foreground">
        Remplissez chaque phase : heure de début, durée, qui anime, et le contenu en rich text (vous pouvez coller du contenu depuis Google Docs, Notion ou Word).
      </p>
      {data.sections.map((section, index) => (
        <section
          key={section.id}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <div className="border-b bg-muted/40 px-4 py-3">
            <h1 className="font-body text-2xl font-bold text-foreground">
              {section.title}
            </h1>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" aria-hidden />
                  Heure
                </Label>
                <Input
                  value={section.time}
                  onChange={(e) => updateSection(index, 'time', e.target.value)}
                  disabled={disabled}
                  placeholder="0h00"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Hourglass className="h-4 w-4" aria-hidden />
                  Durée
                </Label>
                <Input
                  value={section.duration}
                  onChange={(e) => updateSection(index, 'duration', e.target.value)}
                  disabled={disabled}
                  placeholder="10'"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" aria-hidden />
                  Qui s’en occupe
                </Label>
                <Input
                  value={section.who}
                  onChange={(e) => updateSection(index, 'who', e.target.value)}
                  disabled={disabled}
                  placeholder="Animateur, intervenant…"
                  className="bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Contenu (rich text)</Label>
              {disabled ? (
                <div
                  className={cn(
                    'min-h-[120px] rounded-lg border border-transparent bg-muted/20 px-3 py-3 text-sm',
                    !section.content && 'text-muted-foreground'
                  )}
                >
                  {section.content ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert [&_p]:my-1 [&_ul]:my-1"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  ) : (
                    '—'
                  )}
                </div>
              ) : activeSectionIndex === index ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSectionIndex(null)}
                      className="text-muted-foreground"
                    >
                      <Check className="mr-1.5 h-4 w-4" />
                      Terminer l’édition
                    </Button>
                  </div>
                  <WorkshopEditor
                    key={`editor-${section.id}`}
                    value={section.content}
                    onChange={(html) => updateSection(index, 'content', html)}
                    placeholder={`Rédigez le contenu de la phase ${section.title}…`}
                    contentMinHeight={EDITOR_MIN_HEIGHT}
                  />
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveSectionIndex(index)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveSectionIndex(index)}
                  className={cn(
                    'min-h-[120px] rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 px-3 py-4 text-sm',
                    'cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-ring'
                  )}
                >
                  {section.content ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert [&_p]:my-1 [&_ul]:my-1 line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  ) : (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Pencil className="h-4 w-4 shrink-0" />
                      Cliquer pour rédiger le contenu (rich text)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
