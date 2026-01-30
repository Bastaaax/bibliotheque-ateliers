import { useParams, useSearchParams, Link } from 'react-router-dom'
import { WorkshopForm } from '@/components/workshop/WorkshopForm'
import { useWorkshop, useWorkshops } from '@/hooks/useWorkshops'
import { useTags } from '@/hooks/useTags'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ArrowLeft } from 'lucide-react'
import type { WorkshopFormData } from '@/types'

export default function WorkshopEditPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const duplicateId = searchParams.get('duplicate')
  const isNew = !id || id === 'new'
  const { data: workshop, isLoading: loadingWorkshop } = useWorkshop(
    isNew ? duplicateId ?? undefined : id
  )
  const { createWorkshop, updateWorkshop } = useWorkshops()
  const { tags } = useTags()
  const { toast } = useToast()

  const defaultValues: Partial<WorkshopFormData> | undefined = isNew
    ? duplicateId && workshop
      ? {
          title: `${workshop.title} (copie)`,
          description: workshop.description ?? undefined,
          content: workshop.content ?? undefined,
          duration_minutes: workshop.duration_minutes ?? undefined,
          participants_min: workshop.participants_min ?? undefined,
          participants_max: workshop.participants_max ?? undefined,
          materials: workshop.materials ?? [],
          objectives: workshop.objectives ?? [],
          tagIds: (workshop.tags ?? []).map((t) => t.id),
        }
      : undefined
    : workshop
      ? {
          title: workshop.title,
          description: workshop.description ?? undefined,
          content: workshop.content ?? undefined,
          duration_minutes: workshop.duration_minutes ?? undefined,
          participants_min: workshop.participants_min ?? undefined,
          participants_max: workshop.participants_max ?? undefined,
          materials: workshop.materials ?? [],
          objectives: workshop.objectives ?? [],
          tagIds: (workshop.tags ?? []).map((t) => t.id),
        }
      : undefined

  const handleSubmit = async (data: WorkshopFormData) => {
    try {
      if (isNew) {
        await createWorkshop.mutateAsync(data)
        toast({ title: 'Atelier créé', description: "L'atelier a été créé avec succès." })
        window.location.href = '/'
      } else if (id) {
        await updateWorkshop.mutateAsync({ id, data })
        toast({ title: 'Atelier mis à jour', description: "Les modifications ont été enregistrées." })
        window.location.href = `/workshops/${id}`
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Une erreur est survenue.',
        variant: 'destructive',
      })
    }
  }

  const isLoading = !isNew && loadingWorkshop
  const showForm = isNew || workshop

  return (
    <div className="container max-w-3xl py-6">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Link>
      </Button>
      <h1 className="font-heading text-3xl font-bold mb-6">
        {isNew ? 'Nouvel atelier' : 'Modifier l\'atelier'}
      </h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : showForm ? (
        <WorkshopForm
          defaultValues={defaultValues}
          tags={tags}
          onSubmit={handleSubmit}
          isLoading={isNew ? createWorkshop.isPending : updateWorkshop.isPending}
          submitLabel={isNew ? 'Créer l\'atelier' : 'Enregistrer'}
        />
      ) : (
        <p className="text-muted-foreground">Atelier introuvable.</p>
      )}
    </div>
  )
}
