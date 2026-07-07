import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchProfile, saveProfile } from './api.js'
import { supabase, supabaseConfigMissing } from './supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (supabaseConfigMissing || !supabase) {
      setLoading(false)
      return undefined
    }

    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setLoading(false)
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setProfile(null)
      return undefined
    }

    let active = true
    setProfileLoading(true)
    fetchProfile()
      .then((nextProfile) => {
        if (active) {
          setProfile(nextProfile)
        }
      })
      .catch(() => {
        if (active) {
          setProfile(null)
        }
      })
      .finally(() => {
        if (active) {
          setProfileLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [session])

  const updateProfile = useCallback(async (payload) => {
    const savedProfile = await saveProfile(payload)
    setProfile(savedProfile)
    return savedProfile
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      profileLoading,
      updateProfile,
      supabaseConfigMissing,
    }),
    [session, profile, loading, profileLoading, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }
  return context
}
