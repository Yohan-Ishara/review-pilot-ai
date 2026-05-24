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

function buildPrompt({ reviewText, rating, businessName, preferredTone }: Payload) {
  const tone = preferredTone || 'professional'
  const name = businessName || 'the business'

  return `
Write a short public reply to a Google review for a local business.

Business name: ${name}
Preferred tone: ${tone}
Rating: ${rating}/5
Review text: ${reviewText}

Rules:
- Maximum 100 words.
- Sound natural and human.
- Do not overpromise.
- Do not mention discounts, refunds, legal issues, or private customer data.
- For 1-2 star reviews, acknowledge the issue and invite the customer to contact the business offline.
- For 5 star reviews, thank the customer naturally.
- Return only the reply text, with no labels or markdown.
`.trim()
}

function extractGeminiText(data: any) {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || '')
    .join('')
    .trim()
}

async function generateWithGemini(payload: Payload, apiKey: string) {
  const model = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash'
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(payload) }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 160,
        },
      }),
    },
  )

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error?.message || data.error || 'Gemini request failed')
  }

  const reply = extractGeminiText(data)
  if (!reply) throw new Error('Gemini returned an empty reply')
  return reply.split(/\s+/).slice(0, 100).join(' ')
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

    if (apiKey) {
      try {
        const reply = await generateWithGemini(payload, apiKey)
        return new Response(JSON.stringify({ reply, provider: 'gemini', mock: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (geminiError) {
        console.error('Gemini reply generation failed:', geminiError.message)
      }
    }

    return new Response(JSON.stringify({ reply: fallbackReply(payload), provider: 'fallback', mock: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
