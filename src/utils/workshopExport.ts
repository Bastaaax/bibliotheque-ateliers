import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  convertInchesToTwip,
} from 'docx'
import type { Workshop } from '@/types'
import { formatDuration } from '@/utils/helpers'
import { getDerouleData, type DerouleSection } from '@/components/workshop/DerouleTableEditor'

/** Strip HTML tags and normalize spaces for plain text. */
function htmlToPlainText(html: string): string {
  if (!html?.trim()) return ''
  const div = typeof document !== 'undefined' ? document.createElement('div') : null
  if (div) {
    div.innerHTML = html
    return (div.textContent ?? div.innerText ?? '').replace(/\s+/g, ' ').trim()
  }
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Build full HTML for the workshop (for print/PDF). */
export function getWorkshopPrintHtml(w: Workshop): string {
  const meta: string[] = []
  if (w.duration_minutes != null) meta.push(`Durée : ${formatDuration(w.duration_minutes)}`)
  if (w.participants_min != null || w.participants_max != null) {
    meta.push(`Participants : ${w.participants_min ?? '?'} à ${w.participants_max ?? '?'}`)
  }
  const metaHtml = meta.length ? `<p class="meta">${meta.join(' · ')}</p>` : ''

  let contentHtml = ''
  if (w.content) {
    try {
      const data = JSON.parse(w.content) as { type?: string }
      if (data?.type === 'deroule') {
        const { blocks } = getDerouleData(w.content)
        const list = (blocks ?? []).map((block) => {
          if (block.type === 'richtext') {
            return `<div class="block-richtext"><h3>Bloc de texte libre</h3><div class="content">${block.content || '—'}</div></div>`
          }
          const s = block as DerouleSection
          return `
            <div class="block-section">
              <h2>${escapeHtml(s.title)}</h2>
              <p class="block-meta">Heure : ${escapeHtml(s.time || '—')} · Durée : ${escapeHtml(s.duration || '—')} · Qui : ${escapeHtml(s.who || '—')}</p>
              <div class="content">${s.content || '—'}</div>
            </div>`
        })
        contentHtml = list.join('')
      }
    } catch {
      contentHtml = w.content
    }
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(w.title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1a1a1a; line-height: 1.5; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    h3 { font-size: 1.1rem; margin-top: 1rem; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
    section { margin-bottom: 1.5rem; }
    section h2 { font-size: 1rem; color: #555; margin-top: 0; }
    ul { margin: 0.5rem 0; padding-left: 1.5rem; }
    .block-section, .block-richtext { margin-bottom: 1.5rem; }
    .block-meta { font-size: 0.9rem; color: #666; margin: 0.25rem 0 0.5rem; }
    .content { margin-top: 0.5rem; }
    .content p { margin: 0.35rem 0; }
    .content ul, .content ol { margin: 0.35rem 0; padding-left: 1.25rem; }
    @media print { body { padding: 1rem; } }
  </style>
</head>
<body>
  <header>
    <h1>${w.icon ? `<span aria-hidden>${escapeHtml(w.icon)}</span> ` : ''}${escapeHtml(w.title)}</h1>
    ${metaHtml}
  </header>
  ${w.description ? `<section><h2>Description</h2><div>${escapeHtml(w.description)}</div></section>` : ''}
  ${w.objectives?.length ? `<section><h2>Objectifs</h2><ul>${w.objectives.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}</ul></section>` : ''}
  ${w.materials?.length ? `<section><h2>Matériel</h2><ul>${w.materials.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul></section>` : ''}
  ${contentHtml ? `<section><h2>Contenu détaillé</h2>${contentHtml}</section>` : ''}
</body>
</html>`
}

function escapeHtml(s: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return s.replace(/[&<>"']/g, (c) => map[c] ?? c)
}

/** Build Word document and return as Blob. */
export async function getWorkshopDocxBlob(w: Workshop): Promise<Blob> {
  const children: Paragraph[] = []

  children.push(
    new Paragraph({
      text: (w.icon ? `${w.icon} ` : '') + w.title,
      heading: HeadingLevel.TITLE,
      spacing: { after: convertInchesToTwip(0.2) },
    })
  )

  const meta: string[] = []
  if (w.duration_minutes != null) meta.push(`Durée : ${formatDuration(w.duration_minutes)}`)
  if (w.participants_min != null || w.participants_max != null) {
    meta.push(`Participants : ${w.participants_min ?? '?'} à ${w.participants_max ?? '?'}`)
  }
  if (meta.length) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: meta.join(' · '), italics: true, size: 20 })],
        spacing: { after: convertInchesToTwip(0.15) },
      })
    )
  }

  if (w.description) {
    children.push(
      new Paragraph({ text: 'Description', heading: HeadingLevel.HEADING_1, spacing: { after: convertInchesToTwip(0.1) } }),
      new Paragraph({ text: w.description, spacing: { after: convertInchesToTwip(0.2) } })
    )
  }

  if (w.objectives?.length) {
    children.push(
      new Paragraph({ text: 'Objectifs', heading: HeadingLevel.HEADING_1, spacing: { after: convertInchesToTwip(0.1) } })
    )
    w.objectives.forEach((o) => {
      children.push(new Paragraph({ text: o, bullet: { level: 0 }, spacing: { after: convertInchesToTwip(0.05) } }))
    })
    children.push(new Paragraph({ spacing: { after: convertInchesToTwip(0.2) } }))
  }

  if (w.materials?.length) {
    children.push(
      new Paragraph({ text: 'Matériel', heading: HeadingLevel.HEADING_1, spacing: { after: convertInchesToTwip(0.1) } })
    )
    w.materials.forEach((m) => {
      children.push(new Paragraph({ text: m, bullet: { level: 0 }, spacing: { after: convertInchesToTwip(0.05) } }))
    })
    children.push(new Paragraph({ spacing: { after: convertInchesToTwip(0.2) } }))
  }

  if (w.content) {
    try {
      const data = JSON.parse(w.content) as { type?: string }
      if (data?.type === 'deroule') {
        const { blocks } = getDerouleData(w.content)
        children.push(
          new Paragraph({ text: 'Contenu détaillé', heading: HeadingLevel.HEADING_1, spacing: { after: convertInchesToTwip(0.15) } })
        )
        for (const block of blocks ?? []) {
          if (block.type === 'richtext') {
            const text = htmlToPlainText(block.content)
            if (text) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: 'Bloc de texte libre', bold: true, size: 22 })],
                  spacing: { after: convertInchesToTwip(0.05) },
                }),
                new Paragraph({ text: text || '—', spacing: { after: convertInchesToTwip(0.15) } })
              )
            }
          } else {
            const s = block as DerouleSection
            const metaLine = [s.time, s.duration, s.who].filter(Boolean).join(' · ') || '—'
            children.push(
              new Paragraph({
                children: [new TextRun({ text: s.title, bold: true, size: 24 })],
                spacing: { after: convertInchesToTwip(0.05) },
              }),
              new Paragraph({
                children: [new TextRun({ text: metaLine, italics: true, size: 20 })],
                spacing: { after: convertInchesToTwip(0.05) },
              }),
              new Paragraph({
                text: htmlToPlainText(s.content) || '—',
                spacing: { after: convertInchesToTwip(0.2) },
              })
            )
          }
        }
      } else {
        children.push(
          new Paragraph({ text: 'Contenu détaillé', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: htmlToPlainText(w.content), spacing: { after: convertInchesToTwip(0.2) } })
        )
      }
    } catch {
      children.push(
        new Paragraph({ text: 'Contenu détaillé', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: htmlToPlainText(w.content), spacing: { after: convertInchesToTwip(0.2) } })
      )
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })
  return await Packer.toBlob(doc)
}

/** URL to create a new Google Doc with the workshop title (user can paste content). */
export function getGoogleDocCreateUrl(w: Workshop): string {
  return `https://docs.google.com/document/create?title=${encodeURIComponent(w.title)}`
}

/** Plain text summary for copying to clipboard (e.g. to paste into Google Doc). */
export function getWorkshopPlainText(w: Workshop): string {
  const lines: string[] = []
  lines.push((w.icon ? `${w.icon} ` : '') + w.title)
  lines.push('')
  if (w.duration_minutes != null) lines.push(`Durée : ${formatDuration(w.duration_minutes)}`)
  if (w.participants_min != null || w.participants_max != null) {
    lines.push(`Participants : ${w.participants_min ?? '?'} à ${w.participants_max ?? '?'}`)
  }
  if (w.description) {
    lines.push('')
    lines.push('Description')
    lines.push(w.description)
  }
  if (w.objectives?.length) {
    lines.push('')
    lines.push('Objectifs')
    w.objectives.forEach((o) => lines.push(`• ${o}`))
  }
  if (w.materials?.length) {
    lines.push('')
    lines.push('Matériel')
    w.materials.forEach((m) => lines.push(`• ${m}`))
  }
  if (w.content) {
    try {
      const data = JSON.parse(w.content) as { type?: string }
      if (data?.type === 'deroule') {
        const { blocks } = getDerouleData(w.content)
        lines.push('')
        lines.push('Contenu détaillé')
        for (const block of blocks ?? []) {
          if (block.type === 'richtext') {
            lines.push('')
            lines.push('Bloc de texte libre')
            lines.push(htmlToPlainText(block.content) || '—')
          } else {
            const s = block as DerouleSection
            lines.push('')
            lines.push(s.title)
            lines.push(`Heure : ${s.time || '—'} · Durée : ${s.duration || '—'} · Qui : ${s.who || '—'}`)
            lines.push(htmlToPlainText(s.content) || '—')
          }
        }
      } else {
        lines.push('')
        lines.push('Contenu détaillé')
        lines.push(htmlToPlainText(w.content))
      }
    } catch {
      lines.push('')
      lines.push('Contenu détaillé')
      lines.push(htmlToPlainText(w.content))
    }
  }
  return lines.join('\n')
}
