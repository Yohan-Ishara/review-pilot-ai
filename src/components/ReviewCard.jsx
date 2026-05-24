import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import Badge from './Badge'
import Button from './Button'
import { formatDate, statusLabel } from '../lib/reviewHelpers'

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < rating ? '★' : '☆'}</span>
      ))}
    </div>
  )
}

export default function ReviewCard({ review, onGenerateReply, generating = false }) {
  const isNegative = review.rating <= 2
  const isReplied = review.status === 'replied'

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-slate-950">{review.reviewer_name}</h3>
            <Stars rating={review.rating} />
            <Badge tone={isReplied ? 'green' : isNegative ? 'red' : 'yellow'}>
              {statusLabel(review.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">{formatDate(review.review_date)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onGenerateReply ? (
            <Button
              variant="secondary"
              onClick={() => onGenerateReply(review)}
              loading={generating}
              disabled={isReplied}
            >
              <MessageSquare className="h-4 w-4" />
              Generate Reply
            </Button>
          ) : null}
          <Link
            to={`/reviews/${review.id}`}
            className="inline-flex min-h-10 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Open
          </Link>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-700">{review.comment}</p>
      {review.ai_reply || review.final_reply ? (
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          {review.final_reply || review.ai_reply}
        </div>
      ) : null}
    </article>
  )
}
