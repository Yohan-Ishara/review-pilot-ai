import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading, isConfigured } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-slate-600">
        Loading ReviewPilot AI...
      </div>
    )
  }

  if (!isConfigured || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
