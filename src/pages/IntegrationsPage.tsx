import { NotionConnect } from '@/components/integrations/NotionConnect'
import { GDriveConnect } from '@/components/integrations/GDriveConnect'
import { GDriveImport } from '@/components/integrations/GDriveImport'
import { useIntegrations } from '@/hooks/useIntegrations'

export default function IntegrationsPage() {
  const { isGDriveConnected } = useIntegrations()

  return (
    <div className="container max-w-2xl space-y-6 py-6">
      <h1 className="font-heading text-3xl font-bold">Intégrations</h1>
      <p className="text-muted-foreground">
        Connectez Notion ou Google Drive pour importer des fiches ateliers.
      </p>
      <div className="space-y-4">
        <NotionConnect />
        <GDriveConnect />
        {isGDriveConnected && <GDriveImport />}
      </div>
    </div>
  )
}
