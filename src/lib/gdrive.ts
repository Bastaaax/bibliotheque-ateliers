import { supabase } from './supabase'

// Scope "drive" permet de lister tous les fichiers ; "drive.readonly" seul peut ne pas suffire selon le jeton.
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive'

export function getSupabaseFunctionsUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL ?? ''
  const base = url.replace(/\/$/, '')
  return `${base}/functions/v1`
}

export function getGoogleOAuthUrl(accessToken: string): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) return ''
  const functionsUrl = getSupabaseFunctionsUrl()
  const redirectUri = `${functionsUrl}/google-oauth-callback`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state: accessToken,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export type DriveListResult = {
  files: { id: string; name: string; mimeType: string; modifiedTime: string | null }[]
  debug?: { scopes: string; driveDocsPdf: string; driveAll: string; driveError?: string }
}

export async function listDriveFiles(): Promise<DriveListResult> {
  const { data, error } = await supabase.functions.invoke('google-drive-list', { method: 'GET' })
  if (error) throw new Error(error.message ?? 'Liste Drive impossible')
  const body = data as { files?: DriveListResult['files']; debug?: DriveListResult['debug'] } | null
  return {
    files: body?.files ?? [],
    debug: body?.debug,
  }
}

export async function importDriveFile(
  fileId: string,
  mimeType: string
): Promise<{ workshop: { id: string; title: string; created_at: string } }> {
  const { data, error } = await supabase.functions.invoke('google-drive-import', {
    method: 'POST',
    body: { fileId, mimeType },
  })
  if (error) throw new Error(error.message ?? 'Import impossible')
  return data as { workshop: { id: string; title: string; created_at: string } }
}
