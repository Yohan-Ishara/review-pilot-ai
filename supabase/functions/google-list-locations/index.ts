import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import {
  corsHeaders,
  getAccessToken,
  getAuthenticatedUser,
  getGoogleConnection,
  googleJson,
} from '../_shared/google.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const body = await req.json().catch(() => ({}))
  const googleAccountId = body.googleAccountId

  try {
    if (!googleAccountId) throw new Error('googleAccountId is required')
    const { supabase, user } = await getAuthenticatedUser(req)
    const connection = await getGoogleConnection(supabase, user.id)

    if (!connection) {
      return new Response(JSON.stringify({ mock: false, googleAccountId, locations: [], connected: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: account } = await supabase
      .from('google_business_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('google_account_id', googleAccountId)
      .maybeSingle()

    if (!account) throw new Error('Google account is not linked to this user')

    const accessToken = await getAccessToken(supabase, connection)
    const readMask = 'name,title,storefrontAddress'
    const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${googleAccountId}/locations?readMask=${encodeURIComponent(readMask)}`
    const data = await googleJson(url, accessToken)
    const locations = (data.locations || []).map((location: any) => ({
      google_location_id: location.name,
      google_location_name: location.title || location.name,
      address: location.storefrontAddress?.addressLines?.join(', ') || '',
    }))

    return new Response(JSON.stringify({ mock: false, googleAccountId, locations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('google-list-locations failed', { googleAccountId, message: error.message })
    return new Response(JSON.stringify({
      error: error.message,
      message: `No verified Google Business Profile locations could be loaded for this account: ${error.message}`,
      mock: false,
      googleAccountId,
      locations: [],
    }), {
      status: error.message === 'Unauthorized' ? 401 : 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
