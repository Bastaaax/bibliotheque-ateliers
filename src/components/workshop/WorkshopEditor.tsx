import { useEditor, EditorContent, EditorContext, type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import { useEffect, useState, memo, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Underline as UnderlineIcon,
  Highlighter,
  Table as TableIcon,
  Type,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Captions,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SlashDropdownMenu } from '@/components/tiptap-ui/slash-dropdown-menu'
import type { SlashMenuItemType } from '@/components/tiptap-ui/slash-dropdown-menu/use-slash-dropdown-menu'
import { Image } from '@/components/tiptap-node/image-node/image-node-extension'
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension'
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button'
import { ImageCropButton } from '@/components/workshop/ImageCropButton'
import { NodeSelection } from '@tiptap/pm/state'
import { uploadWorkshopInlineImage, WORKSHOP_IMAGE_MAX_SIZE } from '@/utils/workshopImageUpload'
import '@/components/tiptap-node/image-node/image-node.scss'
import '@/components/tiptap-node/image-upload-node/image-upload-node.scss'

const TEXT_COLORS = [
  { name: 'Par défaut', value: '' },
  { name: 'Gris', value: '#6b7280' },
  { name: 'Rouge', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Vert', value: '#16a34a' },
  { name: 'Bleu', value: '#2563eb' },
  { name: 'Violet', value: '#7c3aed' },
]

const HIGHLIGHT_COLORS = [
  { name: 'Aucun', value: '' },
  { name: 'Jaune', value: '#fef08a' },
  { name: 'Vert clair', value: '#bbf7d0' },
  { name: 'Bleu clair', value: '#bfdbfe' },
  { name: 'Orange clair', value: '#fed7aa' },
]

const STORAGE_TEXT_COLORS = 'workshop-editor-recent-text-colors'
const STORAGE_HIGHLIGHT_COLORS = 'workshop-editor-recent-highlight-colors'
const MAX_RECENT = 6

function getRecentColors(key: string): string[] {
  try {
    const s = localStorage.getItem(key)
    if (!s) return []
    const arr = JSON.parse(s) as unknown[]
    return Array.isArray(arr) ? arr.filter((c): c is string => typeof c === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function addRecentColor(key: string, color: string) {
  if (!color?.trim()) return
  const recent = getRecentColors(key).filter((c) => c !== color)
  recent.unshift(color)
  try {
    localStorage.setItem(key, JSON.stringify(recent.slice(0, MAX_RECENT)))
  } catch {
    /* ignore */
  }
}

/** Éléments du menu slash (open source uniquement, pas d’AI / mention / emoji / image upload / toc) */
const SLASH_MENU_ITEMS: SlashMenuItemType[] = [
  'text',
  'heading_1',
  'heading_2',
  'heading_3',
  'bullet_list',
  'ordered_list',
  'quote',
  'code_block',
  'divider',
  'table',
  'image',
]

interface WorkshopEditorProps {
  value?: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  /** Hauteur minimale de la zone d’édition (px). Défaut 200. */
  contentMinHeight?: number
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [tableOpen, setTableOpen] = useState(false)
  if (!editor) return null

  const headingLabel = editor.isActive('heading', { level: 1 })
    ? 'Titre 1'
    : editor.isActive('heading', { level: 2 })
      ? 'Titre 2'
      : editor.isActive('heading', { level: 3 })
        ? 'Titre 3'
        : editor.isActive('heading', { level: 4 })
          ? 'Titre 4'
          : 'Texte'

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/20 px-2 py-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-normal">
            <Type className="h-4 w-4" />
            {headingLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px]">
          <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
            Texte
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            Titre 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            Titre 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            Titre 3
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
            Titre 4
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="mx-1 h-5 w-px bg-border" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn('rounded p-1.5 hover:bg-muted', editor.isActive('bold') && 'bg-muted')}
        aria-label="Gras"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn('rounded p-1.5 hover:bg-muted', editor.isActive('italic') && 'bg-muted')}
        aria-label="Italique"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn('rounded p-1.5 hover:bg-muted', editor.isActive('underline') && 'bg-muted')}
        aria-label="Souligner"
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={cn('rounded p-1.5 hover:bg-muted', editor.isActive('highlight') && 'bg-muted')}
        aria-label="Surligner"
      >
        <Highlighter className="h-4 w-4" />
      </button>

      <span className="mx-1 h-5 w-px bg-border" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn('rounded p-1.5 hover:bg-muted', editor.isActive('bulletList') && 'bg-muted')}
        aria-label="Liste à puces"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn('rounded p-1.5 hover:bg-muted', editor.isActive('orderedList') && 'bg-muted')}
        aria-label="Liste numérotée"
      >
        <ListOrdered className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn('rounded p-1.5 hover:bg-muted', editor.isActive('blockquote') && 'bg-muted')}
        aria-label="Citation"
      >
        <Quote className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn('rounded p-1.5 hover:bg-muted', editor.isActive('codeBlock') && 'bg-muted')}
        aria-label="Bloc de code"
      >
        <Code className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="rounded p-1.5 hover:bg-muted"
        aria-label="Ligne horizontale"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="mx-1 h-5 w-px bg-border" />

      <DropdownMenu open={tableOpen} onOpenChange={setTableOpen}>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-normal">
            <TableIcon className="h-4 w-4" />
            Tableau
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              setTableOpen(false)
            }}
          >
            Insérer 3×3 (avec en-tête)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: false }).run()
              setTableOpen(false)
            }}
          >
            Insérer 2×2
          </DropdownMenuItem>
          {editor.isActive('table') && (
            <>
              <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                Colonnes
              </span>
              <DropdownMenuItem
                onClick={() => { editor.chain().focus().addColumnBefore().run(); setTableOpen(false) }}
              >
                Ajouter une colonne avant
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { editor.chain().focus().addColumnAfter().run(); setTableOpen(false) }}
              >
                Ajouter une colonne après
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { editor.chain().focus().deleteColumn().run(); setTableOpen(false) }}
                className="text-destructive"
              >
                Supprimer la colonne
              </DropdownMenuItem>
              <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                Lignes
              </span>
              <DropdownMenuItem
                onClick={() => { editor.chain().focus().addRowBefore().run(); setTableOpen(false) }}
              >
                Ajouter une ligne au-dessus
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { editor.chain().focus().addRowAfter().run(); setTableOpen(false) }}
              >
                Ajouter une ligne en dessous
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { editor.chain().focus().deleteRow().run(); setTableOpen(false) }}
                className="text-destructive"
              >
                Supprimer la ligne
              </DropdownMenuItem>
              <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                Tableau
              </span>
              <DropdownMenuItem
                onClick={() => { editor.chain().focus().deleteTable().run(); setTableOpen(false) }}
                className="text-destructive"
              >
                Supprimer le tableau
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="mx-1 h-5 w-px bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-normal">
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: editor.getAttributes('textStyle').color || 'transparent' }}
            />
            Couleur
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          {getRecentColors(STORAGE_TEXT_COLORS).map((c) => (
            <DropdownMenuItem
              key={`recent-${c}`}
              onClick={() => {
                editor.chain().focus().setColor(c).run()
                addRecentColor(STORAGE_TEXT_COLORS, c)
              }}
              className="flex items-center gap-2"
            >
              <span className="h-4 w-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: c }} />
              {c} (récent)
            </DropdownMenuItem>
          ))}
          {getRecentColors(STORAGE_TEXT_COLORS).length > 0 && <div className="my-1 border-t" />}
          {TEXT_COLORS.map((c) => (
            <DropdownMenuItem
              key={c.value || 'default'}
              onClick={() => {
                if (c.value) {
                  editor.chain().focus().setColor(c.value).run()
                  addRecentColor(STORAGE_TEXT_COLORS, c.value)
                } else editor.chain().focus().unsetColor().run()
              }}
              className="flex items-center gap-2"
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: c.value || 'transparent' }}
              />
              {c.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-normal">
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-border bg-yellow-200"
              title="Surlignage"
            />
            Surlignage
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          {getRecentColors(STORAGE_HIGHLIGHT_COLORS).map((c) => (
            <DropdownMenuItem
              key={`recent-${c}`}
              onClick={() => {
                editor.chain().focus().setHighlight({ color: c }).run()
                addRecentColor(STORAGE_HIGHLIGHT_COLORS, c)
              }}
              className="flex items-center gap-2"
            >
              <span className="h-4 w-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: c }} />
              {c} (récent)
            </DropdownMenuItem>
          ))}
          {getRecentColors(STORAGE_HIGHLIGHT_COLORS).length > 0 && <div className="my-1 border-t" />}
          {HIGHLIGHT_COLORS.map((c) => (
            <DropdownMenuItem
              key={c.value || 'none'}
              onClick={() => {
                if (c.value) {
                  editor.chain().focus().setHighlight({ color: c.value }).run()
                  addRecentColor(STORAGE_HIGHLIGHT_COLORS, c.value)
                } else editor.chain().focus().unsetHighlight().run()
              }}
              className="flex items-center gap-2"
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: c.value || 'transparent' }}
              />
              {c.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="mx-1 h-5 w-px bg-border" />

      <ImageUploadButton editor={editor} text="Image" />

      <span className="mx-1 h-5 w-px bg-border" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="rounded p-1.5 hover:bg-muted disabled:opacity-50"
        aria-label="Annuler"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="rounded p-1.5 hover:bg-muted disabled:opacity-50"
        aria-label="Rétablir"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  )
}

function BubbleToolbar({ editor }: { editor: Editor }) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState(() => editor.getAttributes('link').href || '')

  const applyLink = useCallback(() => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setLinkOpen(false)
  }, [editor, linkUrl])

  const removeLink = useCallback(() => {
    editor.chain().focus().unsetLink().run()
    setLinkUrl('')
    setLinkOpen(false)
  }, [editor])

  const isLink = editor.isActive('link')

  const [colorOpen, setColorOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)
  const recentText = getRecentColors(STORAGE_TEXT_COLORS)
  const recentHighlight = getRecentColors(STORAGE_HIGHLIGHT_COLORS)

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="textBubbleMenu"
      shouldShow={({ editor: e }) => !e.isActive('table') && !e.isActive('image')}
      options={{ placement: 'top' }}
      className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-popover px-1 py-1 shadow-md"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn('rounded p-2 hover:bg-accent', editor.isActive('bold') && 'bg-accent')}
        aria-label="Gras"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn('rounded p-2 hover:bg-accent', editor.isActive('italic') && 'bg-accent')}
        aria-label="Italique"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn('rounded p-2 hover:bg-accent', editor.isActive('underline') && 'bg-accent')}
        aria-label="Souligner"
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={cn('rounded p-2 hover:bg-accent', editor.isActive('highlight') && 'bg-accent')}
        aria-label="Surligner"
      >
        <Highlighter className="h-4 w-4" />
      </button>
      <span className="mx-0.5 h-5 w-px bg-border" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn('rounded p-2 hover:bg-accent', editor.isActive('bulletList') && 'bg-accent')}
        aria-label="Liste à puces"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn('rounded p-2 hover:bg-accent', editor.isActive('orderedList') && 'bg-accent')}
        aria-label="Liste numérotée"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn('rounded p-2 hover:bg-accent', editor.isActive('blockquote') && 'bg-accent')}
        aria-label="Citation"
      >
        <Quote className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn('rounded p-2 hover:bg-accent', editor.isActive('codeBlock') && 'bg-accent')}
        aria-label="Bloc de code"
      >
        <Code className="h-4 w-4" />
      </button>
      <span className="mx-0.5 h-5 w-px bg-border" />
      <DropdownMenu open={colorOpen} onOpenChange={setColorOpen}>
        <DropdownMenuTrigger asChild>
          <button type="button" className="rounded p-2 hover:bg-accent" aria-label="Couleur du texte">
            <span className="h-4 w-4 block rounded-full border border-border" style={{ backgroundColor: editor.getAttributes('textStyle').color || 'currentColor' }} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          {recentText.length > 0 && (
            <>
              <span className="px-2 py-1 text-xs text-muted-foreground">Récents</span>
              {recentText.map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={() => { editor.chain().focus().setColor(c).run(); addRecentColor(STORAGE_TEXT_COLORS, c); setColorOpen(false) }}
                  className="flex items-center gap-2"
                >
                  <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c }} />
                  {c}
                </DropdownMenuItem>
              ))}
              <span className="border-t my-1" />
            </>
          )}
          {TEXT_COLORS.map((c) => (
            <DropdownMenuItem
              key={c.value || 'default'}
              onClick={() => { if (c.value) { editor.chain().focus().setColor(c.value).run(); addRecentColor(STORAGE_TEXT_COLORS, c.value) } else editor.chain().focus().unsetColor().run(); setColorOpen(false) }}
              className="flex items-center gap-2"
            >
              <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c.value || 'transparent' }} />
              {c.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu open={highlightOpen} onOpenChange={setHighlightOpen}>
        <DropdownMenuTrigger asChild>
          <button type="button" className="rounded p-2 hover:bg-accent" aria-label="Surlignage">
            <span className="h-4 w-4 block rounded-full border border-border bg-yellow-200" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          {recentHighlight.length > 0 && (
            <>
              <span className="px-2 py-1 text-xs text-muted-foreground">Récents</span>
              {recentHighlight.map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={() => { editor.chain().focus().setHighlight({ color: c }).run(); addRecentColor(STORAGE_HIGHLIGHT_COLORS, c); setHighlightOpen(false) }}
                  className="flex items-center gap-2"
                >
                  <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c }} />
                  {c}
                </DropdownMenuItem>
              ))}
              <span className="border-t my-1" />
            </>
          )}
          {HIGHLIGHT_COLORS.map((c) => (
            <DropdownMenuItem
              key={c.value || 'none'}
              onClick={() => { if (c.value) { editor.chain().focus().setHighlight({ color: c.value }).run(); addRecentColor(STORAGE_HIGHLIGHT_COLORS, c.value) } else editor.chain().focus().unsetHighlight().run(); setHighlightOpen(false) }}
              className="flex items-center gap-2"
            >
              <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c.value || 'transparent' }} />
              {c.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="mx-0.5 h-5 w-px bg-border" />
      <Popover open={linkOpen} onOpenChange={(open) => {
        setLinkOpen(open)
        if (!open) return
        setLinkUrl(editor.getAttributes('link').href || '')
      }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn('rounded p-2 hover:bg-accent', isLink && 'bg-accent')}
            aria-label="Lien"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyLink()}
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={applyLink}>
                Appliquer
              </Button>
              {isLink && (
                <Button type="button" size="sm" variant="outline" onClick={removeLink}>
                  Supprimer le lien
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </BubbleMenu>
  )
}

/** Retourne la position de l'image sélectionnée ou contenant le curseur. Met à jour la sélection si nécessaire. */
function ensureImageNodeSelected(editor: Editor): { pos: number; node: { nodeSize: number } } | null {
  const { selection } = editor.state
  if (selection instanceof NodeSelection && selection.node?.type?.name === 'image') {
    return { pos: selection.from, node: selection.node }
  }
  const { $from } = selection
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d)
    if (node.type.name === 'image') {
      const pos = $from.before(d)
      editor.chain().focus().setNodeSelection(pos).run()
      return { pos, node }
    }
  }
  return null
}

