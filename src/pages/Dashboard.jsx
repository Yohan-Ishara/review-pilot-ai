import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Star, TrendingUp, WandSparkles } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StarRating from '../components/StarRating'
import StatusBadge from '../components/StatusBadge'
import { formatDate, getAverageRating, statusLabel } from '../lib/reviewHelpers'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReviews() {
      setLoading(true)
      setError('')

      try {
        const { data, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('review_date', { ascending: false })

        if (reviewsError) throw reviewsError
        setReviews(data || [])
      } catch (reviewsError) {
        setError(reviewsError.message)
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [user.id])

  const unanswered = reviews.filter((review) => review.status !== 'replied')
  const newReviews = reviews.filter((review) => review.status === 'new')
  const chartBars = useMemo(() => {
    const values = reviews.slice(0, 8).reverse()
    return values.length ? values : Array.from({ length: 8 }, (_, index) => ({ id: index, rating: index % 3 === 0 ? 3 : 4 }))
  }, [reviews])

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your Google reviews, reply workload, and reputation trend."
      />
      {error ? <p className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average Rating" value={getAverageRating(reviews)} helper="Across all reviews" icon={Star} />
        <StatCard label="Total Reviews" value={reviews.length} helper="Synced or demo reviews" icon={MessageCircle} />
        <StatCard label="New Reviews" value={newReviews.length} helper="Fresh review activity" icon={WandSparkles} />
        <StatCard label="Unanswered Reviews" value={unanswered.length} helper="Need a reply draft" icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-indigo-100/70 bg-white p-5 shadow-sm shadow-indigo-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Rating trend</h2>
              <p className="mt-1 text-sm text-slate-500">Recent review ratings over time.</p>
            </div>
            <StatusBadge status="draft">Live preview</StatusBadge>
          </div>
          <div className="mt-6 flex h-56 items-end gap-3 rounded-2xl bg-gradient-to-t from-[#F5F3FF] to-white p-5">
            {chartBars.map((review, index) => (
              <div key={review.id || index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-[#7C6CF6]/80 shadow-sm shadow-indigo-100"
                  style={{ height: `${Math.max(18, (Number(review.rating) / 5) * 150)}px` }}
                />
                <span className="text-xs font-medium text-slate-400">{index + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-indigo-100/70 bg-white p-5 shadow-sm shadow-indigo-50">
          <h2 className="text-lg font-semibold text-slate-950">Recent reviews</h2>
          {loading ? <p className="mt-4 text-sm text-slate-500">Loading reviews...</p> : null}
          {!loading && reviews.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No reviews yet"
                description="Open Reviews and load Demo Mode reviews to explore the MVP without Google Business Profile approval."
              />
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#EEF2FF] text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  <tr>
                    <th className="px-4 py-3">Reviewer</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {reviews.slice(0, 6).map((review) => (
                    <tr key={review.id} className="bg-white">
                      <td className="px-4 py-3 font-semibold text-slate-900">{review.reviewer_name}</td>
                      <td className="px-4 py-3"><StarRating rating={review.rating} /></td>
                      <td className="px-4 py-3"><StatusBadge status={review.status}>{statusLabel(review.status)}</StatusBadge></td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(review.review_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
