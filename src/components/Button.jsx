import clsx from 'clsx'

const variants = {
  primary:
    'bg-[#7C6CF6] text-white shadow-sm shadow-indigo-100 hover:bg-[#6F60E8] hover:text-white focus:ring-indigo-200',
  secondary:
    'border border-indigo-100 bg-white text-indigo-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-700 focus:ring-indigo-100',
  ghost: 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-indigo-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 hover:text-white focus:ring-rose-300',
}

export default function Button({
  as: Component = 'button',
  children,
  className,
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled = false,
  ...props
}) {
  const componentProps =
    Component === 'button' ? { type, disabled: disabled || loading } : {}

  return (
    <Component
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...componentProps}
      {...props}
    >
      {loading ? 'Working...' : children}
    </Component>
  )
}
