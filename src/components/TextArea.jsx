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
          'min-h-36 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100',
          className,
        )}
        {...props}
      />
    </label>
  )
}
