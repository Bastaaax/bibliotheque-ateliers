import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagBadge } from '@/components/tags/TagBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useTags } from '@/hooks/useTags'
import { useToast } from '@/components/ui/use-toast'
import { Pencil, Trash2, Plus } from 'lucide-react'
import type { Tag } from '@/types'
import { DEFAULT_TAG_COLOR } from '@/utils/constants'

const TAG_CATEGORIES = [
  { value: 'workshop_type', label: "Type d'atelier" },
  { value: 'stage_type', label: 'Type de stage' },
  { value: 'custom', label: 'Personnalisé' },
] as const

const COLORS = [
  '#003a5d',
  '#004d7a',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
]

export function TagManager() {
  const { tags, createTag, updateTag, deleteTag } = useTags()
  const { toast } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<Tag['category']>('custom')
  const [formColor, setFormColor] = useState(DEFAULT_TAG_COLOR)

  const resetForm = () => {
    setFormName('')
    setFormCategory('custom')
    setFormColor(DEFAULT_TAG_COLOR)
    setEditingTag(null)
    setDeletingTag(null)
  }

  const handleCreate = async () => {
    if (!formName.trim()) return
    try {
      await createTag.mutateAsync({
        name: formName.trim(),
        category: formCategory,
        color: formColor,
      })
      toast({ title: 'Tag créé', description: `Le tag "${formName}" a été créé.` })
      setCreateOpen(false)
      resetForm()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de créer le tag.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingTag || !formName.trim()) return
    try {
      await updateTag.mutateAsync({
        id: editingTag.id,
        data: { name: formName.trim(), category: formCategory, color: formColor },
      })
      toast({ title: 'Tag modifié', description: 'Les modifications ont été enregistrées.' })
      setEditOpen(false)
      resetForm()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de modifier le tag.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingTag) return
    try {
      await deleteTag.mutateAsync(deletingTag.id)
      toast({ title: 'Tag supprimé', description: `Le tag "${deletingTag.name}" a été supprimé.` })
      setDeleteOpen(false)
      resetForm()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de supprimer le tag.',
        variant: 'destructive',
      })
    }
  }

  const openEdit = (tag: Tag) => {
    setEditingTag(tag)
    setFormName(tag.name)
    setFormCategory(tag.category)
    setFormColor(tag.color)
    setEditOpen(true)
  }

  const openDelete = (tag: Tag) => {
    setDeletingTag(tag)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Gestion des tags</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau tag
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <ul className="space-y-3">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <TagBadge tag={tag} />
                <span className="text-sm text-muted-foreground">
                  {TAG_CATEGORIES.find((c) => c.value === tag.category)?.label ?? tag.category}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(tag)} aria-label="Modifier">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDelete(tag)} aria-label="Supprimer">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={createOpen} onOpenChange={(o) => (setCreateOpen(o), resetForm())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nom du tag"
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={formCategory}
                onValueChange={(v) => setFormCategory(v as Tag['category'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAG_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: formColor === c ? 'var(--primary)' : 'transparent',
                    }}
                    onClick={() => setFormColor(c)}
                    aria-label={`Couleur ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={!formName.trim() || createTag.isPending}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(o) => (setEditOpen(o), resetForm())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nom du tag"
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={formCategory}
                onValueChange={(v) => setFormCategory(v as Tag['category'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAG_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: formColor === c ? 'var(--primary)' : 'transparent',
                    }}
                    onClick={() => setFormColor(c)}
                    aria-label={`Couleur ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={!formName.trim() || updateTag.isPending}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(o) => (setDeleteOpen(o), resetForm())}
        title="Supprimer le tag ?"
        description={
          deletingTag
            ? `Le tag "${deletingTag.name}" sera supprimé. Il sera retiré de tous les ateliers.`
            : ''
        }
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteTag.isPending}
      />
    </div>
  )
}
