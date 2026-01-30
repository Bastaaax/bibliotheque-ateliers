import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TagBadge } from '@/components/tags/TagBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { useWorkshop, useWorkshops } from '@/hooks/useWorkshops'
import { formatDate, formatDuration, formatFileSize } from '@/utils/helpers'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import {
  Edit,
  Trash2,
  Copy,
  Clock,
  Users,
  Download,
  FileText,
} from 'lucide-react'
import type { Workshop } from '@/types'
import { WORKSHOP_ATTACHMENTS_BUCKET } from '@/utils/constants'

interface WorkshopDetailProps {
  workshopId: string
}

export function WorkshopDetail({ workshopId }: WorkshopDetailProps) {
  const { data: workshop, isLoading, error } = useWorkshop(workshopId)
  const { deleteWorkshop } = useWorkshops()
  const { profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canEdit =
    profile?.id === workshop?.creator_id || isAdmin

  const handleDelete = async () => {
    if (!workshopId) return
    setDeleting(true)
    try {
      await deleteWorkshop.mutateAsync(workshopId)
      toast({
        title: 'Atelier supprimé',
        description: "L'atelier a été supprimé avec succès.",
        variant: 'default',
      })
      navigate('/')
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de supprimer.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const handleDuplicate = () => {
    navigate(`/workshops/new?duplicate=${workshopId}`)
  }

  const getAttachmentUrl = (path: string) => {
    const { data } = supabase.storage.from(WORKSHOP_ATTACHMENTS_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  if (isLoading || !workshop) {
    return <div className="p-8 text-center text-muted-foreground">Chargement...</div>
  }
  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Erreur lors du chargement de l&apos;atelier.
      </div>
    )
  }

  const w = workshop as Workshop
  const creatorName = w.creator?.full_name ?? w.creator?.email ?? 'Inconnu'
  const tags = w.tags ?? []
  const attachments = w.attachments ?? []

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold">{w.title}</h1>
          <p className="mt-2 text-muted-foreground">
            Par {creatorName} · {formatDate(w.created_at)}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/workshops/${w.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Dupliquer
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              disabled={deleteWorkshop.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} />
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {w.duration_minutes != null && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(w.duration_minutes)}
          </span>
        )}
        {(w.participants_min != null || w.participants_max != null) && (
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {w.participants_min ?? '?'} à {w.participants_max ?? '?'} participants
          </span>
        )}
      </div>

      {w.description && (
        <section>
          <h2 className="font-heading text-2xl font-semibold">Description</h2>
          <div className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 p-4 font-body text-base">
            {w.description}
          </div>
        </section>
      )}

      {w.objectives && w.objectives.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl font-semibold">Objectifs</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 font-body">
            {w.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </section>
      )}

      {w.materials && w.materials.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl font-semibold">Matériel</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 font-body">
            {w.materials.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      {w.content && (
        <section>
          <h2 className="font-heading text-2xl font-semibold">Contenu détaillé</h2>
          <div
            className="mt-2 rounded-lg bg-muted/50 p-4 font-body prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: w.content }}
          />
        </section>
      )}

      {attachments.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl font-semibold">Fichiers</h2>
          <ul className="mt-2 space-y-2">
            {attachments.map((att) => (
              <li key={att.id} className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <a
                  href={getAttachmentUrl(att.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {att.file_name}
                </a>
                {att.file_size != null && (
                  <span className="text-xs text-muted-foreground">
                    ({formatFileSize(att.file_size)})
                  </span>
                )}
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={getAttachmentUrl(att.file_path)}
                    download={att.file_name}
                    aria-label={`Télécharger ${att.file_name}`}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer l'atelier ?"
        description="Cette action est irréversible. L'atelier et ses pièces jointes seront supprimés."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
