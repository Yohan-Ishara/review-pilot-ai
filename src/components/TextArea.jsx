import clsx from 'clsx'

export default function TextArea({ label, className, ...props }) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </span>
      ) : null}
      <textarea
        className={clsx(
          'min-h-36 w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-indigo-50 outline-none transition placeholder:text-slate-400 focus:border-[#7C6CF6] focus:ring-2 focus:ring-indigo-100',
          className,
        )}
        {...props}
      />
    </label>
  )
}
