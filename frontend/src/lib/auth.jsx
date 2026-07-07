import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchProfile, saveProfile } from './api.js'
import { supabase, supabaseConfigMissing } from './supabaseClient.js'

const AuthContext = createContext(null)
const pendingProfileKey = 'smart_bharat_pending_signup_profile'

function readPendingProfile(session) {
  try {
    const rawProfile = localStorage.getItem(pendingProfileKey)
    if (!rawProfile) {
      return null
    }

    const parsedProfile = JSON.parse(rawProfile)
    if (parsedProfile.email !== session?.user?.email) {
      return null
    }

    return parsedProfile.profileData || null
  } catch {
    return null
  }
}

function clearPendingProfile() {
  localStorage.removeItem(pendingProfileKey)
}

function profileFromUserMetadata(session) {
  const metadata = session?.user?.user_metadata || {}
  if (!metadata.name) {
    return null
  }

  return {
    name: metadata.name,
    birth_date: metadata.birth_date || null,
    gender: metadata.gender || null,
    address: metadata.address || null,
    city: metadata.city || null,
    state: metadata.state || null,
    pincode: metadata.pincode || null,
    language_pref: metadata.language_pref || 'English',
    location: metadata.location || metadata.city || null,
  }
}

function hasCompleteSignupDetails(profile) {
  return Boolean(
    profile?.name &&
      profile?.birth_date &&
      profile?.gender &&
      profile?.address &&
      profile?.city &&
      profile?.state &&
      profile?.pincode,
  )
}

function mergeProfileDetails(existingProfile, signupProfile) {
  if (!signupProfile) {
    return existingProfile
  }

  return {
    name: existingProfile?.name || signupProfile.name,
    birth_date: existingProfile?.birth_date || signupProfile.birth_date || null,
    gender: existingProfile?.gender || signupProfile.gender || null,
    address: existingProfile?.address || signupProfile.address || null,
    city: existingProfile?.city || signupProfile.city || null,
    state: existingProfile?.state || signupProfile.state || null,
    pincode: existingProfile?.pincode || signupProfile.pincode || null,
    language_pref: existingProfile?.language_pref || signupProfile.language_pref || 'English',
    location: existingProfile?.location || signupProfile.location || signupProfile.city || null,
  }
}

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

    async function loadProfile() {
      try {
        const nextProfile = await fetchProfile()
        if (!active) {
          return
        }

        const pendingProfile = readPendingProfile(session)
        const metadataProfile = profileFromUserMetadata(session)
        const signupProfile = pendingProfile || metadataProfile

        if (nextProfile && hasCompleteSignupDetails(nextProfile)) {
          setProfile(nextProfile)
          clearPendingProfile()
          return
        }

        if (signupProfile) {
          const savedProfile = await saveProfile(mergeProfileDetails(nextProfile, signupProfile))
          if (active) {
            setProfile(savedProfile)
          }
          clearPendingProfile()
          return
        }

        setProfile(nextProfile || null)
      } catch {
        if (active) {
          setProfile(null)
        }
      } finally {
        if (active) {
          setProfileLoading(false)
        }
      }
    }

    loadProfile()

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
