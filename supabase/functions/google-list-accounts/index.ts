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

  try {
    const { supabase, user } = await getAuthenticatedUser(req)
    const connection = await getGoogleConnection(supabase, user.id)

    if (!connection) {
      return new Response(JSON.stringify({ mock: false, accounts: [], connected: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const accessToken = await getAccessToken(supabase, connection)
    const data = await googleJson('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', accessToken)
    const accounts = (data.accounts || []).map((account: any) => ({
      google_account_id: account.name,
      google_account_name: account.accountName || account.name,
    }))

    await supabase.from('google_business_accounts').upsert(
      accounts.map((account: any) => ({
        user_id: user.id,
        google_connection_id: connection.id,
        google_account_id: account.google_account_id,
        google_account_name: account.google_account_name,
      })),
      { onConflict: 'user_id,google_account_id' },
    )

    return new Response(JSON.stringify({ mock: false, connected: true, accounts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, mock: false, accounts: [] }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
