// Central place for all backend API calls.
// Never hardcode the backend URL elsewhere - always import from here.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${text}`)
  }

  return res.json()
}

export function pingBackend() {
  return request('/api/health')
}
