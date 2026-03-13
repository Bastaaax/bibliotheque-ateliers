import { useCallback, useEffect, useState } from 'react'
import { Clock, Hourglass, User, Pencil, Check, Plus, Trash2, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { WorkshopEditor } from './WorkshopEditor'
import { cn } from '@/lib/utils'

export interface DerouleSection {
  type: 'section'
  id: string
  title: string
  time: string
  duration: string
  who: string
  content: string
}

export interface DerouleRichtextBlock {
  type: 'richtext'
  id: string
  content: string
}

export type DerouleBlock = DerouleSection | DerouleRichtextBlock

export interface DerouleData {
  type: 'deroule'
  sections: DerouleSection[]
  blocks?: DerouleBlock[]
}

const DEFAULT_SECTIONS: DerouleSection[] = [
  { type: 'section', id: 'intro', title: 'INTRODUCTION', time: '0h00', duration: "10'", who: '', content: '' },
  { type: 'section', id: 'experimentation', title: 'EXPÉRIMENTATION', time: '', duration: '', who: '', content: '' },
  { type: 'section', id: 'analyse', title: 'ANALYSE', time: '', duration: '', who: '', content: '' },
  { type: 'section', id: 'conclusion', title: 'CONCLUSION', time: '', duration: '', who: '', content: '' },
]

function toSection(raw: { id?: string; title?: string; time?: string; duration?: string; who?: string; content?: string }): DerouleSection {
  return {
    type: 'section',
    id: raw.id ?? '',
    title: raw.title ?? '',
    time: raw.time ?? '',
    duration: raw.duration ?? '',
    who: raw.who ?? '',
    content: raw.content ?? '',
  }
}

function getBlocksFromData(data: { sections?: DerouleSection[]; blocks?: DerouleBlock[] }): DerouleBlock[] {
  if (Array.isArray(data.blocks) && data.blocks.length > 0) {
    return data.blocks.map((b) => {
      if (b.type === 'richtext') return b
      return toSection(b)
    })
  }
  if (Array.isArray(data.sections) && data.sections.length > 0) {
    return data.sections.map((s) => toSection(s))
  }
  return DEFAULT_SECTIONS.map((s) => ({ ...s }))
}

function parseContent(value: string): DerouleData | null {
  if (!value?.trim()) return null
  try {
    const data = JSON.parse(value) as { type?: string; sections?: DerouleSection[]; blocks?: DerouleBlock[]; rows?: unknown[] }
    if (data?.type === 'deroule' && (Array.isArray(data.sections) || Array.isArray(data.blocks))) {
      const blocks = getBlocksFromData(data)
      const sections = blocks.filter((b): b is DerouleSection => b.type === 'section') as DerouleSection[]
      return { type: 'deroule', sections, blocks }
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
      return { type: 'deroule', sections, blocks: [...sections] }
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
  const sections = DEFAULT_SECTIONS.map((s) => ({ ...s }))
  return { type: 'deroule', sections, blocks: [...sections] }
}

/** Parse duration string (e.g. "10'", "15", "1h", "1h30") to minutes. */
function parseDurationToMinutes(s: string): number {
  if (!s?.trim()) return 0
  const t = s.trim()
  const hm = t.match(/^(\d+)\s*h\s*(\d*)\s*$/i)
  if (hm) return parseInt(hm[1], 10) * 60 + parseInt(hm[2] || '0', 10)
  const min = t.match(/^(\d+)\s*['']?\s*(?:min)?$/i)
  if (min) return parseInt(min[1], 10)
  const num = parseInt(t, 10)
  return Number.isNaN(num) ? 0 : num
}

interface DerouleTableEditorProps {
  value?: string
  onChange: (content: string) => void
  className?: string
  disabled?: boolean
  /** Durée totale de l'atelier (min) pour comparer au cumul des sections */
  workshopDurationMinutes?: number | null
}

const EDITOR_MIN_HEIGHT = 320

function nextRichtextId(): string {
  return `richtext-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function DerouleTableEditor({ value = '', onChange, className, disabled, workshopDurationMinutes }: DerouleTableEditorProps) {
  const [data, setData] = useState<DerouleData>(() => getDerouleData(value))
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null)
  const [activeRichtextId, setActiveRichtextId] = useState<string | null>(null)

  const blocks = data.blocks ?? data.sections

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
    (nextBlocks: DerouleBlock[]) => {
      const sections = nextBlocks.filter((b): b is DerouleSection => b.type === 'section') as DerouleSection[]
      const next: DerouleData = { type: 'deroule', sections, blocks: nextBlocks }
      setData(next)
      onChange(JSON.stringify(next))
    },
    [onChange]
  )

  const updateSection = useCallback(
    (blockIndex: number, field: keyof DerouleSection, cellValue: string) => {
      const block = blocks[blockIndex]
      if (block?.type !== 'section') return
      const nextBlocks = blocks.map((b, i) =>
        i === blockIndex ? { ...b, [field]: cellValue } : b
      ) as DerouleBlock[]
      emit(nextBlocks)
    },
    [blocks, emit]
  )

  const insertRichtextBlock = useCallback(
    (afterIndex: number) => {
      const newBlock: DerouleRichtextBlock = { type: 'richtext', id: nextRichtextId(), content: '' }
      const nextBlocks = [...blocks.slice(0, afterIndex + 1), newBlock, ...blocks.slice(afterIndex + 1)]
      emit(nextBlocks)
      setActiveRichtextId(newBlock.id)
    },
    [blocks, emit]
  )

  const removeRichtextBlock = useCallback(
    (blockIndex: number) => {
      const nextBlocks = blocks.filter((_, i) => i !== blockIndex)
      emit(nextBlocks)
      if (blocks[blockIndex]?.type === 'richtext' && (blocks[blockIndex] as DerouleRichtextBlock).id === activeRichtextId) {
        setActiveRichtextId(null)
      }
    },
    [blocks, emit, activeRichtextId]
  )

  const updateRichtextBlock = useCallback(
    (blockIndex: number, content: string) => {
      const block = blocks[blockIndex]
      if (block?.type !== 'richtext') return
      const nextBlocks = blocks.map((b, i) =>
        i === blockIndex ? { ...b, content } : b
      ) as DerouleBlock[]
      emit(nextBlocks)
    },
    [blocks, emit]
  )

  const sectionsOnly = blocks.filter((b): b is DerouleSection => b.type === 'section')
  const totalMinutes = sectionsOnly.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0)
  const exceeds = workshopDurationMinutes != null && workshopDurationMinutes > 0 && totalMinutes > workshopDurationMinutes
  const overflow = exceeds ? totalMinutes - workshopDurationMinutes : 0

  return (
    <div className={cn('space-y-8', className)}>
      <p className="text-sm text-muted-foreground">
        Remplissez chaque phase : heure de début, durée, qui anime, et le contenu en rich text. Vous pouvez insérer des blocs de texte libre entre les phases.
      </p>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium">
          Total phases : <span className="tabular-nums">{totalMinutes}</span> min
        </span>
        {workshopDurationMinutes != null && workshopDurationMinutes > 0 && (
          <>
            <span className="text-muted-foreground">
              (atelier : {workshopDurationMinutes} min)
            </span>
            {exceeds && (
              <span className="font-medium text-destructive">
                Dépassement : +{overflow} min
              </span>
            )}
          </>
        )}
      </div>
      {blocks.map((block, blockIndex) => (
        <div key={block.type === 'section' ? block.id : block.id}>
          {block.type === 'richtext' ? (
            <section className="rounded-xl border border-dashed border-border bg-muted/20 overflow-hidden">
              <div className="border-b bg-muted/40 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Bloc de texte libre
                </span>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRichtextBlock(blockIndex)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Supprimer ce bloc"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="p-4">
                {disabled ? (
                  <div
                    className={cn(
                      'min-h-[80px] prose prose-sm max-w-none dark:prose-invert',
                      !block.content && 'text-muted-foreground'
                    )}
                    dangerouslySetInnerHTML={{ __html: block.content || '<p>—</p>' }}
                  />
                ) : (
                  <WorkshopEditor
                    value={block.content}
                    onChange={(html) => updateRichtextBlock(blockIndex, html)}
                    placeholder="Rédigez ici… Tapez « / » pour les options."
                    contentMinHeight={120}
                  />
                )}
              </div>
            </section>
          ) : (
        (() => {
          const section = block as DerouleSection
          return (
            <>
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
                  onChange={(e) => updateSection(blockIndex, 'time', e.target.value)}
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
                  onChange={(e) => updateSection(blockIndex, 'duration', e.target.value)}
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
                  onChange={(e) => updateSection(blockIndex, 'who', e.target.value)}
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
              ) : activeSectionIndex === blockIndex ? (
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
                    onChange={(html) => updateSection(blockIndex, 'content', html)}
                    placeholder={`Rédigez le contenu de la phase ${section.title}… Tapez « / » pour les options (titres, listes, citation, tableau…).`}
                    contentMinHeight={EDITOR_MIN_HEIGHT}
                  />
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveSectionIndex(blockIndex)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveSectionIndex(blockIndex)}
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
              {!disabled && (
                <div className="flex justify-center py-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => insertRichtextBlock(blockIndex)}
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un bloc de texte ici
                  </Button>
                </div>
              )}
            </>
          ); })() )}
        </div>
      ))}
    </div>
  )
}
