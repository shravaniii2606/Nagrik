import { NavLink, Outlet } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import Button from './ui/Button.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/auth.jsx'

const navItems = [
  { to: '/services', label: 'Services' },
  { to: '/chat', label: 'AI Chat' },
  { to: '/report', label: 'Report Issue' },
  { to: '/complaints', label: 'Track Complaints' },
  { to: '/profile', label: 'Profile' },
]

function AppShell() {
  const { session } = useAuth()

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-950">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/brand/smart-bharat-logo.png"
                alt="Smart Bharat logo"
                className="h-12 w-12 rounded-md object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-slate-950">Smart Bharat</h1>
                <p className="text-sm text-slate-700">AI-powered civic companion</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <LanguageSelector />
              {session && (
                <Button variant="secondary" onClick={handleSignOut}>
                  Sign out
                </Button>
              )}
            </div>
          </div>
          <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/services'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-[#0b1f4d] text-white'
                      : 'text-slate-800 hover:bg-emerald-50 hover:text-slate-950'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default AppShell
