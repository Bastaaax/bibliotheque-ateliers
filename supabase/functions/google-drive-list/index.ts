// Edge Function: liste les fichiers Google Docs et PDF du Drive de l'utilisateur
// Authorization: Bearer <JWT Supabase>

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

  // Diagnostic : scopes du jeton Google
  let tokenScopes = ''
  try {
    const tokenInfoRes = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(driveToken)}`)
    if (tokenInfoRes.ok) {
      const tokenInfo = await tokenInfoRes.json() as { scope?: string }
      tokenScopes = tokenInfo.scope ?? ''
    } else {
      tokenScopes = '(tokeninfo: ' + tokenInfoRes.status + ')'
    }
  } catch (_) {
    tokenScopes = '(tokeninfo erreur)'
  }

  // Paramètres communs : inclure Drives partagés (Shared Drives)
  const baseParams = {
    orderBy: 'modifiedTime desc',
    pageSize: '100',
    fields: 'files(id,name,mimeType,modifiedTime)',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  }

  // Requête 1 : uniquement Docs et PDF (Mon Drive + Drives partagés)
  const qDocsPdf = `(mimeType='${MIME_GOOGLE_DOC}' or mimeType='${MIME_PDF}') and trashed=false`
  const params = new URLSearchParams({ q: qDocsPdf, ...baseParams })
  let listRes = await fetch(`${DRIVE_FILES_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${driveToken}` },
  })

  let rawFiles: { id: string; name: string; mimeType: string; modifiedTime?: string }[] = []
  let driveDocsPdfDebug = ''
  let driveErrorBody = ''
  if (listRes.ok) {
    const data = await listRes.json()
    rawFiles = data.files || []
    driveDocsPdfDebug = rawFiles.length + ' fichiers (Docs+PDF)'
  } else {
    const errText = await listRes.text()
    driveErrorBody = errText.slice(0, 400)
    driveDocsPdfDebug = 'erreur ' + listRes.status + (errText ? ': ' + errText.slice(0, 120) : '')
  }
  const debug: { scopes: string; driveDocsPdf: string; driveAll: string; driveError?: string } = {
    scopes: tokenScopes,
    driveDocsPdf: driveDocsPdfDebug,
    driveAll: '',
    ...(driveErrorBody ? { driveError: driveErrorBody } : {}),
  }

  // Fallback : tous types de fichiers (pour voir si le scope limite la visibilité)
  if (rawFiles.length === 0) {
    const paramsAny = new URLSearchParams({ q: 'trashed=false', ...baseParams })
    const resAny = await fetch(`${DRIVE_FILES_URL}?${paramsAny.toString()}`, {
      headers: { Authorization: `Bearer ${driveToken}` },
    })
    if (resAny.ok) {
      const dataAny = await resAny.json()
      const anyFiles = dataAny.files || []
      debug.driveAll = anyFiles.length + ' fichiers (tous types)'
      rawFiles = anyFiles.filter(
        (f: { mimeType: string }) => f.mimeType === MIME_GOOGLE_DOC || f.mimeType === MIME_PDF
      )
    } else {
      const errAny = await resAny.text()
      debug.driveAll = 'erreur ' + resAny.status + (errAny ? ': ' + errAny.slice(0, 120) : '')
    }
  }

  const files = rawFiles.map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    modifiedTime: f.modifiedTime || null,
  }))

  return Response.json(
    { files, debug },
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
