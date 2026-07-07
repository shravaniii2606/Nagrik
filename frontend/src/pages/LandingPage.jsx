import AuthPanel from '../components/AuthPanel.jsx'

const featureHighlights = [
  'Find the right government service',
  'Get document checklists in your language',
  'Report and track civic issues',
]

function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-950">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-8">
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <img
              src="/brand/smart-bharat-logo.png"
              alt="Smart Bharat logo, AI Companion guiding you through government services"
              className="w-full object-cover"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {featureHighlights.map((item) => (
              <div key={item} className="rounded-md border border-emerald-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-medium text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Civic help, simplified
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
            Sign in to start with Smart Bharat
          </h1>
          <p className="mt-3 text-slate-700">
            Use one secure magic link to access AI guidance, service checklists, complaint reporting, and profile language preferences.
          </p>

          <div className="mt-6">
            <AuthPanel />
          </div>

        </div>
      </section>
    </main>
  )
}

export default LandingPage
