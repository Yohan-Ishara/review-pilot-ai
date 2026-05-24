export function createMockReviewReply({
  reviewText = '',
  rating = 5,
  businessName = 'our business',
  preferredTone = 'professional',
}) {
  const name = businessName || 'our business'

  if (Number(rating) <= 2) {
    return `Thank you for sharing this feedback. We are sorry your experience with ${name} fell short. We appreciate the chance to understand what happened and would like to discuss this offline so our team can look into it directly.`
  }

  if (preferredTone === 'friendly') {
    return `Thank you so much for the kind words. We are happy to hear you had a great experience with ${name}, and we truly appreciate you taking the time to share it. We hope to see you again soon.`
  }

  if (preferredTone === 'grateful') {
    return `Thank you for your thoughtful review. We are grateful for your support and glad you had a positive experience with ${name}. We look forward to welcoming you back.`
  }

  if (reviewText.length < 30) {
    return `Thank you for your review. We appreciate your support and are glad you chose ${name}.`
  }

  return `Thank you for taking the time to leave a review. We are glad you had a positive experience with ${name}, and we appreciate your support. We look forward to serving you again.`
}

export async function generateReviewReplyWithFallback({
  supabase,
  reviewText,
  rating,
  businessName,
  preferredTone,
}) {
  const fallback = createMockReviewReply({
    reviewText,
    rating,
    businessName,
    preferredTone,
  })

  try {
    const { data, error } = await supabase.functions.invoke('generate-review-reply', {
      body: {
        reviewText,
        rating,
        businessName,
        preferredTone,
      },
    })

    if (error || !data?.reply) return fallback
    return data.reply
  } catch {
    return fallback
  }
}
