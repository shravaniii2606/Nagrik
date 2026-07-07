import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './ui/Button.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/auth.jsx'
import { cleanText } from '../lib/validation.js'

const genderOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to say']
const initialForm = {
  email: '',
  name: '',
  birthDate: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
}

const pendingProfileKey = 'smart_bharat_pending_signup_profile'

function AuthPanel({ compact = false }) {
  const { session, supabaseConfigMissing } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function buildSignupPayload() {
    const email = cleanText(form.email, 160)
    const profileData = {
      name: cleanText(form.name, 120),
      birth_date: form.birthDate,
      gender: form.gender,
      address: cleanText(form.address, 240),
      city: cleanText(form.city, 120),
      state: cleanText(form.state, 120),
      pincode: cleanText(form.pincode, 6),
      language_pref: 'English',
      location: cleanText(form.city, 120),
    }

    if (!email.includes('@')) {
      return { error: 'Enter a valid email address.' }
    }
    if (!profileData.name) {
      return { error: 'Name is required.' }
    }
    if (!profileData.birth_date) {
      return { error: 'Birth date is required.' }
    }
    if (!profileData.gender) {
      return { error: 'Gender is required.' }
    }
    if (!profileData.address || !profileData.city || !profileData.state) {
      return { error: 'Address, city, and state are required.' }
    }
    if (!/^[1-9][0-9]{5}$/.test(profileData.pincode)) {
      return { error: 'Enter a valid 6-digit Indian pincode.' }
    }

    return { payload: { email, profileData } }
  }

  async function handleSignIn(event) {
    event.preventDefault()
    setError('')
    setStatus('')
    const { payload, error: validationError } = buildSignupPayload()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: payload.email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true,
        data: payload.profileData,
      },
    })
    setLoading(false)

    if (signInError) {
      setError(`Could not send the sign-in link: ${cleanText(signInError.message, 180)}`)
      return
    }

    localStorage.setItem(
      pendingProfileKey,
      JSON.stringify({
        email: payload.email,
        profileData: payload.profileData,
      }),
    )
    setStatus('Check your email for the secure sign-in link.')
  }

  async function handleSignOut() {
    setError('')
    await supabase.auth.signOut()
  }

  if (supabaseConfigMissing) {
    return (
      <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
        Supabase frontend environment variables are missing. Add them to `frontend/.env`.
      </p>
    )
  }

  if (session) {
    return (
      <div className={compact ? 'flex items-center gap-3 text-sm' : 'space-y-4'}>
        <p className="text-slate-700">Signed in as {session.user.email}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/services"
            className="rounded-md bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            Open dashboard
          </Link>
          <Button variant="secondary" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form className={compact ? 'flex flex-wrap items-end gap-2' : 'space-y-4'} onSubmit={handleSignIn}>
      <div>
        <label htmlFor={compact ? 'header-email' : 'auth-email'} className="block text-sm font-medium text-slate-800">
          Email
        </label>
        <input
          id={compact ? 'header-email' : 'auth-email'}
          type="email"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 shadow-sm"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-slate-800">
            Full name
          </label>
          <input
            id="signup-name"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            maxLength={120}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 shadow-sm"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label htmlFor="signup-birth-date" className="block text-sm font-medium text-slate-800">
            Birth date
          </label>
          <input
            id="signup-birth-date"
            type="date"
            value={form.birthDate}
            onChange={(event) => updateField('birthDate', event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 shadow-sm"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="signup-gender" className="block text-sm font-medium text-slate-800">
          Gender
        </label>
        <select
          id="signup-gender"
          value={form.gender}
          onChange={(event) => updateField('gender', event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm"
          required
        >
          <option value="">Select gender</option>
          {genderOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="signup-address" className="block text-sm font-medium text-slate-800">
          Address
        </label>
        <textarea
          id="signup-address"
          value={form.address}
          onChange={(event) => updateField('address', event.target.value)}
          rows={3}
          maxLength={240}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 shadow-sm"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="signup-city" className="block text-sm font-medium text-slate-800">
            City
          </label>
          <input
            id="signup-city"
            value={form.city}
            onChange={(event) => updateField('city', event.target.value)}
            maxLength={120}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 shadow-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="signup-state" className="block text-sm font-medium text-slate-800">
            State
          </label>
          <input
            id="signup-state"
            value={form.state}
            onChange={(event) => updateField('state', event.target.value)}
            maxLength={120}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 shadow-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="signup-pincode" className="block text-sm font-medium text-slate-800">
            Pincode
          </label>
          <input
            id="signup-pincode"
            value={form.pincode}
            onChange={(event) => updateField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            pattern="[1-9][0-9]{5}"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 shadow-sm"
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full justify-center py-3">
        {loading ? 'Sending...' : 'Send secure sign-up link'}
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
    </form>
  )
}

export default AuthPanel
