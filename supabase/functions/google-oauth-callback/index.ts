import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1'
import { encryptToken } from '../_shared/google.ts'

const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return Response.redirect(`${appUrl}/locations?google=error&message=${encodeURIComponent(error)}`, 302)
  }

  if (!code || !state) {
    return Response.redirect(`${appUrl}/locations?google=missing_code`, 302)
  }

  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
  const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!clientId || !clientSecret || !redirectUri || !supabaseUrl || !serviceRoleKey) {
    return Response.redirect(`${appUrl}/locations?google=mock`, 302)
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: stateRow, error: stateError } = await supabase
      .from('google_oauth_states')
      .select('*')
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (stateError || !stateRow) {
      return Response.redirect(`${appUrl}/locations?google=invalid_state`, 302)
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || tokenData.error || 'Google token exchange failed')
    }

    const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const userInfo = userInfoResponse.ok ? await userInfoResponse.json() : {}
    const expiresAt = new Date(Date.now() + Number(tokenData.expires_in || 3600) * 1000).toISOString()

    const connectionPayload: Record<string, string | null> = {
      user_id: stateRow.user_id,
      google_account_email: userInfo.email || null,
      access_token_encrypted: await encryptToken(tokenData.access_token),
      expires_at: expiresAt,
      scope: tokenData.scope || '',
    }

    if (tokenData.refresh_token) {
      connectionPayload.refresh_token_encrypted = await encryptToken(tokenData.refresh_token)
    }

    const { error: upsertError } = await supabase
      .from('google_connections')
      .upsert(connectionPayload, { onConflict: 'user_id' })

    if (upsertError) throw upsertError

    await supabase.from('google_oauth_states').delete().eq('state', state)

    return Response.redirect(`${appUrl}/locations?google=connected`, 302)
  } catch (callbackError) {
    return Response.redirect(`${appUrl}/locations?google=error&message=${encodeURIComponent(callbackError.message)}`, 302)
  }
})
