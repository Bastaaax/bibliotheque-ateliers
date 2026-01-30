import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { WorkshopEditor } from './WorkshopEditor'
import { TagBadge } from '@/components/tags/TagBadge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { WorkshopFormData } from '@/types'
import type { Tag } from '@/types'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'

const workshopSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().optional(),
  content: z.string().optional(),
  duration_minutes: z.coerce.number().int().min(0).max(480).optional().nullable(),
  participants_min: z.coerce.number().int().min(0).max(500).optional().nullable(),
  participants_max: z.coerce.number().int().min(0).max(500).optional().nullable(),
  materials: z.array(z.string()).default([]),
  objectives: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
})

type WorkshopFormValues = z.infer<typeof workshopSchema>

interface WorkshopFormProps {
  defaultValues?: Partial<WorkshopFormData>
  tags: Tag[]
  onSubmit: (data: WorkshopFormData) => void | Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

const emptyMaterial = ''
const emptyObjective = ''

export function WorkshopForm({
  defaultValues,
  tags,
  onSubmit,
  isLoading = false,
  submitLabel = 'Enregistrer',
}: WorkshopFormProps) {
  const [materials, setMaterials] = useState<string[]>(
    defaultValues?.materials?.length ? [...defaultValues.materials, emptyMaterial] : [emptyMaterial]
  )
  const [objectives, setObjectives] = useState<string[]>(
    defaultValues?.objectives?.length ? [...defaultValues.objectives, emptyObjective] : [emptyObjective]
  )

  const form = useForm<WorkshopFormValues>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      content: defaultValues?.content ?? '',
      duration_minutes: defaultValues?.duration_minutes ?? null,
      participants_min: defaultValues?.participants_min ?? null,
      participants_max: defaultValues?.participants_max ?? null,
      materials: defaultValues?.materials ?? [],
      objectives: defaultValues?.objectives ?? [],
      tagIds: defaultValues?.tagIds ?? [],
    },
  })

  const selectedTagIds = form.watch('tagIds')
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id))

  const addMaterial = () => setMaterials((prev) => [...prev, emptyMaterial])
  const removeMaterial = (i: number) =>
    setMaterials((prev) => prev.filter((_, idx) => idx !== i))
  const updateMaterial = (i: number, v: string) =>
    setMaterials((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })

  const addObjective = () => setObjectives((prev) => [...prev, emptyObjective])
  const removeObjective = (i: number) =>
    setObjectives((prev) => prev.filter((_, idx) => idx !== i))
  const updateObjective = (i: number, v: string) =>
    setObjectives((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })

  const handleSubmit = form.handleSubmit(async (values) => {
    const materialsFiltered = materials.filter(Boolean)
    const objectivesFiltered = objectives.filter(Boolean)
    await onSubmit({
      ...values,
      materials: materialsFiltered,
      objectives: objectivesFiltered,
      tagIds: values.tagIds,
    })
  })

  const toggleTag = (tagId: string) => {
    const current = form.getValues('tagIds')
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId]
    form.setValue('tagIds', next)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input placeholder="Titre de l'atelier" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Résumé ou courte description"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu détaillé</FormLabel>
              <FormControl>
                <WorkshopEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Contenu riche (objectifs, déroulé, conseils...)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée (min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={480}
                    placeholder="60"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="participants_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participants (min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="—"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="participants_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participants (max)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="—"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Objectifs</FormLabel>
          <FormDescription>Liste des objectifs pédagogiques</FormDescription>
          <div className="space-y-2">
            {objectives.map((obj, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={obj}
                  onChange={(e) => updateObjective(i, e.target.value)}
                  placeholder={`Objectif ${i + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeObjective(i)}
                  disabled={objectives.length <= 1}
                  aria-label="Supprimer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addObjective}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un objectif
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel>Matériel</FormLabel>
          <FormDescription>Liste du matériel nécessaire</FormDescription>
          <div className="space-y-2">
            {materials.map((m, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={m}
                  onChange={(e) => updateMaterial(i, e.target.value)}
                  placeholder={`Matériel ${i + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMaterial(i)}
                  disabled={materials.length <= 1}
                  aria-label="Supprimer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter du matériel
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="tagIds"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {selectedTags.length > 0
                      ? `${selectedTags.length} tag(s) sélectionné(s)`
                      : 'Sélectionner des tags'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-2" align="start">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-1"
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleTag(tag.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggleTag(tag.id)
                          }
                        }}
                      >
                        <Checkbox
                          checked={selectedTagIds.includes(tag.id)}
                          onCheckedChange={() => toggleTag(tag.id)}
                        />
                        <TagBadge tag={tag} />
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
