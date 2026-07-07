import { useEffect, useState } from 'react'
import RequireAuth from '../components/RequireAuth.jsx'
import { fetchComplaints } from '../lib/api.js'

const timelineSteps = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'in_review', label: 'In Review' },
  { key: 'resolved', label: 'Resolved' },
]

function ComplaintTimeline({ status }) {
  const activeIndex = timelineSteps.findIndex((step) => step.key === status)

  return (
    <ol className="mt-4 space-y-2 border-l-2 border-slate-200 pl-4" aria-label="Complaint progress">
      {timelineSteps.map((step, index) => {
        const isComplete = index <= activeIndex
        return (
          <li
            key={step.key}
            className={`relative rounded-md border px-3 py-2 text-sm font-medium ${
              isComplete
                ? 'border-green-300 bg-green-50 text-green-900'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <span
              className={`absolute -left-[1.45rem] top-3 h-3 w-3 rounded-full ${
                isComplete ? 'bg-green-700' : 'bg-slate-400'
              }`}
              aria-hidden="true"
            />
            {step.label}
          </li>
        )
      })}
    </ol>
  )
}

function ComplaintsContent() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchComplaints()
      .then((items) => {
        if (active) {
          setComplaints(items)
          setError('')
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load complaints.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section aria-labelledby="complaints-heading" className="space-y-5">
      <div>
        <h2 id="complaints-heading" className="text-2xl font-bold text-slate-950">
          Track complaints
        </h2>
        <p className="mt-2 text-slate-700">
          Your complaints are shown as a vertical list with status progress.
        </p>
      </div>

      {loading && <p className="text-slate-700">Loading complaints...</p>}
      {error && (
        <p className="text-red-800" role="alert">
          {error}
        </p>
      )}
      {!loading && complaints.length === 0 && (
        <p className="rounded-md border border-slate-200 bg-white p-4 text-slate-700">
          No complaints submitted yet.
        </p>
      )}

      <div className="space-y-4">
        {complaints.map((complaint) => (
          <article key={complaint.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-blue-800">{complaint.category}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">{complaint.description}</h3>
                <p className="mt-1 text-sm text-slate-700">Created: {new Date(complaint.created_at).toLocaleString()}</p>
              </div>
              {complaint.image_url && (
                <img
                  src={complaint.image_url}
                  alt={complaint.description || 'Uploaded complaint image'}
                  className="h-28 w-full rounded-md object-cover md:w-40"
                />
              )}
            </div>
            <ComplaintTimeline status={complaint.status} />
          </article>
        ))}
      </div>
    </section>
  )
}

function ComplaintsPage() {
  return (
    <RequireAuth>
      <ComplaintsContent />
    </RequireAuth>
  )
}

export default ComplaintsPage