function WorkshopImageToolbar({ editor }: { editor: Editor }) {
  const replaceRef = useRef<HTMLInputElement>(null)

  const align = (a: 'left' | 'center' | 'right') => () => {
    if (!ensureImageNodeSelected(editor)) return
    editor.chain().focus().updateAttributes('image', { 'data-align': a }).run()
  }

  const toggleCaption = () => {
    if (!ensureImageNodeSelected(editor)) return
    const show = editor.getAttributes('image').showCaption
    editor.chain().focus().updateAttributes('image', { showCaption: !show }).run()
  }

  const handleDelete = () => {
    const img = ensureImageNodeSelected(editor)
    if (!img) return
    editor.chain().focus().deleteRange({ from: img.pos, to: img.pos + img.node.nodeSize }).run()
  }

  const handleReplace = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file?.type.startsWith('image/')) return
      e.target.value = ''
      if (!ensureImageNodeSelected(editor)) return
      try {
        const url = await uploadWorkshopInlineImage(file)
        editor.chain().focus().updateAttributes('image', { src: url }).run()
      } catch (err) {
        console.error('Replace image:', err)
      }
    },
    [editor]
  )

  return (
    <>
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={align('left')} aria-label="Aligner à gauche">
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={align('center')} aria-label="Centrer">
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={align('right')} aria-label="Aligner à droite">
        <AlignRight className="h-4 w-4" />
      </Button>
      <span className="mx-1 h-5 w-px bg-border" />
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={toggleCaption} aria-label="Légende">
        <Captions className="h-4 w-4" />
      </Button>
      <span className="mx-1 h-5 w-px bg-border" />
      <ImageCropButton editor={editor} />
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => replaceRef.current?.click()} aria-label="Remplacer">
        <RefreshCw className="h-4 w-4" />
      </Button>
      <input ref={replaceRef} type="file" accept="image/*" className="hidden" onChange={handleReplace} />
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive" onClick={handleDelete} aria-label="Supprimer">
        <Trash2 className="h-4 w-4" />
      </Button>
    </>
  )
}

function ImageBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageBubbleMenu"
      shouldShow={({ editor: ed }) => ed.isActive('image')}
      options={{ placement: 'top' }}
      className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-popover px-1 py-1 shadow-md"
    >
      <WorkshopImageToolbar editor={editor} />
    </BubbleMenu>
  )
}

function TableBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableBubbleMenu"
      shouldShow={({ editor: ed }) => ed.isActive('table')}
      options={{ placement: 'top' }}
      className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-popover px-1 py-1 shadow-md"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-normal">
            <TableIcon className="h-4 w-4" />
            Tableau
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>
            Ajouter colonne avant
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
            Ajouter colonne après
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()} className="text-destructive">
            Supprimer colonne
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>
            Ajouter ligne au-dessus
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
            Ajouter ligne en dessous
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()} className="text-destructive">
            Supprimer ligne
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} className="text-destructive">
            Supprimer le tableau
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </BubbleMenu>
  )
}

function WorkshopEditorInner({
  value = '',
  onChange,
  placeholder = "Écrire ici… Tapez « / » pour afficher les options de bloc (titres, listes, citation, tableau…)",
  className,
  disabled = false,
  contentMinHeight = 200,
}: WorkshopEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Placeholder.configure({ placeholder }),
      Table.configure({}),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Image,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: WORKSHOP_IMAGE_MAX_SIZE,
        limit: 1,
        upload: uploadWorkshopInlineImage,
        onError: (err) => console.error('Upload image:', err),
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'outline-none' },
      handlePaste: (view, event) => {
        const files = event.clipboardData?.files
        if (!files?.length) return false
        const file = Array.from(files).find((f) => f.type.startsWith('image/'))
        if (!file) return false
        event.preventDefault()
        uploadWorkshopInlineImage(file)
          .then((url) => {
            const { schema } = view.state
            const node = schema.nodes.image?.create({ src: url, alt: file.name, 'data-align': 'center' })
            if (node) {
              const tr = view.state.tr.replaceSelectionWith(node)
              view.dispatch(tr)
            }
          })
          .catch((err) => console.error('Paste image upload:', err))
        return true
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) editor.commands.setContent(value ?? '', { emitUpdate: false })
  }, [value, editor])

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])

  return (
    <EditorContext.Provider value={{ editor: editor ?? undefined }}>
      <div
        className={cn(
          'prose-editor-headings rounded-lg border border-input bg-background overflow-hidden shadow-sm',
          disabled && 'opacity-60',
          className
        )}
      >
        <EditorToolbar editor={editor} />
        {editor && !disabled && (
          <>
            <SlashDropdownMenu
              editor={editor}
              config={{
                enabledItems: SLASH_MENU_ITEMS,
                showGroups: true,
                itemGroups: {
                  text: 'Style',
                  heading_1: 'Style',
                  heading_2: 'Style',
                  heading_3: 'Style',
                  bullet_list: 'Style',
                  ordered_list: 'Style',
                  quote: 'Style',
                  code_block: 'Style',
                  divider: 'Insérer',
                  table: 'Insérer',
                  image: 'Insérer',
                },
              }}
            />
            <BubbleToolbar editor={editor} />
            <ImageBubbleMenu editor={editor} />
            <TableBubbleMenu editor={editor} />
          </>
        )}
        <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm max-w-none px-5 py-4 focus:outline-none dark:prose-invert',
          '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[var(--editor-min-height,200px)]',
          '[&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-[15px]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted-foreground',
          '[&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_code]:text-sm',
          '[&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:border [&_.ProseMirror_table]:border-border [&_.ProseMirror_table]:w-full',
          '[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-border [&_.ProseMirror_th]:bg-muted [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:text-left',
          '[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-border [&_.ProseMirror_td]:p-2',
          '[&_.ProseMirror_a]:text-primary-dark [&_.ProseMirror_a]:underline',
          '[&_.ProseMirror_h1]:font-body [&_.ProseMirror_h2]:font-body [&_.ProseMirror_h3]:font-body [&_.ProseMirror_h4]:font-body',
          '[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:space-y-0.5',
          '[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:space-y-0.5',
          '[&_.ProseMirror_li]:list-item [&_.ProseMirror_li]:my-0'
        )}
        style={{ ['--editor-min-height' as string]: `${contentMinHeight}px` } as React.CSSProperties}
      />
    </div>
    </EditorContext.Provider>
  )
}

export const WorkshopEditor = memo(WorkshopEditorInner)
