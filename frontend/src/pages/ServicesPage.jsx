import { Link } from 'react-router-dom'
import { GOVERNMENT_SERVICES } from '../lib/services.js'

function ServicesPage() {
  return (
    <div className="space-y-6">
      <section aria-labelledby="services-heading" className="space-y-3">
        <div className="max-w-3xl">
          <h2 id="services-heading" className="text-2xl font-bold text-slate-950">
            Government services browser
          </h2>
          <p className="mt-2 text-slate-700">
            Choose a service to open the AI companion with that context already selected.
          </p>
        </div>
      </section>

      <section aria-label="Common Indian government services">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GOVERNMENT_SERVICES.map((service) => (
            <Link
              key={service.name}
              to={`/chat?service=${encodeURIComponent(service.name)}`}
              className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
              <div className="flex gap-3">
                <img
                  src={service.icon}
                  alt={`${service.name} service icon`}
                  className="h-12 w-12 flex-none"
                />
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-800">{service.category}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">{service.name}</h3>
                  <p className="mt-2 text-sm text-slate-700">{service.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ServicesPage
