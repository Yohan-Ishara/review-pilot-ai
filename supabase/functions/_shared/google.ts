import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function decodeBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

function encodeBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
}

async function getTokenKey(usages: KeyUsage[]) {
  const secret = Deno.env.get('GOOGLE_CLIENT_SECRET') || ''
  const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return crypto.subtle.importKey('raw', keyHash, 'AES-GCM', false, usages)
}

export async function encryptToken(token: string) {
  const key = await getTokenKey(['encrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(token))
  return `${encodeBase64(iv)}:${encodeBase64(new Uint8Array(encrypted))}`
}

export async function decryptToken(value: string | null) {
  if (!value) return ''
  const [ivValue, encryptedValue] = value.split(':')
  if (!ivValue || !encryptedValue) return ''

  const key = await getTokenKey(['decrypt'])
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decodeBase64(ivValue) },
    key,
    decodeBase64(encryptedValue),
  )
  return new TextDecoder().decode(decrypted)
}

export function getUserClient(req: Request) {
  const authorization = req.headers.get('Authorization') || ''
  return createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_ANON_KEY') || '', {
    global: { headers: { Authorization: authorization } },
  })
}

export async function getAuthenticatedUser(req: Request) {
  const supabase = getUserClient(req)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function getGoogleConnection(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase
    .from('google_connections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getAccessToken(supabase: ReturnType<typeof createClient>, connection: any) {
  if (!connection) return ''

  const hasValidAccessToken = connection.expires_at && new Date(connection.expires_at).getTime() > Date.now() + 60_000
  if (hasValidAccessToken) return decryptToken(connection.access_token_encrypted)

  const refreshToken = await decryptToken(connection.refresh_token_encrypted)
  if (!refreshToken) return decryptToken(connection.access_token_encrypted)

  const clientId = Deno.env.get('GOOGLE_CLIENT_ID') || ''
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') || ''
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error_description || data.error || 'Google token refresh failed')

  const expiresAt = new Date(Date.now() + Number(data.expires_in || 3600) * 1000).toISOString()
  await supabase
    .from('google_connections')
    .update({
      access_token_encrypted: await encryptToken(data.access_token),
      expires_at: expiresAt,
      scope: data.scope || connection.scope,
    })
    .eq('id', connection.id)

  return data.access_token
}

export async function googleJson(url: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error?.message || data.error_description || data.error || 'Google API request failed')
  return data
}

export function mockAccounts() {
  return [
    { google_account_id: 'accounts/mock-local-services', google_account_name: 'Mock Local Services Group' },
    { google_account_id: 'accounts/mock-agency-client', google_account_name: 'Mock Agency Client Account' },
  ]
}

export function mockLocations() {
  return [
    { google_location_id: 'locations/mock-downtown', google_location_name: 'Downtown Service Center', address: '123 Market Street' },
    { google_location_id: 'locations/mock-westside', google_location_name: 'Westside Branch', address: '42 Sunset Avenue' },
  ]
}
