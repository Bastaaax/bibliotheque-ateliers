import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react'

interface WorkshopEditorProps {
  value?: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 border-b bg-muted/30 p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'rounded p-2 hover:bg-muted',
          editor.isActive('bold') && 'bg-muted'
        )}
        aria-label="Gras"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'rounded p-2 hover:bg-muted',
          editor.isActive('italic') && 'bg-muted'
        )}
        aria-label="Italique"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'rounded p-2 hover:bg-muted',
          editor.isActive('bulletList') && 'bg-muted'
        )}
        aria-label="Liste à puces"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'rounded p-2 hover:bg-muted',
          editor.isActive('orderedList') && 'bg-muted'
        )}
        aria-label="Liste numérotée"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <span className="mx-1 border-l" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="rounded p-2 hover:bg-muted disabled:opacity-50"
        aria-label="Annuler"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="rounded p-2 hover:bg-muted disabled:opacity-50"
        aria-label="Rétablir"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  )
}

export function WorkshopEditor({
  value = '',
  onChange,
  placeholder = 'Rédigez le contenu détaillé de l\'atelier...',
  className,
  disabled = false,
}: WorkshopEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])

  return (
    <div
      className={cn(
        'rounded-lg border border-input bg-background overflow-hidden',
        disabled && 'opacity-60',
        className
      )}
    >
      <EditorToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
      />
    </div>
  )
}
