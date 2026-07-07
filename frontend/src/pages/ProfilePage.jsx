import { useEffect, useState } from 'react'
import RequireAuth from '../components/RequireAuth.jsx'
import Button from '../components/ui/Button.jsx'
import { LANGUAGE_OPTIONS } from '../lib/languages.js'
import { useAuth } from '../lib/auth.jsx'
import { cleanText } from '../lib/validation.js'

const emptyProfile = {
  name: '',
  birth_date: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  language_pref: 'English',
  location: '',
}

const genderOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to say']

function ProfileContent() {
  const { profile, updateProfile, profileLoading } = useAuth()
  const [form, setForm] = useState(emptyProfile)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        language_pref: profile.language_pref || 'English',
        location: profile.location || '',
      })
    }
  }, [profile])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const name = cleanText(form.name, 120)
    const address = cleanText(form.address, 240)
    const city = cleanText(form.city, 120)
    const state = cleanText(form.state, 120)
    const pincode = cleanText(form.pincode, 6)
    const location = cleanText(form.location, 160)
    if (!name) {
      setError('Name is required.')
      return
    }
    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) {
      setError('Enter a valid 6-digit Indian pincode.')
      return
    }

    setSaving(true)
    setError('')
    setStatus('')
    try {
      await updateProfile({
        name,
        birth_date: form.birth_date || null,
        gender: form.gender || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        language_pref: form.language_pref,
        location: location || null,
      })
      setStatus('Profile saved. Chat responses will use this language preference.')
    } catch {
      setError('Profile could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-labelledby="profile-heading" className="max-w-2xl space-y-5">
      <div>
        <h2 id="profile-heading" className="text-2xl font-bold text-slate-950">
          Profile and language
        </h2>
        <p className="mt-2 text-slate-700">
          Save your preferred language so the AI companion can respond in the right language.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-slate-800">
            Name
          </label>
          <input
            id="profile-name"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            maxLength={120}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            required
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-birth-date" className="block text-sm font-medium text-slate-800">
              Birth date
            </label>
            <input
              id="profile-birth-date"
              type="date"
              value={form.birth_date}
              onChange={(event) => updateField('birth_date', event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />
          </div>
          <div>
            <label htmlFor="profile-gender" className="block text-sm font-medium text-slate-800">
              Gender
            </label>
            <select
              id="profile-gender"
              value={form.gender}
              onChange={(event) => updateField('gender', event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
            >
              <option value="">Select gender</option>
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="profile-address" className="block text-sm font-medium text-slate-800">
            Address
          </label>
          <textarea
            id="profile-address"
            value={form.address}
            onChange={(event) => updateField('address', event.target.value)}
            rows={3}
            maxLength={240}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="profile-city" className="block text-sm font-medium text-slate-800">
              City
            </label>
            <input
              id="profile-city"
              value={form.city}
              onChange={(event) => updateField('city', event.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />
          </div>
          <div>
            <label htmlFor="profile-state" className="block text-sm font-medium text-slate-800">
              State
            </label>
            <input
              id="profile-state"
              value={form.state}
              onChange={(event) => updateField('state', event.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />
          </div>
          <div>
            <label htmlFor="profile-pincode" className="block text-sm font-medium text-slate-800">
              Pincode
            </label>
            <input
              id="profile-pincode"
              value={form.pincode}
              onChange={(event) => updateField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              pattern="[1-9][0-9]{5}"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="profile-language" className="block text-sm font-medium text-slate-800">
            Language preference
          </label>
          <select
            id="profile-language"
            value={form.language_pref}
            onChange={(event) => updateField('language_pref', event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            {LANGUAGE_OPTIONS.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="profile-location" className="block text-sm font-medium text-slate-800">
            Optional location
          </label>
          <input
            id="profile-location"
            value={form.location}
            onChange={(event) => updateField('location', event.target.value)}
            maxLength={160}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            placeholder="City or ward"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving || profileLoading}>
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
          {status && (
            <p className="text-sm text-green-800" role="status">
              {status}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  )
}

function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  )
}

export default ProfilePage
