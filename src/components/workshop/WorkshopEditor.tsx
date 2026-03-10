import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import { useEffect, useState, memo, useCallback } from 'react'
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
          {TEXT_COLORS.map((c) => (
            <DropdownMenuItem
              key={c.value || 'default'}
              onClick={() => {
                if (c.value) editor.chain().focus().setColor(c.value).run()
                else editor.chain().focus().unsetColor().run()
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
          {HIGHLIGHT_COLORS.map((c) => (
            <DropdownMenuItem
              key={c.value || 'none'}
              onClick={() => {
                if (c.value) editor.chain().focus().setHighlight({ color: c.value }).run()
                else editor.chain().focus().unsetHighlight().run()
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

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'top' }}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-popover px-1 py-1 shadow-md"
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

function WorkshopEditorInner({
  value = '',
  onChange,
  placeholder = "Écrire ici… Tapez / pour les commandes",
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
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'outline-none' },
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
              },
            }}
          />
          <BubbleToolbar editor={editor} />
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
          '[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline',
          '[&_.ProseMirror_h1]:font-body [&_.ProseMirror_h2]:font-body [&_.ProseMirror_h3]:font-body [&_.ProseMirror_h4]:font-body'
        )}
        style={{ ['--editor-min-height' as string]: `${contentMinHeight}px` } as React.CSSProperties}
      />
    </div>
  )
}

export const WorkshopEditor = memo(WorkshopEditorInner)
