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
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_0.95fr]">
      <section className="hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3 font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
            <Star className="h-5 w-5" />
          </span>
          ReviewPilot AI
        </Link>
        <div>
          <p className="max-w-xl text-4xl font-semibold tracking-normal">
            Reply faster, sound human, and keep reputation work under control.
          </p>
          <p className="mt-5 max-w-lg text-indigo-100">
            The MVP workspace is ready for Supabase Auth, RLS-protected data, demo reviews, and server-side AI placeholders.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-indigo-100/70 bg-white p-6 shadow-sm shadow-indigo-50">
          <div className="mb-6">
            <p className="text-sm font-semibold text-indigo-600">Welcome</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {mode === 'login' ? 'Log in to your account' : 'Create your workspace'}
            </h1>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-xl bg-[#EEF2FF] p-1">
            {['login', 'signup'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-md px-3 py-2 text-sm font-semibold capitalize transition ${
                  mode === item ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
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
                    className="mt-2 w-full rounded-xl border border-indigo-100 px-3 py-2 outline-none focus:border-[#7C6CF6] focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Company name
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={updateField}
                    className="mt-2 w-full rounded-xl border border-indigo-100 px-3 py-2 outline-none focus:border-[#7C6CF6] focus:ring-2 focus:ring-indigo-100"
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
                className="mt-2 w-full rounded-xl border border-indigo-100 px-3 py-2 outline-none focus:border-[#7C6CF6] focus:ring-2 focus:ring-indigo-100"
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
                className="mt-2 w-full rounded-xl border border-indigo-100 px-3 py-2 outline-none focus:border-[#7C6CF6] focus:ring-2 focus:ring-indigo-100"
                minLength={6}
                required
              />
            </label>
            {error ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
            {notice ? <p className="rounded-md bg-indigo-50 p-3 text-sm text-indigo-700">{notice}</p> : null}
            <Button type="submit" className="w-full" loading={loading}>
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
