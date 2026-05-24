import { useCallback, useEffect, useMemo, useState } from 'react'
import { CloudDownload, Database, RefreshCw } from 'lucide-react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import ReviewCard from '../components/ReviewCard'
import { demoReviews } from '../lib/demoReviews'
import { loadMockGoogleReviews, syncGoogleReviews as syncGoogleReviewsFromGoogle } from '../lib/googleApi'
import { generateReviewReplyWithFallback } from '../lib/mockAi'
import { getSentiment } from '../lib/reviewHelpers'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'unanswered', label: 'Unanswered' },
  { key: 'negative', label: '1-2 star' },
  { key: 'five', label: '5 star' },
]

export default function Reviews() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [reviews, setReviews] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [generatingId, setGeneratingId] = useState('')
  const [lastSyncStatus, setLastSyncStatus] = useState('')
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [{ data: locationRows, error: locationError }, { data: reviewRows, error: reviewError }] =
        await Promise.all([
          supabase
            .from('business_locations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true }),
          supabase
            .from('reviews')
            .select('*')
            .eq('user_id', user.id)
            .order('review_date', { ascending: false }),
        ])

      if (locationError || reviewError) throw locationError || reviewError
      setLocations(locationRows || [])
      setReviews(reviewRows || [])
      setSelectedLocation((current) => {
        if (!current) return locationRows?.[0]?.id || ''
        return locationRows?.some((location) => location.id === current) ? current : locationRows?.[0]?.id || ''
      })
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const locationMatch = selectedLocation ? review.location_id === selectedLocation : true
      if (!locationMatch) return false
      if (activeFilter === 'unanswered') return review.status !== 'replied'
      if (activeFilter === 'negative') return review.rating <= 2
      if (activeFilter === 'five') return review.rating === 5
      return true
    })
  }, [activeFilter, reviews, selectedLocation])

  async function ensureLocation() {
    if (selectedLocation) return selectedLocation
    const { data, error: locationError } = await supabase
      .from('business_locations')
      .insert({
        user_id: user.id,
        name: profile?.company_name || 'Demo Business',
        address: '123 Main Street',
        google_location_id: 'demo-location',
      })
      .select()
      .single()

    if (locationError) throw locationError
    setLocations((current) => [...current, data])
    setSelectedLocation(data.id)
    return data.id
  }

  async function loadDemoReviews() {
    setSaving(true)
    setError('')
    try {
      const locationId = await ensureLocation()
      const rows = demoReviews.map((review, index) => ({
        ...review,
        user_id: user.id,
        location_id: locationId,
        google_review_id: `demo-${Date.now()}-${index}`,
        status: 'new',
        sentiment: review.sentiment || getSentiment(review.rating),
      }))

      const { error: insertError } = await supabase.from('reviews').insert(rows)
      if (insertError) throw insertError
      await loadData()
    } catch (demoError) {
      setError(demoError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSyncGoogleReviews() {
    const location = locations.find((item) => item.id === selectedLocation)

    if (!location) {
      setError('Select a location before syncing Google reviews.')
      return
    }

    setSyncing(true)
    setError('')
    setLastSyncStatus('')

    try {
      const result = await syncGoogleReviewsFromGoogle({ supabase, location })
      setLastSyncStatus(
        `Google sync completed: ${result.synced || 0} reviews.`,
      )
      await loadData()
    } catch (syncError) {
      setError(syncError.message || 'Google review sync failed. Confirm this location is linked to a verified Google Business Profile.')
    } finally {
      setSyncing(false)
    }
  }

  async function loadDemoModeReviews() {
    const location = locations.find((item) => item.id === selectedLocation)

    setSaving(true)
    setError('')

    try {
      const targetLocation = location || { id: await ensureLocation() }
      const result = await loadMockGoogleReviews({ supabase, userId: user.id, location: targetLocation })
      setLastSyncStatus(`Demo Mode loaded ${result.synced || 0} mock Google reviews.`)
      await loadData()
    } catch (demoError) {
      setError(demoError.message)
    } finally {
      setSaving(false)
    }
  }

  async function generateReply(review) {
    setGeneratingId(review.id)
    setError('')
    const businessName = profile?.company_name || locations.find((item) => item.id === review.location_id)?.name || 'our business'
    const preferredTone = localStorage.getItem('reviewpilot_default_tone') || 'professional'

    try {
      const reply = await generateReviewReplyWithFallback({
        supabase,
        reviewText: review.comment,
        rating: review.rating,
        businessName,
        preferredTone,
      })
      const { data: updated, error: updateError } = await supabase
        .from('reviews')
        .update({ ai_reply: reply, status: 'draft' })
        .eq('id', review.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError
      setReviews((current) => current.map((item) => (item.id === review.id ? updated : item)))
    } catch (replyError) {
      setError(replyError.message)
    } finally {
      setGeneratingId('')
    }
  }

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Filter reviews, generate AI replies, and keep unanswered work moving."
        actions={
          <>
            <Button variant="secondary" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="secondary" onClick={handleSyncGoogleReviews} loading={syncing} disabled={!selectedLocation}>
              <CloudDownload className="h-4 w-4" />
              Sync Google Reviews
            </Button>
            <Button onClick={loadDemoReviews} loading={saving}>
              <Database className="h-4 w-4" />
              Demo Mode Reviews
            </Button>
            <Button variant="secondary" onClick={loadDemoModeReviews} loading={saving}>
              Demo Mode
            </Button>
          </>
        }
      />

      {error ? <p className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {lastSyncStatus ? <p className="mb-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{lastSyncStatus}</p> : null}

      <div className="mb-5 grid gap-3 rounded-2xl border border-indigo-100/70 bg-white p-4 shadow-sm shadow-indigo-50 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="block text-sm font-semibold text-slate-700">
          Filter reviews
          <select
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
            className="mt-2 w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#7C6CF6] focus:ring-2 focus:ring-indigo-100"
          >
            {filters.map((filter) => (
              <option key={filter.key} value={filter.key}>{filter.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Business location
        <select
          value={selectedLocation}
          onChange={(event) => setSelectedLocation(event.target.value)}
            className="mt-2 w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#7C6CF6] focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        </label>
        <Button variant="secondary" onClick={handleSyncGoogleReviews} loading={syncing} disabled={!selectedLocation}>
          <CloudDownload className="h-4 w-4" />
          Sync Reviews
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Badge tone="blue">{filteredReviews.length} shown</Badge>
        <Badge tone="gray">{reviews.length} total</Badge>
        <Badge tone="yellow">Demo data requires Demo Mode</Badge>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading reviews...</p> : null}
      {!loading && filteredReviews.length === 0 ? (
        <EmptyState
          title="No matching reviews"
          description="Load demo reviews or change filters to populate this workspace."
          action={<Button onClick={loadDemoReviews}>Demo Mode Reviews</Button>}
        />
      ) : (
        <div className="grid gap-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onGenerateReply={generateReply}
              generating={generatingId === review.id}
            />
          ))}
        </div>
      )}
    </>
  )
}
