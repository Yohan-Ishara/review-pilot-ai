import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import {
  corsHeaders,
  getAccessToken,
  getAuthenticatedUser,
  getGoogleConnection,
  googleJson,
} from '../_shared/google.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const body = await req.json().catch(() => ({}))

  try {
    const { supabase, user } = await getAuthenticatedUser(req)

    if (!body.reviewId || !body.reply) {
      return new Response(JSON.stringify({ error: 'reviewId and reply are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*, business_locations(*)')
      .eq('id', body.reviewId)
      .eq('user_id', user.id)
      .single()

    if (reviewError || !review) throw reviewError || new Error('Review not found')

    const connection = await getGoogleConnection(supabase, user.id)
    const location = review.business_locations
    const shouldUseMock =
      !connection ||
      !review.google_review_id ||
      !location?.google_connected ||
      review.google_review_id.startsWith('google-mock-review')

    if (!shouldUseMock) {
      const accessToken = await getAccessToken(supabase, connection)
      const reviewName = review.google_review_id.startsWith('accounts/')
        ? review.google_review_id
        : `${location.google_account_id}/${location.google_location_id}/reviews/${review.google_review_id}`

      await googleJson(`https://mybusiness.googleapis.com/v4/${reviewName}/reply`, accessToken, {
        method: 'PUT',
        body: JSON.stringify({ comment: body.reply }),
      })
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({ final_reply: body.reply, status: 'replied' })
      .eq('id', body.reviewId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({
        ok: true,
        mock: shouldUseMock,
        message: shouldUseMock ? 'Mock Google reply posted.' : 'Reply posted to Google.',
        review: data,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
