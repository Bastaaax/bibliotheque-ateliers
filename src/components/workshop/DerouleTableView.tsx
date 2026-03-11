import { Clock, Hourglass, User, FileText } from 'lucide-react'
import { getDerouleData } from './DerouleTableEditor'

interface DerouleTableViewProps {
  content: string
  className?: string
}

export function DerouleTableView({ content, className }: DerouleTableViewProps) {
  const data = getDerouleData(content)
  const blocks = data.blocks ?? data.sections
  if (!blocks?.length) return null

  return (
    <div className={className}>
      <div className="space-y-6">
        {blocks.map((block) => {
          if (block.type === 'richtext') {
            return (
              <section
                key={block.id}
                className="rounded-xl border border-dashed border-border bg-muted/20 overflow-hidden"
              >
                <div className="border-b bg-muted/40 px-4 py-2">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bloc de texte libre
                  </span>
                </div>
                <div className="p-4">
                  {block.content ? (
                    <div
                      className="workshop-content-view prose prose-editor-headings prose-sm max-w-none dark:prose-invert [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2"
                      dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
              </section>
            )
          }
          if (block.type !== 'section') return null
          const section = block
          return (
            <section
              key={section.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="border-b bg-muted/40 px-4 py-3">
                <h1 className="font-body text-2xl font-bold text-foreground">
                  {section.title}
                </h1>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <span className="text-muted-foreground">Heure :</span>
                    <span>{section.time || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hourglass className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <span className="text-muted-foreground">Durée :</span>
                    <span>{section.duration || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <span className="text-muted-foreground">Qui :</span>
                    <span>{section.who || '—'}</span>
                  </div>
                </div>
                {section.content ? (
                  <div
                    className="workshop-content-view prose prose-editor-headings prose-sm max-w-none dark:prose-invert [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
