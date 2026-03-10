// Edge Function: importe un fichier Drive (Google Doc ou PDF) en atelier
// - Google Doc: export texte via Drive API
// - PDF: téléchargement + extraction texte (couche texte) ou message "OCR à venir"
// Authorization: Bearer <JWT Supabase>
// Body: { fileId: string, mimeType: string }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files'
const MIME_GOOGLE_DOC = 'application/vnd.google-apps.document'
const MIME_PDF = 'application/pdf'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

function getAccessToken(supabase: ReturnType<typeof createClient>, userId: string): Promise<string | null> {
  return (async () => {
    const { data, error } = await supabase
      .from('integrations')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .eq('type', 'gdrive')
      .single()
    if (error || !data?.access_token) return null
    let token = data.access_token as string
    const refreshToken = data.refresh_token as string | null
    if (refreshToken) {
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      if (clientId && clientSecret) {
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          }),
        })
        if (res.ok) {
          const json = await res.json()
          token = json.access_token
          await supabase.from('integrations').update({ access_token: token }).eq('user_id', userId).eq('type', 'gdrive')
        }
      }
    }
    return token
  })()
}

function parseTextToWorkshop(rawText: string): Record<string, unknown> {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const title = lines[0] || 'Sans titre'
  let description = ''
  let content = ''
  const materials: string[] = []
  const objectives: string[] = []
  let duration: number | null = null
  let participantsMin: number | null = null
  let participantsMax: number | null = null

  let i = 1
  const collectList = (keywords: string[]): string[] => {
    const list: string[] = []
    while (i < lines.length) {
      const line = lines[i]
      if (keywords.some((k) => line.toLowerCase().startsWith(k))) break
      if (line.match(/^[-*•]\s/)) list.push(line.replace(/^[-*•]\s*/, '').trim())
      else if (line) list.push(line)
      i++
    }
    return list
  }

  while (i < lines.length) {
    const line = lines[i]
    const lower = line.toLowerCase()
    if (lower.startsWith('description') || lower.startsWith('résumé')) {
      i++
      const block: string[] = []
      while (i < lines.length && !/^(objectifs?|matériel|durée|participants?|contenu)/i.test(lines[i])) block.push(lines[i++])
      description = block.join('\n').trim()
      continue
    }
    if (lower.startsWith('objectifs?')) {
      i++
      objectives.push(...collectList(['matériel', 'durée', 'participants', 'contenu']))
      continue
    }
    if (lower.startsWith('matériel')) {
      i++
      materials.push(...collectList(['durée', 'participants', 'objectifs', 'contenu']))
      continue
    }
    if (lower.startsWith('durée')) {
      const match = line.match(/(\d+)\s*(min|minute|h|heure)/i)
      if (match) duration = match[2].toLowerCase().startsWith('h') ? parseInt(match[1], 10) * 60 : parseInt(match[1], 10)
      i++
      continue
    }
    if (lower.startsWith('participants')) {
      const match = line.match(/(\d+)\s*[-–]\s*(\d+)/) || line.match(/(\d+)/)
      if (match) {
        participantsMin = parseInt(match[1], 10)
        participantsMax = match[2] ? parseInt(match[2], 10) : participantsMin
      }
      i++
      continue
    }
    if (lower.startsWith('contenu')) {
      i++
      const block: string[] = []
      while (i < lines.length) block.push(lines[i++])
      content = block.join('\n').trim()
      continue
    }
    if (!description && line.length > 2) description = line
    else if (!content && line.length > 2) content = line
    i++
  }

  if (!content && description) content = description

  return {
    title,
    description: description || null,
    content: content || null,
    duration_minutes: duration,
    participants_min: participantsMin,
    participants_max: participantsMax,
    materials: materials.length ? materials : [],
    objectives: objectives.length ? objectives : [],
    source: 'gdrive',
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Missing or invalid Authorization' }, { status: 401, headers: corsHeaders })
  }
  const token = authHeader.slice(7)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  if (userError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

  const driveToken = await getAccessToken(supabase, user.id)
  if (!driveToken) {
    return Response.json({ error: 'Google Drive not connected' }, { status: 400, headers: corsHeaders })
  }

  let body: { fileId?: string; mimeType?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })
  }
  const { fileId, mimeType } = body
  if (!fileId || !mimeType) {
    return Response.json({ error: 'fileId and mimeType required' }, { status: 400, headers: corsHeaders })
  }

  let rawText = ''

  if (mimeType === MIME_GOOGLE_DOC) {
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`
    const exportRes = await fetch(exportUrl, { headers: { Authorization: `Bearer ${driveToken}` } })
    if (!exportRes.ok) {
      const err = await exportRes.text()
      console.error('Drive export error:', exportRes.status, err)
      return Response.json({ error: 'Export failed' }, { status: 502, headers: corsHeaders })
    }
    rawText = await exportRes.text()
  } else if (mimeType === MIME_PDF) {
    const metaRes = await fetch(`${DRIVE_FILES_URL}/${fileId}?fields=name`, {
      headers: { Authorization: `Bearer ${driveToken}` },
    })
    const meta = await metaRes.json()
    const fileName = meta.name || 'document.pdf'
    rawText = `# ${fileName}\n\nCe fichier est un PDF. L'extraction du texte (OCR) sera disponible dans une prochaine version. En attendant, vous pouvez copier le contenu dans un Google Doc et réimporter.`
  } else {
    return Response.json({ error: 'Unsupported mimeType' }, { status: 400, headers: corsHeaders })
  }

  const workshopPayload = parseTextToWorkshop(rawText)
  const { data: workshop, error: insertError } = await supabase
    .from('workshops')
    .insert({
      ...workshopPayload,
      creator_id: user.id,
      source_id: fileId,
      source_url: `https://drive.google.com/file/d/${fileId}/view`,
    } as Record<string, unknown>)
    .select('id, title, created_at')
    .single()

  if (insertError) {
    console.error('Workshop insert error:', insertError)
    return Response.json({ error: 'Failed to create workshop' }, { status: 502, headers: corsHeaders })
  }

  return Response.json(
    { workshop: { id: workshop.id, title: workshop.title, created_at: workshop.created_at } },
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
