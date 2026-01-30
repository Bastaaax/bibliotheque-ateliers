import { useParams, Link } from 'react-router-dom'
import { WorkshopDetail } from '@/components/workshop/WorkshopDetail'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function WorkshopDetailPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Identifiant d&apos;atelier manquant.</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-4">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Link>
      </Button>
      <WorkshopDetail workshopId={id} />
    </div>
  )
}
