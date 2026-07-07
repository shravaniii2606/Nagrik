import { useState } from 'react'
import { LANGUAGE_OPTIONS } from '../lib/languages.js'
import { useAuth } from '../lib/auth.jsx'

function LanguageSelector() {
  const { session, profile, updateProfile, profileLoading } = useAuth()
  const [error, setError] = useState('')

  if (!session) {
    return null
  }

  async function handleChange(event) {
    const nextLanguage = event.target.value
    setError('')
    try {
      await updateProfile({
        name: profile?.name || 'Citizen',
        language_pref: nextLanguage,
        location: profile?.location || null,
      })
    } catch {
      setError('Language could not be saved.')
    }
  }

  return (
    <div className="min-w-40">
      <label htmlFor="global-language" className="block text-sm font-medium text-slate-800">
        Language
      </label>
      <select
        id="global-language"
        value={profile?.language_pref || 'English'}
        onChange={handleChange}
        disabled={profileLoading}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
      >
        {LANGUAGE_OPTIONS.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-800" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default LanguageSelector
