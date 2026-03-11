import { useAuth } from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GraduationCap, ListTodo, Target, FileText, ArrowRight } from 'lucide-react'

export default function EspacePage() {
  const { isDirector } = useAuth()
  const title = isDirector ? 'Espace Directeurs / Directrices' : 'Espace Formateurs / Formatrices'

  if (isDirector) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 p-6 md:p-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-muted-foreground">
            Cet espace vous est dédié. Les fonctionnalités suivantes seront bientôt disponibles.
          </p>
        </div>

        <ul className="space-y-4">
          <li className="flex gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-semibold">Créer son projet de stage</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Une option pour créer votre projet de stage et être guidé étape par étape.
              </p>
              <span className="mt-2 inline-block text-xs font-medium text-muted-foreground">À venir</span>
            </div>
          </li>
          <li className="flex gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListTodo className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-semibold">To-do direction</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Une liste des choses à penser pour une direction de stage.
              </p>
              <span className="mt-2 inline-block text-xs font-medium text-muted-foreground">À venir</span>
            </div>
          </li>
          <li className="flex gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-semibold">Assistance objectifs de formation</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Une aide pour rédiger vos objectifs de formation.
              </p>
              <span className="mt-2 inline-block text-xs font-medium text-muted-foreground">À venir</span>
            </div>
          </li>
        </ul>

        <div className="flex flex-wrap gap-3 border-t pt-6">
          <Button variant="brand" asChild>
            <Link to="/">
              <ArrowRight className="mr-2 h-4 w-4" aria-hidden />
              Banque d&apos;ateliers
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/my-workshops">Mes ateliers</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 md:p-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">
          Votre espace formateur ou formatrice. Des outils dédiés à la formation seront proposés ici.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-sm text-muted-foreground">
          Contenu à venir. En attendant, utilisez la Banque d&apos;ateliers et Mes ateliers pour créer et gérer vos ateliers.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="brand" asChild>
          <Link to="/">
            <ArrowRight className="mr-2 h-4 w-4" aria-hidden />
            Banque d&apos;ateliers
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/my-workshops">Mes ateliers</Link>
        </Button>
      </div>
    </div>
  )
}
