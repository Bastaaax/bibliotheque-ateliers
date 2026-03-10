import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useTagCategories } from '@/hooks/useTagCategories'
import { useToast } from '@/components/ui/use-toast'
import { Pencil, Trash2, Plus, FolderOpen } from 'lucide-react'
import type { Tag, TagCategory } from '@/types'
import { DEFAULT_TAG_COLOR } from '@/utils/constants'

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

function getCategoryName(categories: TagCategory[], tag: Tag): string {
  if (tag.category_id) {
    const cat = categories.find((c) => c.id === tag.category_id)
    return cat?.name ?? '—'
  }
  return '—'
}

export function TagManager() {
  const {
    categories: tagCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useTagCategories()
  const { tags, createTag, updateTag, deleteTag } = useTags()
  const { toast } = useToast()

  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  const [formName, setFormName] = useState('')
  const [formCategoryId, setFormCategoryId] = useState<string | null>(null)
  const [formColor, setFormColor] = useState(DEFAULT_TAG_COLOR)

  const [categoryCreateOpen, setCategoryCreateOpen] = useState(false)
  const [categoryEditOpen, setCategoryEditOpen] = useState(false)
  const [categoryDeleteOpen, setCategoryDeleteOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<TagCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<TagCategory | null>(null)
  const [categoryFormName, setCategoryFormName] = useState('')

  const resetTagForm = () => {
    setFormName('')
    setFormCategoryId(null)
    setFormColor(DEFAULT_TAG_COLOR)
    setEditingTag(null)
    setDeletingTag(null)
  }

  const resetCategoryForm = () => {
    setCategoryFormName('')
    setEditingCategory(null)
    setDeletingCategory(null)
  }

  const handleCreateTag = async () => {
    if (!formName.trim()) return
    try {
      await createTag.mutateAsync({
        name: formName.trim(),
        category: 'custom',
        color: formColor,
        category_id: formCategoryId,
      } as Omit<Tag, 'id' | 'created_at'>)
      toast({ title: 'Tag créé', description: `Le tag "${formName}" a été créé.` })
      setCreateOpen(false)
      resetTagForm()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de créer le tag.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !formName.trim()) return
    try {
      await updateTag.mutateAsync({
        id: editingTag.id,
        data: { name: formName.trim(), color: formColor, category_id: formCategoryId },
      })
      toast({ title: 'Tag modifié', description: 'Les modifications ont été enregistrées.' })
      setEditOpen(false)
      resetTagForm()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de modifier le tag.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTag = async () => {
    if (!deletingTag) return
    try {
      await deleteTag.mutateAsync(deletingTag.id)
      toast({ title: 'Tag supprimé', description: `Le tag "${deletingTag.name}" a été supprimé.` })
      setDeleteOpen(false)
      resetTagForm()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de supprimer le tag.',
        variant: 'destructive',
      })
    }
  }

  const handleCreateCategory = async () => {
    if (!categoryFormName.trim()) return
    try {
      await createCategory.mutateAsync({
        name: categoryFormName.trim(),
        sort_order: tagCategories.length,
      })
      toast({ title: 'Catégorie créée', description: `"${categoryFormName}" a été ajoutée.` })
      setCategoryCreateOpen(false)
      resetCategoryForm()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de créer la catégorie.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryFormName.trim()) return
    try {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        data: { name: categoryFormName.trim() },
      })
      toast({ title: 'Catégorie modifiée', description: 'Les modifications ont été enregistrées.' })
      setCategoryEditOpen(false)
      resetCategoryForm()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de modifier la catégorie.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return
    try {
      await deleteCategory.mutateAsync(deletingCategory.id)
      toast({ title: 'Catégorie supprimée', description: `"${deletingCategory.name}" a été supprimée.` })
      setCategoryDeleteOpen(false)
      resetCategoryForm()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de supprimer la catégorie.',
        variant: 'destructive',
      })
    }
  }

  const openEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setFormName(tag.name)
    setFormCategoryId(tag.category_id ?? null)
    setFormColor(tag.color)
    setEditOpen(true)
  }

  const categorySelectOptions = (
    <SelectContent>
      <SelectItem value="__none__">Aucune catégorie</SelectItem>
      {tagCategories.map((c) => (
        <SelectItem key={c.id} value={c.id}>
          {c.name}
        </SelectItem>
      ))}
    </SelectContent>
  )

  return (
    <div className="space-y-8 p-6">
      <h1 className="font-heading text-3xl font-bold">Gestion des tags</h1>

      {/* Section Catégories */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Catégories de tags
          </h2>
          <Button variant="outline" size="sm" onClick={() => setCategoryCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle catégorie
          </Button>
        </div>
        <ul className="space-y-2">
          {tagCategories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <span className="font-medium">{cat.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingCategory(cat)
                    setCategoryFormName(cat.name)
                    setCategoryEditOpen(true)
                  }}
                  aria-label="Modifier la catégorie"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDeletingCategory(cat)
                    setCategoryDeleteOpen(true)
                  }}
                  aria-label="Supprimer la catégorie"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
          {tagCategories.length === 0 && (
            <li className="text-sm text-muted-foreground py-2">Aucune catégorie. Créez-en une pour regrouper vos tags.</li>
          )}
        </ul>
      </div>

      {/* Section Tags */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold">Tags</h2>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau tag
          </Button>
        </div>
        <ul className="space-y-3">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <TagBadge tag={tag} />
                <span className="text-sm text-muted-foreground">
                  {getCategoryName(tagCategories, tag)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEditTag(tag)} aria-label="Modifier">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => (setDeletingTag(tag), setDeleteOpen(true))} aria-label="Supprimer">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Dialog Nouveau tag */}
      <Dialog open={createOpen} onOpenChange={(o) => (setCreateOpen(o), resetTagForm())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau tag</DialogTitle>
            <DialogDescription className="sr-only">Créer un nouveau tag avec nom, catégorie et couleur</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nom du tag" />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={formCategoryId ?? '__none__'} onValueChange={(v) => setFormCategoryId(v === '__none__' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                {categorySelectOptions}
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
                    style={{ backgroundColor: c, borderColor: formColor === c ? 'var(--primary)' : 'transparent' }}
                    onClick={() => setFormColor(c)}
                    aria-label={`Couleur ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateTag} disabled={!formName.trim() || createTag.isPending}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier tag */}
      <Dialog open={editOpen} onOpenChange={(o) => (setEditOpen(o), resetTagForm())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le tag</DialogTitle>
            <DialogDescription className="sr-only">Modifier le nom, la catégorie ou la couleur du tag</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nom du tag" />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={formCategoryId ?? '__none__'} onValueChange={(v) => setFormCategoryId(v === '__none__' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                {categorySelectOptions}
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
                    style={{ backgroundColor: c, borderColor: formColor === c ? 'var(--primary)' : 'transparent' }}
                    onClick={() => setFormColor(c)}
                    aria-label={`Couleur ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateTag} disabled={!formName.trim() || updateTag.isPending}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nouvelle catégorie */}
      <Dialog open={categoryCreateOpen} onOpenChange={(o) => (setCategoryCreateOpen(o), resetCategoryForm())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
            <DialogDescription className="sr-only">Créer une catégorie pour regrouper les tags</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de la catégorie</Label>
              <Input
                value={categoryFormName}
                onChange={(e) => setCategoryFormName(e.target.value)}
                placeholder="Ex : Type d'atelier"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateCategory} disabled={!categoryFormName.trim() || createCategory.isPending}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier catégorie */}
      <Dialog open={categoryEditOpen} onOpenChange={(o) => (setCategoryEditOpen(o), resetCategoryForm())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription className="sr-only">Modifier le nom de la catégorie</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={categoryFormName} onChange={(e) => setCategoryFormName(e.target.value)} placeholder="Nom" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryEditOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateCategory} disabled={!categoryFormName.trim() || updateCategory.isPending}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(o) => (setDeleteOpen(o), resetTagForm())}
        title="Supprimer le tag ?"
        description={deletingTag ? `Le tag "${deletingTag.name}" sera supprimé. Il sera retiré de tous les ateliers.` : ''}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDeleteTag}
        loading={deleteTag.isPending}
      />

      <ConfirmDialog
        open={categoryDeleteOpen}
        onOpenChange={(o) => (setCategoryDeleteOpen(o), resetCategoryForm())}
        title="Supprimer la catégorie ?"
        description={deletingCategory ? `La catégorie "${deletingCategory.name}" sera supprimée. Les tags de cette catégorie ne seront pas supprimés mais n'auront plus de catégorie.` : ''}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDeleteCategory}
        loading={deleteCategory.isPending}
      />
    </div>
  )
}
