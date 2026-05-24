import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'

export default function LoginSignup() {
  const { signIn, signUp, user, isConfigured } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  if (user) return <Navigate to={from} replace />

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!isConfigured) {
      setError('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to run authentication.')
      return
    }

    setLoading(true)
    const result =
      mode === 'login'
        ? await signIn(form.email, form.password)
        : await signUp(form.email, form.password, {
            full_name: form.fullName,
            company_name: form.companyName,
          })

    setLoading(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    if (mode === 'signup' && !result.data.session) {
      setNotice('Check your email to confirm your account, then log in.')
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="grid min-h-screen bg-slate-100 lg:grid-cols-[1fr_0.95fr]">
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3 font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-sky-400 text-slate-950">
            <Star className="h-5 w-5" />
          </span>
          ReviewPilot AI
        </Link>
        <div>
          <p className="max-w-xl text-5xl font-bold tracking-normal">
            Reply faster, sound human, and keep reputation work under control.
          </p>
          <p className="mt-5 max-w-lg text-slate-300">
            The MVP workspace is ready for Supabase Auth, RLS-protected data, demo reviews, and server-side AI placeholders.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold text-sky-700">Welcome</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              {mode === 'login' ? 'Log in to your account' : 'Create your workspace'}
            </h1>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-md bg-slate-100 p-1">
            {['login', 'signup'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-md px-3 py-2 text-sm font-semibold capitalize transition ${
                  mode === item ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' ? (
              <>
                <label className="block text-sm font-semibold text-slate-700">
                  Full name
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={updateField}
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Company name
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={updateField}
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </label>
              </>
            ) : null}
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                required
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                minLength={6}
                required
              />
            </label>
            {error ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
            {notice ? <p className="rounded-md bg-sky-50 p-3 text-sm text-sky-700">{notice}</p> : null}
            <Button type="submit" className="w-full" loading={loading}>
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
