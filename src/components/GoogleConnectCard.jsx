import { Link2 } from 'lucide-react'
import PrimaryButton from './PrimaryButton'
import StatusBadge from './StatusBadge'

export default function GoogleConnectCard({ connected = false, onConnect, loading = false }) {
  return (
    <section className="rounded-2xl border border-indigo-100/70 bg-white p-6 shadow-sm shadow-indigo-50">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl font-semibold text-[#7C6CF6] shadow-sm shadow-indigo-100">
            G
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-950">Connect Google Business</h2>
              <StatusBadge status={connected ? 'connected' : 'disconnected'}>
                {connected ? 'Connected' : 'Not connected'}
              </StatusBadge>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Securely connect your Google Business Profile and start managing reviews.
            </p>
          </div>
        </div>
        <PrimaryButton onClick={onConnect} loading={loading}>
          <Link2 className="h-4 w-4" />
          Connect Google
        </PrimaryButton>
      </div>
    </section>
  )
}
