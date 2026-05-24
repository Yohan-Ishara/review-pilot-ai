import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user, isConfigured } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!isConfigured || !user) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) setError(profileError.message)
      setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [isConfigured, user])

  return { profile, setProfile, loading, error }
}
