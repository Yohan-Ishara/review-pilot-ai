import { useEffect, useState } from 'react'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

const tones = ['professional', 'friendly', 'apologetic', 'grateful']

export default function Settings() {
  const { user } = useAuth()
  const { profile, setProfile, loading } = useProfile()
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [defaultTone, setDefaultTone] = useState('professional')
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setCompanyName(profile?.company_name || '')
    setFullName(profile?.full_name || '')
    setDefaultTone(localStorage.getItem('reviewpilot_default_tone') || 'professional')
    setEmailAlerts(localStorage.getItem('reviewpilot_email_alerts') === 'true')
  }, [profile])

  async function saveSettings(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const { data, error: updateError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName, company_name: companyName })
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
    } else {
      localStorage.setItem('reviewpilot_default_tone', defaultTone)
      localStorage.setItem('reviewpilot_email_alerts', String(emailAlerts))
      setProfile(data)
      setMessage('Settings saved.')
    }

    setSaving(false)
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage account preferences used by AI reply generation."
      />
      {error ? <p className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="mb-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

      <form onSubmit={saveSettings} className="max-w-2xl rounded-2xl border border-indigo-100/70 bg-white p-5 shadow-sm shadow-indigo-50">
        {loading ? <p className="mb-4 text-sm text-slate-500">Loading profile...</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Full name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-indigo-100 px-3 py-2 outline-none focus:border-[#7C6CF6] focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Business name
            <input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-indigo-100 px-3 py-2 outline-none focus:border-[#7C6CF6] focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Default reply tone
          <select
            value={defaultTone}
            onChange={(event) => setDefaultTone(event.target.value)}
            className="mt-2 w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 outline-none focus:border-[#7C6CF6] focus:ring-2 focus:ring-indigo-100"
          >
            {tones.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-indigo-100 p-4">
          <span>
            <span className="block text-sm font-semibold text-slate-800">Email alerts</span>
            <span className="block text-sm text-slate-500">Placeholder toggle for new review notifications.</span>
          </span>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(event) => setEmailAlerts(event.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-[#7C6CF6]"
          />
        </label>

        <Button type="submit" className="mt-5" loading={saving}>
          Save settings
        </Button>
      </form>
    </>
  )
}
