import { Link } from 'react-router-dom'
import { ArrowRight, Bot, LineChart, ShieldCheck, Star } from 'lucide-react'
import Button from '../components/Button'
import heroImage from '../assets/hero.png'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-white">
            <Star className="h-4 w-4" />
          </span>
          ReviewPilot AI
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
            Login
          </Link>
          <Button as={Link} to="/login" className="hidden !bg-slate-950 !text-white hover:!bg-slate-800 hover:!text-white sm:inline-flex">
            Start free
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-y border-slate-200 bg-slate-950 text-white">
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="relative mx-auto grid min-h-[640px] max-w-7xl content-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-sky-400 px-3 py-1 text-sm font-semibold text-slate-950">
                AI review replies for local businesses
              </p>
              <h1 className="max-w-3xl text-5xl font-bold tracking-normal sm:text-6xl">
                ReviewPilot AI
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                Monitor reviews, draft thoughtful responses, and understand reputation trends from one clean workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button as={Link} to="/login" className="!bg-white !text-slate-950 hover:!bg-slate-100 hover:!text-slate-950">
                  Launch dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button as="a" href="#pricing" variant="secondary" className="!border-white/20 !bg-white/10 !text-white hover:!bg-white/15 hover:!text-white">
                  View pricing
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/95 p-5 text-slate-950 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Today</p>
                  <p className="text-2xl font-bold">4.7 avg rating</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  +18 reviews
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  ['Maya Chen', 5, 'Fast, friendly, and easy to work with.'],
                  ['Luis Romero', 1, 'My appointment was delayed without updates.'],
                  ['Jordan Miller', 4, 'Good service and professional staff.'],
                ].map(([name, rating, text]) => (
                  <div key={name} className="rounded-md border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{name}</p>
                      <p className="text-amber-500">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            [Bot, 'Generate replies', 'Draft professional responses for positive and negative reviews in seconds.'],
            [ShieldCheck, 'Protect secrets', 'AI, Google, and Stripe secrets stay server-side in Supabase Edge Functions.'],
            [LineChart, 'Track reputation', 'See average rating, unanswered reviews, and negative review trends at a glance.'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Icon className="h-6 w-6 text-sky-700" />
              <h2 className="mt-4 text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </section>

        <section id="pricing" className="border-t border-slate-200 bg-slate-50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">Simple pricing for every local operator</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {['Starter $29/month', 'Pro $79/month', 'Agency $199/month'].map((plan) => (
                <div key={plan} className="rounded-lg border border-slate-200 bg-white p-6">
                  <p className="text-xl font-bold">{plan}</p>
                  <p className="mt-2 text-sm text-slate-600">Stripe checkout placeholder included in the app.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
