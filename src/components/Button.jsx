import clsx from 'clsx'

const variants = {
  primary: 'bg-slate-950 text-white hover:bg-slate-800 hover:text-white focus:ring-slate-400',
  secondary:
    'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-950 focus:ring-slate-300',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-300',
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
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
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
