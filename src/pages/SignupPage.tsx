import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="font-heading text-2xl font-bold text-primary">
            Bibliothèque d&apos;Ateliers
          </Link>
          <CardTitle className="font-heading text-2xl">Inscription</CardTitle>
          <CardDescription>Créez un compte pour contribuer à la bibliothèque.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  )
}
