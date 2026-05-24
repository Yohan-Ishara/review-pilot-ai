import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import Button from './Button'
import StarRating from './StarRating'
import StatusBadge from './StatusBadge'
import { formatDate, statusLabel } from '../lib/reviewHelpers'

export default function ReviewCard({ review, onGenerateReply, generating = false }) {
  const isReplied = review.status === 'replied'
  const initials = (review.reviewer_name || 'Customer')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <article className="rounded-2xl border border-indigo-100/70 bg-white p-5 shadow-sm shadow-indigo-50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EEF2FF] text-sm font-semibold text-[#7C6CF6] ring-1 ring-indigo-100">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-base font-semibold text-slate-950">{review.reviewer_name}</h3>
              <StarRating rating={review.rating} />
              <StatusBadge status={review.status}>{statusLabel(review.status)}</StatusBadge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{formatDate(review.review_date)}</p>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">{review.comment}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          {onGenerateReply ? (
            <Button
              variant="secondary"
              onClick={() => onGenerateReply(review)}
              loading={generating}
              disabled={isReplied}
            >
              <MessageSquare className="h-4 w-4" />
              Reply
            </Button>
          ) : null}
          <Button as={Link} to={`/reviews/${review.id}`} variant="ghost">
            Open
          </Button>
        </div>
      </div>
      {review.ai_reply || review.final_reply ? (
        <div className="mt-4 rounded-2xl border border-indigo-100 bg-[#F5F3FF]/70 p-4 text-sm leading-6 text-slate-600">
          {review.final_reply || review.ai_reply}
        </div>
      ) : null}
    </article>
  )
}
