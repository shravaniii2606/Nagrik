const applicationSteps = [
  { key: 'in_progress', label: 'Documents submitted' },
  { key: 'under_process', label: 'Under review' },
  { key: 'resolved', label: 'Resolved' },
]

function ApplicationTimeline({ status }) {
  const activeIndex = applicationSteps.findIndex((step) => step.key === status)

  return (
    <ol className="mt-4 space-y-2 border-l-2 border-slate-200 pl-4" aria-label="Application progress">
      {applicationSteps.map((step, index) => {
        const isComplete = index <= activeIndex
        const isActive = index === activeIndex
        return (
          <li
            key={step.key}
            aria-label={isActive ? `Status: ${step.label}` : step.label}
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
            {isActive && <span className="ml-2 text-xs font-semibold">(current)</span>}
          </li>
        )
      })}
    </ol>
  )
}

function ApplicationStatusView({ application }) {
  if (!application) {
    return null
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="application-status-heading">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Existing application</p>
      <h2 id="application-status-heading" className="mt-2 text-xl font-bold text-slate-950">
        {application.service_name}
      </h2>
      <p className="mt-2 text-slate-700">
        Your application is already submitted. You can still ask the AI companion follow-up questions below.
      </p>

      <ApplicationTimeline status={application.status} />

      <div className="mt-5">
        <h3 className="text-base font-semibold text-slate-950">Uploaded documents</h3>
        <ul className="mt-2 space-y-2">
          {application.documents.map((document) => (
            <li key={document.name} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              {document.file_url ? (
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-800 underline underline-offset-2 hover:text-blue-950"
                >
                  {document.name}
                </a>
              ) : (
                <span className="font-medium text-slate-950">{document.name}</span>
              )}
              <span className="ml-2 text-sm text-slate-700">
                {document.uploaded ? 'Uploaded' : 'Missing'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default ApplicationStatusView
