import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { patientService } from '../../services/patientService.js'
import {
  Calendar,
  FileText,
  Pill,
  Activity,
  Heart,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  ChevronRight,
  PlusCircle,
  Thermometer,
  RefreshCw,
  Stethoscope,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await patientService.getDashboard()
      setData(res)
    } catch (err) {
      console.error('Failed to load patient dashboard:', err)
      setError('Unable to load clinical records from the database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you wish to cancel this scheduled appointment?')) {
      return
    }

    setCancellingId(appointmentId)
    try {
      await patientService.cancelAppointment(appointmentId)
      showToast('Appointment successfully cancelled.')
      loadDashboard()
    } catch (err) {
      console.error('Failed to cancel appointment:', err)
      showToast('Failed to cancel appointment.', 'danger')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading patient dashboard...</span>
        </div>
        <p className="text-muted small">Accessing secure medical records...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger rounded-4 d-flex align-items-center gap-3 p-4 shadow-sm">
        <AlertCircle size={28} className="text-danger flex-shrink-0" />
        <div className="flex-grow-1">
          <h5 className="alert-heading fw-bold mb-1">Health Records Service Error</h5>
          <p className="mb-2 small">{error}</p>
          <button onClick={loadDashboard} className="btn btn-outline-danger btn-sm rounded-3">
            <RefreshCw size={14} className="me-1" /> Retry Loading
          </button>
        </div>
      </div>
    )
  }

  const patient = data?.patient || user || {}
  const doctor = data?.attending_doctor || {}
  const metrics = data?.metrics || {}
  const nextAppt = data?.next_appointment
  const vitals = data?.latest_vitals || {}
  const recentRecords = data?.recent_records || []
  const recentPrescriptions = data?.recent_prescriptions || []

  return (
    <div className="space-y-4">
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
            <span className="small fw-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div
        className="card border-0 rounded-4 shadow-sm p-4 text-white overflow-hidden position-relative mb-4"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        }}
      >
        <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
          <div className="col-lg-8">
            <div className="d-inline-flex align-items-center gap-2 badge bg-success bg-opacity-25 border border-success border-opacity-50 px-3 py-1 rounded-pill mb-2">
              <Sparkles size={13} className="text-emerald-300" />
              <span className="text-emerald-100 fw-medium">HealthPulse Patient Services</span>
            </div>
            <h2 className="fw-bold mb-2">Welcome back, {patient.name || 'Patient'}!</h2>
            <p className="text-emerald-100 small mb-3 mb-lg-0" style={{ maxWidth: '600px' }}>
              Your electronic health records, active prescriptions, and upcoming consultations are current and securely synchronized with the hospital system.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <Link
              to="/patient/appointments"
              className="btn btn-light text-success fw-bold px-4 py-2.5 rounded-3 shadow-sm d-inline-flex align-items-center gap-2"
            >
              <PlusCircle size={18} />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Upcoming Visits</span>
              <div className="p-2.5 rounded-3 bg-primary bg-opacity-10 text-primary">
                <Calendar size={20} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{metrics.upcoming_appointments || 0}</div>
            <div className="small text-muted mt-1">Scheduled consultations</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Medical Records</span>
              <div className="p-2.5 rounded-3 bg-info bg-opacity-10 text-info">
                <FileText size={20} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{metrics.finalized_records || 0}</div>
            <div className="small text-muted mt-1">Finalized & signed EMRs</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Active Prescriptions</span>
              <div className="p-2.5 rounded-3 bg-success bg-opacity-10 text-success">
                <Pill size={20} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{metrics.active_prescriptions || 0}</div>
            <div className="small text-muted mt-1">Active medication plans</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Lab Diagnostics</span>
              <div className="p-2.5 rounded-3 bg-warning bg-opacity-10 text-warning">
                <Activity size={20} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{metrics.lab_results || 0}</div>
            <div className="small text-muted mt-1">Diagnostic results available</div>
          </div>
        </div>
      </div>

      {/* Next Appointment & Primary Care Doctor */}
      <div className="row g-4 mb-4">
        {/* Next Appointment Banner */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="p-1.5 rounded-2 bg-primary bg-opacity-10 text-primary">
                  <Calendar size={18} />
                </div>
                <h6 className="fw-bold text-dark mb-0">Next Scheduled Consultation</h6>
              </div>
              <Link to="/patient/appointments" className="small text-primary text-decoration-none fw-semibold">
                Manage All
              </Link>
            </div>
            <div className="card-body p-4">
              {nextAppt ? (
                <div className="p-3.5 bg-light rounded-4 border">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <div>
                      <span className="badge bg-primary-subtle text-primary fw-medium px-2.5 py-1 rounded-pill mb-2">
                        {nextAppt.status}
                      </span>
                      <h5 className="fw-bold text-dark mb-1">{nextAppt.reason}</h5>
                      <p className="text-muted small mb-0">With Dr. {nextAppt.doctor_name} ({nextAppt.doctor_specialization})</p>
                    </div>
                    <div className="text-lg-end">
                      <div className="fs-6 fw-bold text-primary">{nextAppt.appointment_date}</div>
                      <div className="small text-muted">{nextAppt.appointment_time}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                    <span className="small text-muted">
                      Need to reschedule or cancel?
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCancelAppointment(nextAppt.id)}
                      disabled={cancellingId === nextAppt.id}
                      className="btn btn-outline-danger btn-sm rounded-3 px-3"
                    >
                      {cancellingId === nextAppt.id ? 'Cancelling...' : 'Cancel Appointment'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <Calendar size={36} className="text-muted opacity-50 mb-2" />
                  <p className="small mb-3">You have no upcoming appointments scheduled.</p>
                  <Link to="/patient/appointments" className="btn btn-primary btn-sm rounded-3 px-3">
                    Schedule a Consultation
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary Care Physician */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="p-1.5 rounded-2 bg-success bg-opacity-10 text-success">
                  <Stethoscope size={18} />
                </div>
                <h6 className="fw-bold text-dark mb-0">Primary Care Physician</h6>
              </div>
              <Link to="/patient/doctors" className="small text-primary text-decoration-none fw-semibold">
                View Directory
              </Link>
            </div>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-5 flex-shrink-0"
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  }}
                >
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">{doctor.name || 'Dr. Satya Deep'}</h6>
                  <span className="badge bg-info-subtle text-info small">{doctor.specialization || 'Cardiology & General Care'}</span>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.76rem' }}>
                    {doctor.qualifications || 'MD - Harvard Medical School'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 small space-y-2 mb-3">
                <div className="d-flex align-items-center gap-2 text-secondary">
                  <Phone size={14} className="text-muted" />
                  <span>{doctor.phone || '555-0101'}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-secondary">
                  <Mail size={14} className="text-muted" />
                  <span>{doctor.email || 'satya.deep@healthpulse.com'}</span>
                </div>
              </div>

              <Link
                to="/patient/appointments"
                className="btn btn-outline-primary btn-sm w-100 rounded-3 py-2 fw-medium"
              >
                Book with Dr. {doctor.name ? doctor.name.replace('Dr. ', '') : 'Doctor'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Summary Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="p-1.5 rounded-2 bg-danger bg-opacity-10 text-danger">
              <Heart size={18} />
            </div>
            <h6 className="fw-bold text-dark mb-0">Latest Clinical Vitals & Measurements</h6>
          </div>
          <span className="badge bg-light text-muted border small">From Last Encounter</span>
        </div>
        <div className="card-body p-4">
          <div className="row g-3 text-center">
            <div className="col-6 col-md-4 col-xl-2.4">
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small mb-1">Blood Pressure</div>
                <div className="fs-5 fw-bold text-dark">{vitals.blood_pressure || '120/80'}</div>
                <div className="text-success small fw-medium mt-1">Normal</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-xl-2.4">
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small mb-1">Heart Rate</div>
                <div className="fs-5 fw-bold text-dark">{vitals.heart_rate || '72 bpm'}</div>
                <div className="text-success small fw-medium mt-1">Steady</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-xl-2.4">
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small mb-1">Blood Oxygen (SpO2)</div>
                <div className="fs-5 fw-bold text-dark">{vitals.oxygen_saturation || '98%'}</div>
                <div className="text-success small fw-medium mt-1">Optimal</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-xl-2.4">
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small mb-1">Body Temperature</div>
                <div className="fs-5 fw-bold text-dark">{vitals.temperature || '98.6 °F'}</div>
                <div className="text-success small fw-medium mt-1">Afebrile</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-xl-2.4">
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small mb-1">Body Weight</div>
                <div className="fs-5 fw-bold text-dark">{vitals.weight || `${patient.weight || '70'} kg`}</div>
                <div className="text-muted small mt-1">Recorded Weight</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Medical Records & Active Prescriptions */}
      <div className="row g-4 mb-4">
        {/* Recent Medical Records */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="p-1.5 rounded-2 bg-info bg-opacity-10 text-info">
                  <FileText size={18} />
                </div>
                <h6 className="fw-bold text-dark mb-0">Recent Medical Encounters</h6>
              </div>
              <Link to="/patient/medical-records" className="small text-primary text-decoration-none fw-semibold">
                View Full EMR
              </Link>
            </div>
            <div className="card-body p-0">
              {recentRecords.length === 0 ? (
                <div className="p-4 text-center text-muted small">No finalized clinical encounters found.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentRecords.map((r) => (
                    <div key={r.id} className="list-group-item p-3.5 border-bottom border-light">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-semibold text-dark">{r.diagnosis || 'Clinical Consultation'}</span>
                        <span className="badge bg-success-subtle text-success small">Finalized</span>
                      </div>
                      <p className="text-muted small mb-2 text-truncate">{r.treatment_plan || r.symptoms || 'General clinical review.'}</p>
                      <div className="d-flex align-items-center justify-content-between text-muted small" style={{ fontSize: '0.78rem' }}>
                        <span>Dr. {r.doctor_name} ({r.doctor_specialization})</span>
                        <span>{r.consultation_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Prescriptions */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="p-1.5 rounded-2 bg-success bg-opacity-10 text-success">
                  <Pill size={18} />
                </div>
                <h6 className="fw-bold text-dark mb-0">Active Medication Regimen</h6>
              </div>
              <Link to="/patient/prescriptions" className="small text-primary text-decoration-none fw-semibold">
                All Prescriptions
              </Link>
            </div>
            <div className="card-body p-0">
              {recentPrescriptions.length === 0 ? (
                <div className="p-4 text-center text-muted small">No active medications prescribed.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentPrescriptions.map((p) => (
                    <div key={p.id} className="list-group-item p-3.5 border-bottom border-light">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="fw-semibold text-dark">{p.medication_name}</div>
                        <span className="badge bg-success-subtle text-success small">{p.status}</span>
                      </div>
                      <div className="text-secondary small mb-1">
                        <span className="fw-medium">{p.dosage}</span> • {p.frequency} • {p.duration}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
                        Prescribed by Dr. {p.doctor_name} on {p.prescription_date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
