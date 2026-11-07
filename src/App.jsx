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
import MedicalRecords from './pages/admin/MedicalRecords.jsx'
import Prescriptions from './pages/admin/Prescriptions.jsx'
import Reports from './pages/admin/Reports.jsx'
import Settings from './pages/admin/Settings.jsx'
import AdminPlaceholder from './pages/admin/AdminPlaceholder.jsx'
import DoctorLayout from './components/doctor/DoctorLayout.jsx'
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx'
import DoctorPatients from './pages/doctor/DoctorPatients.jsx'
import DoctorPatientDetails from './pages/doctor/DoctorPatientDetails.jsx'
import DoctorAppointments from './pages/doctor/DoctorAppointments.jsx'
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords.jsx'
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions.jsx'
import DoctorSchedule from './pages/doctor/DoctorSchedule.jsx'
import DoctorProfile from './pages/doctor/DoctorProfile.jsx'
import DoctorNotifications from './pages/doctor/DoctorNotifications.jsx'
import DoctorSettings from './pages/doctor/DoctorSettings.jsx'
import PatientLayout from './components/patient/PatientLayout.jsx'
import PatientDashboard from './pages/patient/PatientDashboard.jsx'
import PatientAppointments from './pages/patient/PatientAppointments.jsx'
import FindDoctor from './pages/patient/FindDoctor.jsx'
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords.jsx'
import PatientPrescriptions from './pages/patient/PatientPrescriptions.jsx'
import PatientLabResults from './pages/patient/PatientLabResults.jsx'
import PatientNotifications from './pages/patient/PatientNotifications.jsx'
import PatientProfile from './pages/patient/PatientProfile.jsx'
import PatientSettings from './pages/patient/PatientSettings.jsx'
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
            <Route path="medical-records" element={<MedicalRecords />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Doctor Protected Routes with DoctorLayout */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="patients/:id" element={<DoctorPatientDetails />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="medical-records" element={<DoctorMedicalRecords />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="notifications" element={<DoctorNotifications />} />
            <Route path="settings" element={<DoctorSettings />} />
          </Route>

          {/* Patient Protected Routes with PatientLayout */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="doctors" element={<FindDoctor />} />
            <Route path="medical-records" element={<PatientMedicalRecords />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="lab-results" element={<PatientLabResults />} />
            <Route path="notifications" element={<PatientNotifications />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="settings" element={<PatientSettings />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
