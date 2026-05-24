import { BarChart3, MessageCircle, Star, TrendingUp } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'

export default function Analytics() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Simple reputation insights placeholder for the Phase 1 MVP."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average Rating" value="4.6" helper="Demo insight" icon={Star} />
        <StatCard label="Total Reviews" value="128" helper="Demo insight" icon={MessageCircle} />
        <StatCard label="Reply Rate" value="82%" helper="Demo insight" icon={TrendingUp} />
        <StatCard label="Review Velocity" value="+18" helper="This month" icon={BarChart3} />
      </div>
      <section className="mt-6 rounded-2xl border border-indigo-100/70 bg-white p-6 shadow-sm shadow-indigo-50">
        <h2 className="text-lg font-semibold text-slate-950">Performance Insights</h2>
        <p className="mt-2 text-sm text-slate-500">A fuller reporting view can be added after real Google review sync is active.</p>
        <div className="mt-6 h-72 rounded-2xl bg-gradient-to-t from-[#F5F3FF] to-white p-6">
          <svg viewBox="0 0 520 180" className="h-full w-full" aria-hidden="true">
            <path d="M8 136 C58 142 78 82 126 94 S204 118 246 76 318 74 356 96 426 116 512 48" fill="none" stroke="#7C6CF6" strokeWidth="6" strokeLinecap="round" />
            <path d="M8 136 C58 142 78 82 126 94 S204 118 246 76 318 74 356 96 426 116 512 48 V180 H8 Z" fill="rgba(124,108,246,0.08)" />
          </svg>
        </div>
      </section>
    </>
  )
}
