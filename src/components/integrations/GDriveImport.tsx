import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { FileText, FileUp, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { listDriveFiles, importDriveFile } from '@/lib/gdrive'

export function GDriveImport() {
  const { session } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [importingId, setImportingId] = useState<string | null>(null)

  const { data: result, isLoading, refetch } = useQuery({
    queryKey: ['gdrive-files'],
    queryFn: () => listDriveFiles(),
    enabled: !!session,
  })
  const files = result?.files ?? []
  const debug = result?.debug

  const handleImport = async (fileId: string, mimeType: string) => {
    if (!session) return
    setImportingId(fileId)
    try {
      const { workshop } = await importDriveFile(fileId, mimeType)
      toast({
        title: 'Atelier créé',
        description: `« ${workshop.title} » a été ajouté à la bibliothèque.`,
      })
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
    } catch (err) {
      toast({
        title: 'Import échoué',
        description: err instanceof Error ? err.message : 'Erreur inconnue',
        variant: 'destructive',
      })
    } finally {
      setImportingId(null)
    }
  }

  const isDoc = (mime: string) => mime === 'application/vnd.google-apps.document'
  const isPdf = (mime: string) => mime === 'application/pdf'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileUp className="h-8 w-8 text-muted-foreground" />
          <div>
            <CardTitle>Importer depuis Drive</CardTitle>
            <CardDescription>Choisissez un Google Doc ou un PDF pour le transformer en fiche atelier (texte extrait automatiquement).</CardDescription>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualiser'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des fichiers…</span>
          </div>
        ) : files.length === 0 ? (
          <div className="space-y-3 py-6">
            <p className="text-center text-sm text-muted-foreground">
              Aucun Google Doc ni PDF trouvé dans votre Drive.
            </p>
            <details className="rounded-lg border bg-muted/50 p-3 text-left text-xs">
              <summary className="cursor-pointer font-medium text-muted-foreground">
                Diagnostic (pour comprendre pourquoi)
              </summary>
              {debug ? (
                <>
                  <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-muted-foreground">
                    {[
                      `Scopes du jeton Google : ${debug.scopes || '(vide)'}`,
                      `Requête Docs+PDF : ${debug.driveDocsPdf}`,
                      `Requête tous types : ${debug.driveAll || '-'}`,
                      debug.driveError ? `Erreur API Drive : ${debug.driveError}` : '',
                    ].filter(Boolean).join('\n')}
                  </pre>
                  <p className="mt-2 font-medium text-amber-600 dark:text-amber-500">
                    Liste vide alors que tu as des docs dans ton Drive ? Déconnecte Google Drive ici, puis reconnecte-toi :
                    Google doit accorder le scope « drive.readonly » pour qu’on voie tous tes fichiers. Un ancien jeton peut n’avoir que « drive.file » (fichiers vus via l’app uniquement).
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Si « Scopes » ne contient pas « drive » ou « drive.readonly », la reconnexion est nécessaire.
                    Si une erreur 403 apparaît ci-dessus, le jeton n’a pas les droits.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  Redéploie la fonction pour afficher le diagnostic : dans le terminal, lance
                  <code className="mx-1 rounded bg-muted px-1">supabase functions deploy google-drive-list</code>
                  puis clique sur Actualiser ici.
                </p>
              )}
            </details>
          </div>
        ) : (
          <ul className="space-y-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {isDoc(f.mimeType) ? (
                    <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                  ) : (
                    <FileText className="h-5 w-5 shrink-0 text-red-600" />
                  )}
                  <span className="truncate text-sm font-medium">{f.name}</span>
                  {isPdf(f.mimeType) && (
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      PDF (texte limité)
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleImport(f.id, f.mimeType)}
                  disabled={importingId === f.id}
                >
                  {importingId === f.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Ajouter à la bibliothèque'
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && (
          <details className="mt-4 rounded-lg border bg-muted/50 p-3 text-left text-xs">
            <summary className="cursor-pointer font-medium text-muted-foreground">
              Diagnostic Google Drive (scopes, erreurs API)
            </summary>
            {debug ? (
              <>
                <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-muted-foreground">
                  {[
                    `Scopes du jeton Google : ${debug.scopes || '(vide)'}`,
                    `Requête Docs+PDF : ${debug.driveDocsPdf}`,
                    `Requête tous types : ${debug.driveAll || '-'}`,
                    debug.driveError ? `Erreur API Drive : ${debug.driveError}` : '',
                  ].filter(Boolean).join('\n')}
                </pre>
                <p className="mt-2 font-medium text-amber-600 dark:text-amber-500">
                  Liste vide ? Déconnecte Google Drive puis reconnecte-toi pour accorder le scope « drive.readonly ».
                </p>
              </>
            ) : (
              <p className="mt-2 text-muted-foreground">
                Redéploie la fonction : <code className="rounded bg-muted px-1">supabase functions deploy google-drive-list</code>, puis Actualiser.
              </p>
            )}
          </details>
        )}
      </CardContent>
    </Card>
  )
}
