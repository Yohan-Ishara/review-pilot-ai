import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const scopes = [
  'https://www.googleapis.com/auth/business.manage',
  'openid',
  'email',
  'profile',
]

function buildAuthUrl(state: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI')

  if (!clientId || !redirectUri) return ''

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes.join(' '),
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authorization = req.headers.get('Authorization') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    })
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const state = crypto.randomUUID()
    const authUrl = buildAuthUrl(state)
    if (!authUrl) {
      return new Response(
        JSON.stringify({
          authUrl: '',
          mock: true,
          message: 'Google OAuth secrets are not configured yet.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { error } = await supabase.from('google_oauth_states').insert({
      user_id: user.id,
      state,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })

    if (error) throw error

    if (req.method === 'GET') return Response.redirect(authUrl, 302)

    return new Response(JSON.stringify({ authUrl, mock: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
