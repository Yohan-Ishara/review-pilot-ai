import { useEffect, useState } from 'react'
import { AlertTriangle, MessageCircle, Star, TrendingUp } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import ReviewCard from '../components/ReviewCard'
import StatCard from '../components/StatCard'
import { getAverageRating } from '../lib/reviewHelpers'
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
  const negative = reviews.filter((review) => review.rating <= 2)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick read on your reputation health and response workload."
      />
      {error ? <p className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average rating" value={getAverageRating(reviews)} helper="Across all loaded reviews" icon={Star} />
        <StatCard label="Total reviews" value={reviews.length} helper="Synced or demo reviews" icon={MessageCircle} />
        <StatCard label="Unanswered" value={unanswered.length} helper="Need a drafted reply" icon={TrendingUp} />
        <StatCard label="Negative reviews" value={negative.length} helper="1-2 star reviews" icon={AlertTriangle} />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Recent reviews</h2>
        {loading ? <p className="text-sm text-slate-500">Loading reviews...</p> : null}
        {!loading && reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="Open Reviews and load demo reviews to explore the MVP without Google Business Profile approval."
          />
        ) : (
          <div className="grid gap-4">
            {reviews.slice(0, 5).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
