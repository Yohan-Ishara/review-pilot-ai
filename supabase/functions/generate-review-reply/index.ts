import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Payload = {
  reviewText?: string
  rating?: number
  businessName?: string
  preferredTone?: 'professional' | 'friendly' | 'apologetic' | 'grateful'
}

function fallbackReply({ reviewText, rating, businessName, preferredTone }: Payload) {
  const name = businessName || 'our business'
  const tone = preferredTone || 'professional'

  if ((rating || 0) <= 2) {
    return `Thank you for sharing this feedback. We are sorry your experience with ${name} did not meet expectations. We appreciate the chance to understand what happened and would like to discuss this offline so our team can look into it directly.`
  }

  if (tone === 'friendly') {
    return `Thank you so much for the kind words. We are happy to hear you had a great experience with ${name}, and we truly appreciate you taking the time to share your review. We hope to see you again soon.`
  }

  if (reviewText && reviewText.length < 30) {
    return `Thank you for your review. We appreciate your support and are glad you chose ${name}.`
  }

  return `Thank you for taking the time to leave a review. We are glad you had a positive experience with ${name}, and we appreciate your support. We look forward to serving you again.`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = (await req.json()) as Payload
    const apiKey = Deno.env.get('AI_API_KEY')

    if (!payload.reviewText || !payload.rating) {
      return new Response(JSON.stringify({ error: 'reviewText and rating are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // TODO: Integrate OpenAI or Gemini here using AI_API_KEY.
    // Keep this server-side so API keys are never exposed to the Vite frontend.
    // Suggested prompt constraints:
    // - max 100 words
    // - do not overpromise
    // - for negative reviews, acknowledge issue and invite offline contact
    // - for positive reviews, thank customer naturally
    if (apiKey) {
      // Placeholder: replace fallbackReply with a real provider call.
    }

    return new Response(JSON.stringify({ reply: fallbackReply(payload) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
