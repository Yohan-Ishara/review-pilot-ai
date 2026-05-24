export default function PreviewCard({ icon: Icon, title, description, children }) {
  return (
    <article className="rounded-2xl border border-indigo-100/70 bg-white p-5 shadow-sm shadow-indigo-50">
      {Icon ? (
        <div className="mb-4 inline-flex rounded-xl bg-[#EEF2FF] p-3 text-[#7C6CF6]">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  )
}
