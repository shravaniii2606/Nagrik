import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import { pingBackend } from '../lib/api.js'

function Home() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  async function handleCheck() {
    setStatus('loading')
    setError(null)
    try {
      const data = await pingBackend()
      setStatus(data.message || 'ok')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError('Could not reach backend. Is it running and is VITE_API_URL set?')
      setStatus('idle')
    }
  }

  return (
    <section aria-labelledby="home-heading">
      <h2 id="home-heading" className="text-lg font-medium mb-4">
        Starter is wired up
      </h2>

      <p className="mb-4 text-gray-600">
        Replace this page with your actual feature. This button confirms the
        frontend can reach the FastAPI backend.
      </p>

      <Button onClick={handleCheck} disabled={status === 'loading'}>
        {status === 'loading' ? 'Checking...' : 'Check backend connection'}
      </Button>

      {status !== 'idle' && status !== 'loading' && (
        <p role="status" className="mt-4 text-green-700">
          Backend says: {status}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-red-700">
          {error}
        </p>
      )}
    </section>
  )
}

export default Home
