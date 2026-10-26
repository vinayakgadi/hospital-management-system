import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Authenticating...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // If attempting to access an admin route, redirect to admin login
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

  // If role is specified and does not match
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
