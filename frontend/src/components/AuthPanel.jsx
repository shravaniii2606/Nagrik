import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './ui/Button.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/auth.jsx'
import { cleanText } from '../lib/validation.js'

function AuthPanel({ compact = false }) {
  const { session, supabaseConfigMissing } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn(event) {
    event.preventDefault()
    setError('')
    setStatus('')
    const cleanedEmail = cleanText(email, 160)
    if (!cleanedEmail.includes('@')) {
      setError('Enter a valid email address.')
      return
    }

    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: cleanedEmail,
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)

    if (signInError) {
      setError('Could not send the sign-in link. Check Supabase Auth settings.')
      return
    }
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 shadow-sm"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full justify-center py-3">
        {loading ? 'Sending...' : 'Sign in'}
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
