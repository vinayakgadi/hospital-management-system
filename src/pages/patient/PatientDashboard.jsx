import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext.jsx'
import { API_BASE_URL } from '../../config.js'
import {
  UserCheck,
  Calendar,
  HeartPulse,
  Stethoscope,
  Activity,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react'

export default function PatientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingApptId, setCancellingApptId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const patientId = user?.id || 1

  const fetchPatientDashboard = () => {
    setLoading(true)
    setError(null)
    axios
      .get(`${API_BASE_URL}/api/patient/dashboard/${patientId}`)
      .then((res) => {
        setDashboardData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load patient dashboard:', err)
        setError('Unable to load patient records.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPatientDashboard()
  }, [patientId])

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you wish to cancel this scheduled appointment?')) {
      return
    }

    setCancellingApptId(appointmentId)
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        status: 'Cancelled',
      })
      showToast('Appointment successfully cancelled.')
      fetchPatientDashboard()
    } catch (err) {
      console.error('Failed to cancel appointment:', err)
      showToast('Failed to cancel appointment.', 'danger')
    } finally {
      setCancellingApptId(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const patient = dashboardData?.patient || user || {}
  const appointments = dashboardData?.appointments || []
  const doctor = dashboardData?.attending_doctor || {}

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
              <strong className="d-block small">{toast.type === 'danger' ? 'Notice' : 'Success'}</strong>
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
              style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
            >
              <HeartPulse size={22} className="text-white" />
            </div>
            <div>
              <span className="h5 fw-bold mb-0 text-dark">HealthPulse</span>
              <span className="badge bg-success-subtle text-success border border-success-subtle ms-2 small">
                Patient Portal
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <span className="fw-bold text-dark d-block small">{patient.name || 'Patient User'}</span>
              <span className="text-muted small">{patient.email}</span>
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
        {/* Welcome Header */}
        <div
          className="card border-0 shadow-sm rounded-4 text-white p-4 mb-4"
          style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)' }}
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
                {(patient.name || 'P').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="badge bg-white text-success small rounded-pill px-3 py-1 mb-1">
                  Active Patient Record #{patient.id}
                </span>
                <h3 className="h4 fw-bold mb-0 text-white">Welcome back, {patient.name}!</h3>
                <span className="text-white-50 small">
                  Primary Condition: {patient.disease || 'General Wellness & Routine Checkup'}
                </span>
              </div>
            </div>

            <button
              className="btn btn-outline-light rounded-pill btn-sm d-inline-flex align-items-center gap-1 self-start self-md-center"
              onClick={fetchPatientDashboard}
              title="Refresh health profile"
            >
              <RefreshCw size={14} />
              <span>Sync Records</span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="text-muted small mt-2">Loading medical records...</p>
          </div>
        )}

        {!loading && (
          <div className="row g-4">
            {/* Left Column: Health Profile & Attending Doctor */}
            <div className="col-12 col-lg-5">
              {/* Vitals Card */}
              <div className="card border-0 shadow-sm rounded-4 bg-white mb-4" style={{ border: '1px solid #e2e8f0' }}>
                <div className="card-body p-4">
                  <h6 className="fw-bold text-dark mb-3 small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    Personal Health Vitals
                  </h6>
                  <div className="row g-3">
                    <div className="col-4">
                      <div className="p-3 bg-light rounded-3 text-center border">
                        <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Age</small>
                        <strong className="fs-5 text-dark">{patient.age || '—'} yrs</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 bg-light rounded-3 text-center border">
                        <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Weight</small>
                        <strong className="fs-5 text-dark">{patient.weight || '—'} kg</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 bg-light rounded-3 text-center border">
                        <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Gender</small>
                        <strong className="fs-5 text-dark text-capitalize">{patient.gender || '—'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attending Physician Card */}
              <div className="card border-0 shadow-sm rounded-4 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                <div className="card-body p-4">
                  <h6 className="fw-bold text-dark mb-3 small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    Your Attending Physician
                  </h6>
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 border mb-3">
                    <div
                      className="p-3 rounded-circle text-white d-flex align-items-center justify-content-center"
                      style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
                    >
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Dr. {doctor.name || patient.doctor_name || 'Satya Deep'}</h6>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle small mt-1">
                        {doctor.specialization || patient.doctor_specialization || 'Cardiology'}
                      </span>
                    </div>
                  </div>

                  <div className="text-secondary small d-flex flex-column gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <Mail size={15} className="text-muted" />
                      <span>{doctor.email || 'doctor@healthpulse.com'}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Phone size={15} className="text-muted" />
                      <span>{doctor.phone || '555-0199'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Appointments */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 bg-white h-100" style={{ border: '1px solid #e2e8f0' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-2 rounded-3 bg-emerald-50 text-success" style={{ backgroundColor: '#dcfce7' }}>
                        <Calendar size={18} />
                      </div>
                      <h5 className="fw-bold mb-0 text-dark">My Appointments Schedule</h5>
                    </div>
                    <span className="badge bg-light text-secondary border small">
                      {appointments.length} Consultations
                    </span>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="text-center py-5 text-muted small">
                      You currently have no scheduled appointments. Contact your attending physician or clinic admin to book a visit.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {appointments.map((app) => (
                        <div key={app.id} className="p-3 rounded-3 border bg-light">
                          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-2">
                            <div>
                              <strong className="text-dark d-block">Dr. {app.doctor_name}</strong>
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
                            Reason: "{app.reason || 'Medical Follow-up'}"
                          </p>

                          {app.status === 'Scheduled' && (
                            <div className="pt-2 border-top text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                disabled={cancellingApptId === app.id}
                                onClick={() => handleCancelAppointment(app.id)}
                              >
                                <XCircle size={14} />
                                <span>Cancel Appointment</span>
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
          </div>
        )}
      </main>
    </div>
  )
}
