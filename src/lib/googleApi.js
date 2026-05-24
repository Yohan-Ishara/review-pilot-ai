import { mockGoogleAccounts, mockGoogleLocations, mockGoogleReviews } from './googleMockData'

export async function invokeWithFallback(supabase, functionName, body, fallback) {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, { body })
    if (error) return fallback
    return data || fallback
  } catch {
    return fallback
  }
}

export async function listGoogleAccounts(supabase) {
  return invokeWithFallback(supabase, 'google-list-accounts', {}, { accounts: mockGoogleAccounts, mock: true })
}

export async function listGoogleLocations(supabase, googleAccountId) {
  return invokeWithFallback(
    supabase,
    'google-list-locations',
    { googleAccountId },
    { locations: mockGoogleLocations, mock: true },
  )
}

export async function startGoogleOAuth(supabase) {
  return invokeWithFallback(supabase, 'google-oauth-start', {}, {
    authUrl: '',
    mock: true,
    message: 'Google OAuth is not deployed yet. Mock account and location lists are available for UI testing.',
  })
}

export async function syncGoogleReviewsWithFallback({ supabase, userId, location }) {
  const data = await invokeWithFallback(
    supabase,
    'sync-google-reviews',
    { locationId: location.id, googleLocationId: location.google_location_id },
    { mock: true, reviews: mockGoogleReviews },
  )

  if (!data.mock) return data

  const rows = mockGoogleReviews.map((review) => ({
    ...review,
    user_id: userId,
    location_id: location.id,
    google_review_id: `${review.google_review_id}-${location.id}`,
  }))

  const { error } = await supabase.from('reviews').upsert(rows, {
    onConflict: 'user_id,google_review_id',
    ignoreDuplicates: false,
  })

  if (error) throw error
  return { synced: rows.length, mock: true }
}

export async function postGoogleReplyWithFallback({ supabase, review, finalReply }) {
  const data = await invokeWithFallback(
    supabase,
    'post-google-review-reply',
    { reviewId: review.id, reply: finalReply },
    { ok: true, mock: true },
  )

  return data
}
