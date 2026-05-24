import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import {
  corsHeaders,
  getAccessToken,
  getAuthenticatedUser,
  getGoogleConnection,
  googleJson,
} from '../_shared/google.ts'

function googleRatingToNumber(value: string | number) {
  if (typeof value === 'number') return value
  const ratings: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    STAR_RATING_UNSPECIFIED: 0,
  }
  return ratings[value] || 0
}

function getSentiment(rating: number) {
  if (rating <= 2) return 'negative'
  if (rating === 3) return 'neutral'
  return 'positive'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { supabase, user } = await getAuthenticatedUser(req)

    if (!body.locationId) {
      return new Response(JSON.stringify({ error: 'locationId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: location, error: locationError } = await supabase
      .from('business_locations')
      .select('*')
      .eq('id', body.locationId)
      .eq('user_id', user.id)
      .single()

    if (locationError || !location) throw locationError || new Error('Location not found')

    const mockRows = [
      {
        user_id: user.id,
        location_id: location.id,
        google_review_id: `google-mock-review-1-${location.id}`,
        reviewer_name: 'Google Customer',
        rating: 5,
        comment: 'Found them on Google and had a smooth, friendly experience from start to finish.',
        review_date: new Date().toISOString(),
        sentiment: 'positive',
        status: 'new',
      },
      {
        user_id: user.id,
        location_id: location.id,
        google_review_id: `google-mock-review-2-${location.id}`,
        reviewer_name: 'Maps Reviewer',
        rating: 2,
        comment: 'The service was okay, but I had trouble getting a clear update before my appointment.',
        review_date: new Date().toISOString(),
        sentiment: 'negative',
        status: 'new',
      },
    ]

    const connection = await getGoogleConnection(supabase, user.id)
    if (!connection || !location.google_connected) {
      return new Response(JSON.stringify({ ok: false, synced: 0, mock: false, error: 'No connected Google Business Profile location is linked.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const accessToken = await getAccessToken(supabase, connection)
    const googleAccountId = location.google_account_id
    const googleLocationId = location.google_location_id
    const url = `https://mybusiness.googleapis.com/v4/${googleAccountId}/${googleLocationId}/reviews`
    const data = await googleJson(url, accessToken)
    const rows = (data.reviews || []).map((review: any) => {
      const rating = googleRatingToNumber(review.starRating)
      return {
        user_id: user.id,
        location_id: location.id,
        google_review_id: review.name || review.reviewId,
        reviewer_name: review.reviewer?.displayName || 'Google reviewer',
        rating,
        comment: review.comment || '',
        review_date: review.createTime || review.updateTime || new Date().toISOString(),
        sentiment: getSentiment(rating),
        status: 'new',
      }
    })

    if (!rows.length) {
      return new Response(JSON.stringify({ ok: true, synced: 0, mock: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error } = await supabase.from('reviews').upsert(rows, { onConflict: 'user_id,google_review_id' })

    if (error) throw error

    return new Response(JSON.stringify({ ok: true, synced: rows.length, mock: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
