import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { HeartPulse } from 'lucide-react'

export default function PublicRoute({ children }) {
  const { isAuthenticated, role, initialLoading } = useAuth()

  if (initialLoading) {
    return (
      <div
        className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light text-center"
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
      >
        <div
          className="p-3 rounded-circle text-white mb-3 d-flex align-items-center justify-content-center shadow-sm"
          style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
          }}
        >
          <HeartPulse size={32} className="text-info" />
        </div>
        <div className="spinner-border text-primary spinner-border-sm mb-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="text-secondary small fw-medium">Loading HealthPulse Portal...</span>
      </div>
    )
  }

  // If already authenticated, redirect to the user's role dashboard
  if (isAuthenticated) {
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    if (role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />
    }
    if (role === 'patient') {
      return <Navigate to="/patient/dashboard" replace />
    }
  }

  return children
}
