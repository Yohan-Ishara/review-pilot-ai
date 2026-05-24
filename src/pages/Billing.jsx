import { Check } from 'lucide-react'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    features: ['1 location', '100 AI reply drafts', 'Basic analytics'],
  },
  {
    name: 'Pro',
    price: '$79',
    features: ['5 locations', '500 AI reply drafts', 'Priority alerts'],
  },
  {
    name: 'Agency',
    price: '$199',
    features: ['25 locations', '2,500 AI reply drafts', 'Client-ready reporting'],
  },
]

export default function Billing() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Pricing UI placeholder. Stripe checkout should be added through a Supabase Edge Function."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <section key={plan.name} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">{plan.name}</h2>
            <p className="mt-3 text-4xl font-bold text-slate-950">
              {plan.price}
              <span className="text-base font-medium text-slate-500">/month</span>
            </p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="mt-6 w-full" variant={plan.name === 'Pro' ? 'primary' : 'secondary'}>
              Choose {plan.name}
            </Button>
          </section>
        ))}
      </div>
      <p className="mt-5 rounded-md bg-sky-50 p-4 text-sm text-sky-800">
        TODO: Create a Supabase Edge Function that uses STRIPE_SECRET_KEY to create Checkout Sessions. Do not call Stripe secret APIs from the Vite frontend.
      </p>
    </>
  )
}
