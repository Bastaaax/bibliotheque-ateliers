import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { FileText, CheckCircle, XCircle } from 'lucide-react'

// TODO Phase 2: Implémenter OAuth Notion
// - Rediriger vers l'URL d'autorisation Notion
// - Gérer le callback avec le code d'autorisation
// - Échanger le code contre un access_token et refresh_token
// - Stocker dans la table integrations pour l'utilisateur connecté

export function NotionConnect() {
  const { toast } = useToast()
  const isConnected = false // TODO: lire depuis useIntegrations ou Supabase

  const handleConnect = () => {
    toast({
      title: 'Bientôt disponible',
      description: "L'intégration Notion sera disponible en phase 2.",
      variant: 'default',
    })
    // TODO: window.location.href = NOTION_OAUTH_URL
  }

  const handleDisconnect = () => {
    toast({
      title: 'Bientôt disponible',
      description: "La déconnexion Notion sera disponible en phase 2.",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <div>
            <CardTitle>Notion</CardTitle>
            <CardDescription>Importer des pages Notion comme fiches ateliers</CardDescription>
          </div>
        </div>
        {isConnected ? (
          <CheckCircle className="h-6 w-6 text-green-500" aria-label="Connecté" />
        ) : (
          <XCircle className="h-6 w-6 text-muted-foreground" aria-label="Non connecté" />
        )}
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <Button variant="outline" onClick={handleDisconnect}>
            Déconnecter Notion
          </Button>
        ) : (
          <Button onClick={handleConnect}>Connecter Notion</Button>
        )}
      </CardContent>
    </Card>
  )
}
