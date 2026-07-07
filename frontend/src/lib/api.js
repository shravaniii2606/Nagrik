import { supabase } from './supabaseClient.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function getAccessToken() {
  if (!supabase) {
    throw new Error('Supabase frontend environment variables are missing.')
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new Error('Could not read the current session.')
  }
  return data.session?.access_token
}

async function request(path, options = {}) {
  const token = options.skipAuth ? null : await getAccessToken()
  if (!options.skipAuth && !token) {
    throw new Error('Please sign in before using this feature.')
  }

  const bodyIsFormData = options.body instanceof FormData
  const headers = {
    ...(bodyIsFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${text}`)
  }

  return res.json()
}

export function pingBackend() {
  return request('/api/health', { skipAuth: true })
}

export function sendChatMessage(message, serviceContext) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      service_context: serviceContext || null,
    }),
  })
}

export function uploadChecklistDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/api/chat/document-upload', {
    method: 'POST',
    body: formData,
  })
}

export function fetchApplications(serviceName) {
  const query = serviceName ? `?service_name=${encodeURIComponent(serviceName)}` : ''
  return request(`/api/applications${query}`)
}

export function createApplication(serviceName, documents) {
  return request('/api/applications', {
    method: 'POST',
    body: JSON.stringify({
      service_name: serviceName,
      documents,
    }),
  })
}

export function createComplaint(description, image) {
  const formData = new FormData()
  formData.append('description', description)
  if (image) {
    formData.append('image', image)
  }

  return request('/api/complaints', {
    method: 'POST',
    body: formData,
  })
}

export function fetchComplaints() {
  return request('/api/complaints')
}

export async function fetchProfile() {
  try {
    return await request('/api/profile')
  } catch (error) {
    if (error.message.includes('404')) {
      return null
    }
    throw error
  }
}

export function saveProfile(profile) {
  return request('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  })
}
