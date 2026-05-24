import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Send, Sparkles } from 'lucide-react'
import AiReplyCard from '../components/AiReplyCard'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import StarRating from '../components/StarRating'
import StatusBadge from '../components/StatusBadge'
import TextArea from '../components/TextArea'
import { postGoogleReplyWithFallback } from '../lib/googleApi'
import { generateReviewReplyWithFallback } from '../lib/mockAi'
import { formatDate, statusLabel } from '../lib/reviewHelpers'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

export default function ReviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile()
  const [review, setReview] = useState(null)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReview() {
      setLoading(true)
      const { data, error: reviewError } = await supabase
        .from('reviews')
        .select('*, business_locations(name)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (reviewError) setError(reviewError.message)
      setReview(data)
      setReply(data?.final_reply || data?.ai_reply || '')
      setLoading(false)
    }

    loadReview()
  }, [id, user.id])

  async function generateReply() {
    setGenerating(true)
    setError('')
    const businessName = review?.business_locations?.name || profile?.company_name || 'our business'
    const preferredTone = localStorage.getItem('reviewpilot_default_tone') || 'professional'

    try {
      const generatedReply = await generateReviewReplyWithFallback({
        supabase,
        reviewText: review.comment,
        rating: review.rating,
        businessName,
        preferredTone,
      })
      setReply(generatedReply)
      const { data: updated, error: updateError } = await supabase
        .from('reviews')
        .update({ ai_reply: generatedReply, status: 'draft' })
        .eq('id', review.id)
        .eq('user_id', user.id)
        .select('*, business_locations(name)')
        .single()

      if (updateError) throw updateError
      setReview(updated)
    } catch (replyError) {
      setError(replyError.message)
    } finally {
      setGenerating(false)
    }
  }

  async function saveReply() {
    setSaving(true)
    setError('')
    try {
      const { data, error: updateError } = await supabase
        .from('reviews')
        .update({ final_reply: reply, status: 'draft' })
        .eq('id', review.id)
        .eq('user_id', user.id)
        .select('*, business_locations(name)')
        .single()

      if (updateError) throw updateError
      setReview(data)
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSaving(false)
    }
  }

  async function markReplied() {
    setSaving(true)
    setError('')
    try {
      const { data, error: updateError } = await supabase
        .from('reviews')
        .update({ final_reply: reply, status: 'replied' })
        .eq('id', review.id)
        .eq('user_id', user.id)
        .select('*, business_locations(name)')
        .single()

      if (updateError) throw updateError
      setReview(data)
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSaving(false)
    }
  }

  async function postReplyToGoogle() {
    if (!review.final_reply) return

    setPosting(true)
    setError('')
    setMessage('')

    try {
      const result = await postGoogleReplyWithFallback({
        supabase,
        review,
        finalReply: review.final_reply,
      })

      if (!result.ok) throw new Error(result.error || 'Google reply post failed.')

      if (result.review) {
        setReview(result.review)
      } else {
        const { data, error: updateError } = await supabase
          .from('reviews')
          .update({ status: 'replied' })
          .eq('id', review.id)
          .eq('user_id', user.id)
          .select('*, business_locations(name)')
          .single()

        if (updateError) throw updateError
        setReview(data)
      }

      setMessage(result.mock ? 'Mock Google reply posted and review marked replied.' : 'Reply posted to Google.')
    } catch (postError) {
      setError(postError.message)
    } finally {
      setPosting(false)
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading review...</p>
  if (!review) {
    return (
      <div>
        <Button variant="ghost" onClick={() => navigate('/reviews')}>
          <ArrowLeft className="h-4 w-4" />
          Back to reviews
        </Button>
        <p className="mt-6 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          {error || 'Review not found.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Review detail"
        description="Edit the AI draft, save it, mark it replied, or post it through the Google Edge Function."
        actions={
          <Button as={Link} to="/reviews" variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />
      {error ? <p className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="mb-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-2xl border border-indigo-100/70 bg-white p-5 shadow-sm shadow-indigo-50">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-950">{review.reviewer_name}</h2>
            <StarRating rating={review.rating} />
            <StatusBadge status={review.status}>
              {statusLabel(review.status)}
            </StatusBadge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {review.business_locations?.name || 'Selected location'} · {formatDate(review.review_date)}
          </p>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">{review.comment}</p>
        </section>

        <section className="rounded-2xl border border-indigo-100/70 bg-white p-5 shadow-sm shadow-indigo-50">
          <AiReplyCard
            reply={reply}
            onRegenerate={generateReply}
            regenerating={generating}
            onUseReply={saveReply}
            useLabel="Use Reply"
          />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Edit reply</h2>
            <Button variant="secondary" onClick={generateReply} loading={generating}>
              <Sparkles className="h-4 w-4" />
              Generate Reply
            </Button>
          </div>
          <TextArea
            label="AI generated reply"
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Generate or write a reply..."
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={saveReply} loading={saving} disabled={!reply.trim()}>
              Save Reply
            </Button>
            <Button variant="secondary" onClick={markReplied} loading={saving} disabled={!reply.trim()}>
              <CheckCircle className="h-4 w-4" />
              Mark as Replied
            </Button>
            <Button variant="secondary" onClick={postReplyToGoogle} loading={posting} disabled={!review.final_reply}>
              <Send className="h-4 w-4" />
              Post Reply to Google
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}
