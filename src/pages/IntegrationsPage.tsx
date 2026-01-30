import { NotionConnect } from '@/components/integrations/NotionConnect'
import { GDriveConnect } from '@/components/integrations/GDriveConnect'

export default function IntegrationsPage() {
  return (
    <div className="container max-w-2xl space-y-6 py-6">
      <h1 className="font-heading text-3xl font-bold">Intégrations</h1>
      <p className="text-muted-foreground">
        Connectez Notion ou Google Drive pour importer des fiches ateliers.
      </p>
      <div className="space-y-4">
        <NotionConnect />
        <GDriveConnect />
      </div>
    </div>
  )
}
