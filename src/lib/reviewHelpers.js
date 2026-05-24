export function formatDate(value) {
  if (!value) return 'No date'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function getSentiment(rating) {
  if (rating <= 2) return 'negative'
  if (rating === 3) return 'neutral'
  return 'positive'
}

export function getAverageRating(reviews) {
  if (!reviews.length) return '0.0'
  const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0)
  return (total / reviews.length).toFixed(1)
}

export function statusLabel(status) {
  if (status === 'replied') return 'Replied'
  if (status === 'draft') return 'Draft saved'
  return 'Unanswered'
}
