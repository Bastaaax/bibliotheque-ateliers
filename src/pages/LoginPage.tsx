import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { isSupabaseConfigured } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="font-heading text-2xl font-bold text-primary">
            Bibliothèque d&apos;Ateliers
          </Link>
          <CardTitle className="font-heading text-2xl">Connexion</CardTitle>
          <CardDescription>Connectez-vous pour accéder à la bibliothèque.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupabaseConfigured && (
            <div
              className="rounded-lg border border-amber-500/50 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
              role="alert"
            >
              <strong>Configuration manquante.</strong> Créez un fichier <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">.env.local</code> avec{' '}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">VITE_SUPABASE_URL</code> et{' '}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">VITE_SUPABASE_ANON_KEY</code> (voir <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">.env.local.example</code>).
            </div>
          )}
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
