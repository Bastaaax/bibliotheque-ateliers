// Edge Function: callback OAuth Google Drive
// Échange le code d'autorisation contre access_token + refresh_token et enregistre dans integrations.
// Redirect URI à configurer dans Google Cloud: https://<PROJECT_REF>.supabase.co/functions/v1/google-oauth-callback

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

Deno.serve(async (req) => {
  const appOrigin = Deno.env.get('APP_ORIGIN') || 'http://localhost:5173'
  const redirectError = (err: string) =>
    Response.redirect(`${appOrigin}/integrations?error=${encodeURIComponent(err)}`, 302)

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const errorParam = url.searchParams.get('error')

    if (errorParam) {
      return redirectError(errorParam)
    }

    if (!code || !state) {
      return redirectError('missing_code_or_state')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID') ?? ''
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? ''

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[google-oauth-callback] SUPABASE_URL or SUPABASE_ANON_KEY missing')
      return redirectError('server_config')
    }

    if (!clientId || !clientSecret) {
      console.error(
        '[google-oauth-callback] server_config: GOOGLE_CLIENT_ID=' +
          (clientId ? 'set' : 'MISSING') +
          ', GOOGLE_CLIENT_SECRET=' +
          (clientSecret ? 'set' : 'MISSING')
      )
      return redirectError('server_config')
    }

    const token = state.trim()
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    // Récupérer l'utilisateur via le JWT (contexte déjà défini par l'en-tête)
    let user: { id: string } | null = null
    try {
      const res = await supabase.auth.getUser(token)
      user = res.data?.user ?? null
      if (res.error) {
        console.error('[google-oauth-callback] getUser error:', res.error.message)
      }
    } catch (getUserErr) {
      console.error('[google-oauth-callback] getUser threw:', getUserErr)
    }
    if (!user) {
      return redirectError('unauthorized')
    }

    const baseUrl = new URL(supabaseUrl).origin
    const redirectUri = `${baseUrl}/functions/v1/google-oauth-callback`
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    })

    let accessToken: string | undefined
    let refreshToken: string | null = null
    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Google token error:', tokenRes.status, errText)
      return redirectError('token_exchange')
    }
    try {
      const tokens = (await tokenRes.json()) as { access_token?: string; refresh_token?: string }
      accessToken = tokens.access_token
      refreshToken = tokens.refresh_token ?? null
    } catch (parseErr) {
      console.error('[google-oauth-callback] token response parse error:', parseErr)
      return redirectError('token_exchange')
    }
    if (!accessToken) {
      console.error('[google-oauth-callback] Google response missing access_token')
      return redirectError('token_exchange')
    }

    const { error: upsertError } = await supabase.from('integrations').upsert(
      {
        user_id: user.id,
        type: 'gdrive',
        access_token: accessToken,
        refresh_token: refreshToken,
        config: {},
      },
      { onConflict: 'user_id,type' }
    )

    if (upsertError) {
      console.error('Integrations upsert error:', upsertError.message, upsertError.details)
      return redirectError('save_failed')
    }

    return Response.redirect(`${appOrigin}/integrations?connected=gdrive`, 302)
  } catch (e) {
    console.error('[google-oauth-callback] unhandled error:', e)
    return redirectError('server_error')
  }
})
