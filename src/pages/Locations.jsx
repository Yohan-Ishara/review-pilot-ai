import { useCallback, useEffect, useState } from 'react'
import { Link2, MapPin, Plus, RefreshCw } from 'lucide-react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import {
  getMockGoogleAccounts,
  getMockGoogleLocations,
  listGoogleAccounts,
  listGoogleLocations,
  startGoogleOAuth,
} from '../lib/googleApi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Locations() {
  const { user } = useAuth()
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ name: '', address: '', google_location_id: '' })
  const [googleAccounts, setGoogleAccounts] = useState([])
  const [googleLocations, setGoogleLocations] = useState([])
  const [selectedLocalLocationId, setSelectedLocalLocationId] = useState('')
  const [selectedGoogleAccountId, setSelectedGoogleAccountId] = useState('')
  const [selectedGoogleLocationId, setSelectedGoogleLocationId] = useState('')
  const [googleStatus, setGoogleStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const loadLocations = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error: locationError } = await supabase
        .from('business_locations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (locationError) throw locationError
      setLocations(data || [])
      setSelectedLocalLocationId((current) => current || data?.[0]?.id || '')
    } catch (locationError) {
      setError(locationError.message)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadLocations()
  }, [loadLocations])

  async function connectGoogleBusiness() {
    setGoogleLoading(true)
    setGoogleStatus('')

    const result = await startGoogleOAuth(supabase)
    if (result.authUrl) {
      window.location.assign(result.authUrl)
      return
    }

    setGoogleStatus(result.message || 'Google OAuth is not configured yet. Use Demo Mode only if you are testing.')
    setGoogleLoading(false)
  }

  async function refreshGoogleAccounts() {
    setGoogleLoading(true)
    setError('')

    try {
      const result = await listGoogleAccounts(supabase)
      setGoogleAccounts(result.accounts || [])
      setSelectedGoogleAccountId((current) => current || result.accounts?.[0]?.google_account_id || '')
      setGoogleStatus(
        result.connected === false
          ? 'No Google account connected yet. Click Connect Google Business.'
          : 'Google accounts loaded.',
      )
    } catch (accountsError) {
      setError(accountsError.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  async function refreshGoogleLocations(accountId = selectedGoogleAccountId) {
    if (!accountId) return
    setGoogleLoading(true)
    setError('')

    try {
      const result = await listGoogleLocations(supabase, accountId)
      setGoogleLocations(result.locations || [])
      setSelectedGoogleLocationId((current) => current || result.locations?.[0]?.google_location_id || '')
      setGoogleStatus(
        result.locations?.length
          ? 'Google locations loaded.'
          : 'No verified Google Business Profile locations found for this Google account. Please connect an account that manages a verified Google Business Profile.',
      )
    } catch (locationsError) {
      setError(locationsError.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  function enableDemoMode() {
    const accountsResult = getMockGoogleAccounts()
    const locationsResult = getMockGoogleLocations()
    setGoogleAccounts(accountsResult.accounts)
    setGoogleLocations(locationsResult.locations)
    setSelectedGoogleAccountId(accountsResult.accounts[0]?.google_account_id || '')
    setSelectedGoogleLocationId(locationsResult.locations[0]?.google_location_id || '')
    setGoogleStatus('Demo Mode enabled. Mock Google accounts and locations are visible for developer/admin testing.')
  }

  async function addLocation(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('business_locations').insert({
        ...form,
        user_id: user.id,
        google_location_id: form.google_location_id || null,
      })

      if (insertError) throw insertError
      setForm({ name: '', address: '', google_location_id: '' })
      await loadLocations()
    } catch (insertError) {
      setError(insertError.message)
    } finally {
      setSaving(false)
    }
  }

  async function linkGoogleLocation() {
    const localLocation = locations.find((location) => location.id === selectedLocalLocationId)
    const googleAccount = googleAccounts.find((account) => account.google_account_id === selectedGoogleAccountId)
    const googleLocation = googleLocations.find((location) => location.google_location_id === selectedGoogleLocationId)

    if (!localLocation || !googleAccount || !googleLocation) {
      setError('Select a local location, Google account, and Google location first.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('business_locations')
        .update({
          google_account_id: googleAccount.google_account_id,
          google_location_id: googleLocation.google_location_id,
          google_location_name: googleLocation.google_location_name,
          google_connected: true,
        })
        .eq('id', localLocation.id)
        .eq('user_id', user.id)

      if (updateError) throw updateError
      setGoogleStatus(`${localLocation.name} linked to ${googleLocation.google_location_name}.`)
      await loadLocations()
    } catch (linkError) {
      setError(linkError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Locations"
        description="Add locations and prepare Google Business Profile linking without exposing Google secrets."
        actions={
          <Button onClick={connectGoogleBusiness} loading={googleLoading}>
            <Link2 className="h-4 w-4" />
            Connect Google Business
          </Button>
        }
      />
      {error ? <p className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {googleStatus ? <p className="mb-4 rounded-md bg-sky-50 p-3 text-sm text-sky-800">{googleStatus}</p> : null}

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={addLocation} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Add location</h2>
          <div className="mt-4 space-y-4">
            {[
              ['name', 'Business name', true],
              ['address', 'Address', true],
              ['google_location_id', 'Google location ID', false],
            ].map(([name, label, required]) => (
              <label key={name} className="block text-sm font-semibold text-slate-700">
                {label}
                <input
                  name={name}
                  value={form[name]}
                  onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  required={required}
                />
              </label>
            ))}
          </div>
          <Button type="submit" className="mt-5" loading={saving}>
            <Plus className="h-4 w-4" />
            Add location
          </Button>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Connected locations</h2>
          {loading ? <p className="mt-4 text-sm text-slate-500">Loading locations...</p> : null}
          {!loading && locations.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No locations yet" description="Add a location or load demo reviews from the Reviews page." />
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {locations.map((location) => (
                <div key={location.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-sky-700" />
                    <div>
                      <p className="font-semibold text-slate-950">{location.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{location.address}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone={location.google_connected ? 'green' : 'gray'}>
                          {location.google_connected ? 'Google connected' : 'Not connected'}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {location.google_location_name || location.google_location_id || 'No Google location linked'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Google Business Profile</h2>
            <p className="mt-1 text-sm text-slate-600">
              OAuth and API calls run through Supabase Edge Functions. Demo data is available only through Demo Mode.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={refreshGoogleAccounts} loading={googleLoading}>
              <RefreshCw className="h-4 w-4" />
              List Accounts
            </Button>
            <Button variant="secondary" onClick={() => refreshGoogleLocations()} loading={googleLoading} disabled={!selectedGoogleAccountId}>
              <MapPin className="h-4 w-4" />
              List Locations
            </Button>
            <Button variant="secondary" onClick={enableDemoMode}>
              Demo Mode
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <label className="block text-sm font-semibold text-slate-700">
            Local business location
            <select
              value={selectedLocalLocationId}
              onChange={(event) => setSelectedLocalLocationId(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Select local location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Google account
            <select
              value={selectedGoogleAccountId}
              onChange={(event) => {
                setSelectedGoogleAccountId(event.target.value)
                setGoogleLocations([])
                setSelectedGoogleLocationId('')
              }}
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Select Google account</option>
              {googleAccounts.map((account) => (
                <option key={account.google_account_id} value={account.google_account_id}>
                  {account.google_account_name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Google location
            <select
              value={selectedGoogleLocationId}
              onChange={(event) => setSelectedGoogleLocationId(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Select Google location</option>
              {googleLocations.map((location) => (
                <option key={location.google_location_id} value={location.google_location_id}>
                  {location.google_location_name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Button className="mt-4" onClick={linkGoogleLocation} loading={saving}>
          Link Google Location
        </Button>
      </section>
    </>
  )
}
