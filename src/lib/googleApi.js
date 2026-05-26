import { mockGoogleAccounts, mockGoogleLocations, mockGoogleReviews } from './googleMockData'

export async function invokeGoogleFunction(supabase, functionName, body) {
  const { data, error } = await supabase.functions.invoke(functionName, { body })
  if (error) {
    const message = await readFunctionError(error)
    throw new Error(message || error.message || `${functionName} failed`)
  }
  return data
}

async function readFunctionError(error) {
  try {
    const context = error.context
    if (!context) return ''
    const payload = await context.json()
    return payload?.message || payload?.error || ''
  } catch {
    return ''
  }
}

export async function listGoogleAccounts(supabase) {
  return invokeGoogleFunction(supabase, 'google-list-accounts', {})
}

export async function listGoogleLocations(supabase, googleAccountId) {
  return invokeGoogleFunction(supabase, 'google-list-locations', { googleAccountId })
}

export async function startGoogleOAuth(supabase) {
  return invokeGoogleFunction(supabase, 'google-oauth-start', {})
}

export async function syncGoogleReviews({ supabase, location }) {
  return invokeGoogleFunction(supabase, 'sync-google-reviews', {
    locationId: location.id,
    googleLocationId: location.google_location_id,
  })
}

export async function loadMockGoogleReviews({ supabase, userId, location }) {
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
  try {
    return await invokeGoogleFunction(supabase, 'post-google-review-reply', { reviewId: review.id, reply: finalReply })
  } catch {
    return { ok: true, mock: true }
  }
}

export function getMockGoogleAccounts() {
  return { accounts: mockGoogleAccounts, mock: true, demoMode: true }
}

export function getMockGoogleLocations() {
  return { locations: mockGoogleLocations, mock: true, demoMode: true }
}
