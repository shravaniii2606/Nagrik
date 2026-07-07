import { Link, useRouteError } from 'react-router-dom'

function NotFoundPage() {
  const error = useRouteError()
  const message = error?.status === 404 ? 'This page does not exist.' : 'Something went wrong.'

  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-12 text-slate-950 sm:px-6">
      <section className="mx-auto max-w-xl rounded-md border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="not-found-heading">
        <img
          src="/brand/smart-bharat-logo.png"
          alt="Smart Bharat logo"
          className="h-20 w-20 rounded-md object-cover"
        />
        <h1 id="not-found-heading" className="mt-5 text-2xl font-bold">
          Page not found
        </h1>
        <p className="mt-2 text-slate-700">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-md bg-[#0b1f4d] px-4 py-2 font-medium text-white transition hover:bg-[#12306f]"
          >
            Go to landing
          </Link>
          <Link
            to="/services"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-100"
          >
            Open services
          </Link>
        </div>
      </section>
    </main>
  )
}

export default NotFoundPage
