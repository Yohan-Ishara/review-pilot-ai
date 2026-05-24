export default function StatCard({ label, value, helper, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-indigo-100/70 bg-white p-5 shadow-sm shadow-indigo-50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        {Icon ? (
          <div className="rounded-xl bg-[#EEF2FF] p-2.5 text-[#7C6CF6]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
      {helper ? <p className="mt-3 text-sm text-slate-500">{helper}</p> : null}
    </div>
  )
}
