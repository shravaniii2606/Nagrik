import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

function RequireAuth({ children }) {
  const { loading, session } = useAuth()

  if (loading) {
    return <p className="text-slate-700">Checking your secure session...</p>
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RequireAuth
