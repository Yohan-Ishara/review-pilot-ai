import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Cloud,
  LayoutDashboard,
  LineChart,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Button from '../components/Button'
import PreviewCard from '../components/PreviewCard'
import PrimaryButton from '../components/PrimaryButton'
import StarRating from '../components/StarRating'
import StatusBadge from '../components/StatusBadge'
import heroImage from '../assets/hero.png'

const previews = [
  [LayoutDashboard, 'Dashboard preview', 'Track rating, unanswered reviews, and reputation health at a glance.'],
  [MessageSquareText, 'Reviews preview', 'Filter reviews, sync Google, and manage every response workflow.'],
  [Bot, 'AI Reply preview', 'Generate polished, on-brand replies in seconds.'],
  [LineChart, 'Performance Insights preview', 'Spot trends before they become reputation problems.'],
  [Cloud, 'Connect Google preview', 'Secure Google Business Profile integration through Edge Functions.'],
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 font-semibold">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#7C6CF6] text-white shadow-md shadow-indigo-100">
            <Sparkles className="h-5 w-5" />
          </span>
          ReviewPilot AI
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">
            Login
          </Link>
          <PrimaryButton as={Link} to="/login" className="hidden sm:inline-flex">
            Try Demo
          </PrimaryButton>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 text-white">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(124,108,246,0.24),transparent_30%),radial-gradient(circle_at_78%_32%,rgba(238,242,255,0.12),transparent_26%)]" />
          <div className="relative mx-auto grid min-h-[600px] max-w-7xl content-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
            <div>
              <p className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-violet-100 ring-1 ring-white/15">
                AI review replies for local businesses
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl">
                AI-Powered Google Review Management Made Simple
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-indigo-100">
                Automate replies. Improve reputation. Grow your business.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <PrimaryButton as={Link} to="/login" className="!bg-white !text-indigo-700 hover:!bg-indigo-50 hover:!text-indigo-800">
                  Try Demo
                  <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
                <Button as={Link} to="/login" variant="secondary" className="!border-white/20 !bg-white/10 !text-white hover:!bg-white/15 hover:!text-white">
                  Connect Google
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/95 p-6 text-slate-950 shadow-xl shadow-slate-950/10">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-5">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Today</p>
                  <p className="text-2xl font-semibold">4.7 avg rating</p>
                </div>
                <StatusBadge status="connected">+18 reviews</StatusBadge>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  ['Maya Chen', 5, 'Fast, friendly, and easy to work with.'],
                  ['Luis Romero', 1, 'My appointment was delayed without updates.'],
                  ['Jordan Miller', 4, 'Good service and professional staff.'],
                ].map(([name, rating, text]) => (
                  <div key={name} className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm shadow-indigo-50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{name}</p>
                      <StarRating rating={rating} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
          {previews.map(([Icon, title, text]) => (
            <PreviewCard key={title} icon={Icon} title={title} description={text} />
          ))}
        </section>

        <section className="border-t border-indigo-100 bg-white py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Built for beta operators</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-normal">A reputation workspace your clients can trust.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [ShieldCheck, 'Secrets stay server-side'],
                [Bot, 'Gemini AI replies'],
                [BarChart3, 'Simple analytics'],
              ].map(([Icon, title]) => (
                <div key={title} className="rounded-2xl border border-indigo-100 bg-[#F5F3FF]/60 p-5">
                  <Icon className="h-5 w-5 text-[#7C6CF6]" />
                  <p className="mt-3 font-semibold text-slate-950">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
