import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { HardDrive, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useIntegrations } from '@/hooks/useIntegrations'
import { getGoogleOAuthUrl } from '@/lib/gdrive'

export function GDriveConnect() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const { session } = useAuth()
  const { isGDriveConnected, disconnectGDrive, isLoading } = useIntegrations()

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (connected === 'gdrive') {
      toast({ title: 'Google Drive connecté', description: 'Vous pouvez importer des documents.' })
      setSearchParams({}, { replace: true })
    }
    if (error) {
      const messages: Record<string, string> = {
        unauthorized: 'Session expirée. Reconnectez-vous puis réessayez.',
        missing_code_or_state: 'Autorisation incomplète. Réessayez.',
        token_exchange: 'Échec de la connexion Google. Réessayez.',
        save_failed: 'Connexion enregistrée mais erreur de sauvegarde.',
        server_config: 'Configuration serveur manquante (Google OAuth).',
        server_error: 'Erreur serveur lors de la connexion. Réessayez ou vérifiez les logs Supabase.',
      }
      toast({
        title: 'Erreur Google Drive',
        description: messages[error] || error,
        variant: 'destructive',
      })
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, toast])

  const handleConnect = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      toast({
        title: 'Configuration manquante',
        description: 'Ajoutez VITE_GOOGLE_CLIENT_ID dans .env.local',
        variant: 'destructive',
      })
      return
    }
    if (!session?.access_token) {
      toast({
        title: 'Non connecté',
        description: 'Connectez-vous d’abord à la plateforme.',
        variant: 'destructive',
      })
      return
    }
    const url = getGoogleOAuthUrl(session.access_token)
    if (url) window.location.href = url
  }

  const handleDisconnect = async () => {
    try {
      await disconnectGDrive.mutateAsync()
      toast({ title: 'Google Drive déconnecté' })
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de déconnecter Google Drive.',
        variant: 'destructive',
      })
    }
  }

  const isConfigOk = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="h-8 w-8 text-muted-foreground" />
          <div>
            <CardTitle>Google Drive</CardTitle>
            <CardDescription>Connectez votre compte Google pour importer des documents (Google Docs, PDF) en ateliers.</CardDescription>
          </div>
        </div>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Chargement" />
        ) : isGDriveConnected ? (
          <CheckCircle className="h-6 w-6 text-green-500" aria-label="Connecté" />
        ) : (
          <XCircle className="h-6 w-6 text-muted-foreground" aria-label="Non connecté" />
        )}
      </CardHeader>
      <CardContent>
        {isGDriveConnected ? (
          <Button variant="outline" onClick={handleDisconnect} disabled={disconnectGDrive.isPending}>
            Déconnecter Google Drive
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={!isConfigOk || !session}>
            Connecter Google Drive
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
