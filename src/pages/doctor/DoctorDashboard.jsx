import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext.jsx'
import { API_BASE_URL } from '../../config.js'
import {
  Stethoscope,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Mail,
  LogOut,
  HeartPulse,
  Activity,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

export default function DoctorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingApptId, setUpdatingApptId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const doctorId = user?.id || 1

  const fetchDoctorDashboard = () => {
    setLoading(true)
    setError(null)
    axios
      .get(`${API_BASE_URL}/api/doctor/dashboard/${doctorId}`)
      .then((res) => {
        setDashboardData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load doctor dashboard:', err)
        setError('Unable to load clinical records.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDoctorDashboard()
  }, [doctorId])

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setUpdatingApptId(appointmentId)
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        status: newStatus,
      })
      showToast(`Appointment status updated to ${newStatus}`)
      fetchDoctorDashboard()
    } catch (err) {
      console.error('Failed to update status:', err)
      showToast('Failed to update status.', 'danger')
    } finally {
      setUpdatingApptId(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const doctorInfo = dashboardData?.doctor || user || {}
  const appointments = dashboardData?.appointments || []
  const assignedPatients = dashboardData?.assigned_patients || []

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* Toast Notification */}
      {toast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1099 }}>
          <div
            className={`alert alert-${toast.type === 'danger' ? 'danger' : 'success'} shadow-lg border-0 d-flex align-items-center gap-2 rounded-4 px-4 py-3`}
            role="alert"
          >
            {toast.type === 'danger' ? (
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
            ) : (
              <CheckCircle2 size={20} className="text-success flex-shrink-0" />
            )}
            <div>
              <strong className="d-block small">{toast.type === 'danger' ? 'Error' : 'Success'}</strong>
              <small>{toast.message}</small>
            </div>
            <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={() => setToast(null)} />
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="navbar navbar-expand bg-white border-bottom shadow-xs py-3 sticky-top">
        <div className="container">
          <div className="d-flex align-items-center gap-2">
            <div
              className="p-2 rounded-3 text-white d-flex align-items-center justify-content-center"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
            >
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <span className="h5 fw-bold mb-0 text-dark">HealthPulse</span>
              <span className="badge bg-info-subtle text-info border border-info-subtle ms-2 small">
                Doctor Portal
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <span className="fw-bold text-dark d-block small">{doctorInfo.name || 'Dr. Attending Physician'}</span>
              <span className="text-muted small">{doctorInfo.specialization || 'Clinical Specialist'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="container py-4 flex-grow-1">
        {/* Physician Profile Header Card */}
        <div
          className="card border-0 shadow-sm rounded-4 text-white p-4 mb-4"
          style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)' }}
        >
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  fontSize: '1.4rem',
                }}
              >
                DR
              </div>
              <div>
                <span className="badge bg-white text-dark small rounded-pill px-3 py-1 mb-1">
                  Active Clinical Duty
                </span>
                <h3 className="h4 fw-bold mb-0 text-white">{doctorInfo.name || 'Dr. Satya Deep'}</h3>
                <span className="text-white-50 small">
                  {doctorInfo.specialization} &bull; {doctorInfo.email}
                </span>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="d-flex align-items-center gap-2">
              <div className="p-3 rounded-3 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                <span className="d-block text-white-50 small" style={{ fontSize: '0.75rem' }}>
                  Today's Visits
                </span>
                <strong className="fs-5 text-white">{appointments.length}</strong>
              </div>
              <div className="p-3 rounded-3 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                <span className="d-block text-white-50 small" style={{ fontSize: '0.75rem' }}>
                  Assigned Patients
                </span>
                <strong className="fs-5 text-white">{assignedPatients.length}</strong>
              </div>
              <button
                className="btn btn-outline-light rounded-pill btn-sm ms-2"
                onClick={fetchDoctorDashboard}
                title="Sync clinical data"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted small mt-2">Loading clinical schedule...</p>
          </div>
        )}

        {!loading && (
          <div className="row g-4">
            {/* Left Column: My Appointment Schedule */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 bg-white h-100" style={{ border: '1px solid #e2e8f0' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-2 rounded-3 bg-sky-50 text-primary" style={{ backgroundColor: '#e0f2fe' }}>
                        <Calendar size={18} />
                      </div>
                      <h5 className="fw-bold mb-0 text-dark">Clinical Schedule & Appointments</h5>
                    </div>
                    <span className="badge bg-light text-secondary border small">{appointments.length} visits</span>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="text-center py-5 text-muted small">
                      No appointments currently scheduled for your clinic.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {appointments.map((app) => (
                        <div key={app.id} className="p-3 rounded-3 border bg-light">
                          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-2">
                            <div>
                              <strong className="text-dark d-block">{app.patient_name}</strong>
                              <span className="text-muted small">
                                {app.appointment_date} at {app.appointment_time}
                              </span>
                            </div>
                            <span
                              className={`badge rounded-pill px-3 py-1 small align-self-start align-self-sm-center ${
                                app.status === 'Completed'
                                  ? 'bg-success text-white'
                                  : app.status === 'Cancelled'
                                  ? 'bg-danger text-white'
                                  : 'bg-primary text-white'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>

                          <p className="text-secondary small mb-2 fst-italic">
                            Reason: "{app.reason || 'General Health Consultation'}"
                          </p>

                          {/* Status Actions */}
                          {app.status === 'Scheduled' && (
                            <div className="d-flex gap-2 pt-2 border-top">
                              <button
                                type="button"
                                className="btn btn-sm btn-success rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                disabled={updatingApptId === app.id}
                                onClick={() => handleUpdateStatus(app.id, 'Completed')}
                              >
                                <CheckCircle2 size={14} />
                                <span>Mark Consulted</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                disabled={updatingApptId === app.id}
                                onClick={() => handleUpdateStatus(app.id, 'Cancelled')}
                              >
                                <XCircle size={14} />
                                <span>Cancel Visit</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Assigned Patients */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 bg-white h-100" style={{ border: '1px solid #e2e8f0' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-2 rounded-3 bg-emerald-50 text-success" style={{ backgroundColor: '#dcfce7' }}>
                        <Users size={18} />
                      </div>
                      <h5 className="fw-bold mb-0 text-dark">Authorized Patients</h5>
                    </div>
                    <span className="badge bg-light text-secondary border small">{assignedPatients.length} Active</span>
                  </div>

                  {assignedPatients.length === 0 ? (
                    <div className="text-center py-5 text-muted small">
                      No patients currently assigned under your direct care.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {assignedPatients.map((patient) => (
                        <div key={patient.id} className="p-3 rounded-3 border bg-light">
                          <div className="d-flex align-items-start justify-content-between mb-2">
                            <div>
                              <strong className="text-dark d-block">{patient.name}</strong>
                              <span className="text-muted small">{patient.email}</span>
                            </div>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                              {patient.disease || 'General'}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2 small text-muted">
                            <span>Age: {patient.age} yrs</span>
                            <span>&bull;</span>
                            <span>Weight: {patient.weight} kg</span>
                            <span>&bull;</span>
                            <span>Gender: {patient.gender}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
