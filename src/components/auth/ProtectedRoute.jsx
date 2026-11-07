import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { HeartPulse } from 'lucide-react'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, initialLoading } = useAuth()
  const location = useLocation()

  // 1. Initial authentication verification on page refresh: show clean loader
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
          <span className="visually-hidden">Verifying credentials...</span>
        </div>
        <span className="text-secondary small fw-medium">Verifying Secure HealthPulse Session...</span>
      </div>
    )
  }

  // 2. Unauthenticated: Redirect to designated login portal
  if (!isAuthenticated) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />
    }
    if (location.pathname.startsWith('/doctor')) {
      return <Navigate to="/doctor/login" state={{ from: location }} replace />
    }
    if (location.pathname.startsWith('/patient')) {
      return <Navigate to="/patient/login" state={{ from: location }} replace />
    }
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Authenticated but unauthorized role: Block cross-role access
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />
    } else if (role === 'patient') {
      return <Navigate to="/patient/dashboard" replace />
    }
    return <Navigate to="/login" replace />
  }

  return children
}
