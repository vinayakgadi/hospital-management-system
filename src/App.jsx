import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import PublicRoute from './components/auth/PublicRoute.jsx'
import PortalHub from './pages/auth/PortalHub.jsx'
import AdminLogin from './pages/auth/AdminLogin.jsx'
import DoctorLogin from './pages/auth/DoctorLogin.jsx'
import PatientLogin from './pages/auth/PatientLogin.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminPatients from './pages/admin/AdminPatients.jsx'
import AdminDoctors from './pages/admin/AdminDoctors.jsx'
import AdminAppointments from './pages/admin/AdminAppointments.jsx'
import AdminPlaceholder from './pages/admin/AdminPlaceholder.jsx'
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx'
import PatientDashboard from './pages/patient/PatientDashboard.jsx'
import './App.css'

function RootRedirect() {
  const { isAuthenticated, role, initialLoading } = useAuth()

  if (initialLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (role === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />
  }
  if (role === 'patient') {
    return <Navigate to="/patient/dashboard" replace />
  }
  return <Navigate to="/login" replace />
}

export default function App() {
  const [globalSearch, setGlobalSearch] = useState('')

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Authentication Hub & Portals (Wrapped with PublicRoute) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <PortalHub />
              </PublicRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <PublicRoute>
                <AdminLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/doctor/login"
            element={
              <PublicRoute>
                <DoctorLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/patient/login"
            element={
              <PublicRoute>
                <PatientLogin />
              </PublicRoute>
            }
          />

          {/* Admin Protected Routes with AdminLayout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="overview" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="medical-records" element={<AdminPlaceholder />} />
            <Route path="prescriptions" element={<AdminPlaceholder />} />
            <Route path="reports" element={<AdminPlaceholder />} />
            <Route path="settings" element={<AdminPlaceholder />} />
          </Route>

          {/* Doctor Protected Route */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Patient Protected Route */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
