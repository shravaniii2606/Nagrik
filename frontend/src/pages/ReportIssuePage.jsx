import { useState } from 'react'
import { Link } from 'react-router-dom'
import RequireAuth from '../components/RequireAuth.jsx'
import Button from '../components/ui/Button.jsx'
import { createComplaint } from '../lib/api.js'
import { cleanText, validateImageFile } from '../lib/validation.js'

function ReportIssueContent() {
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [createdComplaint, setCreatedComplaint] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function handleImageChange(event) {
    const nextFile = event.target.files?.[0] || null
    const validationError = validateImageFile(nextFile)
    setError(validationError)
    setImage(validationError ? null : nextFile)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanedDescription = cleanText(description, 1000)
    if (cleanedDescription.length < 10) {
      setError('Describe the issue in at least 10 characters.')
      return
    }

    setSubmitting(true)
    setError('')
    setStatus('')
    try {
      const complaint = await createComplaint(cleanedDescription, image)
      setCreatedComplaint(complaint)
      setDescription('')
      setImage(null)
      setStatus('Complaint submitted and categorized.')
    } catch {
      setError('Complaint could not be submitted. Check backend and Supabase settings.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="report-heading" className="max-w-3xl space-y-5">
      <div>
        <h2 id="report-heading" className="text-2xl font-bold text-slate-950">
          Report a public issue
        </h2>
        <p className="mt-2 text-slate-700">
          Submit a local issue and Smart Bharat will classify it before saving it for tracking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label htmlFor="issue-description" className="block text-sm font-medium text-slate-800">
            Issue description
          </label>
          <textarea
            id="issue-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            minLength={10}
            maxLength={1000}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            placeholder="Example: There is a pothole near the bus stop on MG Road."
            required
          />
        </div>

        <div className="mt-4">
          <label htmlFor="issue-image" className="block text-sm font-medium text-slate-800">
            Optional image
          </label>
          <input
            id="issue-image"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageChange}
            className="mt-1 block w-full rounded-md border border-slate-300 text-sm text-slate-900 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-900"
          />
          <p className="mt-1 text-sm text-slate-700">JPG or PNG only, maximum 5MB.</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit complaint'}
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

      {createdComplaint && (
        <article className="rounded-md border border-green-200 bg-green-50 p-4">
          <h3 className="text-lg font-semibold text-green-950">Complaint saved</h3>
          <p className="mt-1 text-green-900">
            Category: {createdComplaint.category}. Status: {createdComplaint.status}.
          </p>
          <Link to="/complaints" className="mt-3 inline-block font-medium text-green-950 underline">
            Track complaint timeline
          </Link>
        </article>
      )}
    </section>
  )
}

function ReportIssuePage() {
  return (
    <RequireAuth>
      <ReportIssueContent />
    </RequireAuth>
  )
}

export default ReportIssuePage
