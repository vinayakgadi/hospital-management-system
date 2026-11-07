import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
  ArrowUpRight,
  PlusCircle,
  FileText,
  Pill,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { useAuth } from '../../context/AuthContext.jsx'
import { API_BASE_URL } from '../../config.js'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_BASE_URL}/api/doctor/dashboard`)
      setData(res.data)
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err)
      setError(err.response?.data?.error || 'Unable to load clinical dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      setActionLoading(appointmentId)
      await axios.put(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        status: newStatus,
      })
      showToast(`Appointment status updated to ${newStatus}`)
      fetchDashboard()
    } catch (err) {
      console.error('Failed to update appointment:', err)
      showToast('Could not update appointment status.', 'danger')
    } finally {
      setActionLoading(null)
    }
  }

  const metrics = data?.metrics || {
    total_patients: 0,
    today_appointments: 0,
    completed_consultations: 0,
    pending_tasks: 0,
  }

  const doctor = data?.doctor || user || {}
  const todayAppointments = data?.today_appointments || []
  const recentActivity = data?.recent_activity || []
  const appointmentDistribution = data?.appointment_distribution || []
  const consultationTrends = data?.consultation_trends || []

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="container-fluid p-0">
      {/* Toast Alert */}
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
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div
        className="card border-0 rounded-4 shadow-xs mb-4 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0369a1 100%)',
        }}
      >
        <div className="card-body p-4 p-lg-5 position-relative z-1">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-cyan-subtle text-info px-3 py-1.5 rounded-pill font-monospace small">
                  Physician Workspace
                </span>
                <span className="badge bg-dark bg-opacity-50 text-white-50 px-2 py-1 rounded-pill small">
                  {currentDateStr}
                </span>
              </div>
              <h1 className="h3 fw-bold text-white mb-2">
                Welcome back, {doctor.name || 'Dr. Satya Deep'}
              </h1>
              <p className="text-white-50 mb-4 max-w-xl" style={{ maxWidth: '640px', fontSize: '0.92rem' }}>
                {doctor.specialization || 'Clinical Specialist'} • {doctor.qualifications || 'Lead Physician'}. You have{' '}
                <strong className="text-white">{metrics.today_appointments} appointments</strong> scheduled for today.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link
                  to="/doctor/appointments"
                  className="btn btn-primary d-inline-flex align-items-center gap-2 px-3.5 py-2 rounded-3 shadow-sm"
                  style={{ fontSize: '0.86rem' }}
                >
                  <Calendar size={16} />
                  <span>View Today's Schedule</span>
                </Link>
                <Link
                  to="/doctor/prescriptions"
                  className="btn btn-outline-light d-inline-flex align-items-center gap-2 px-3.5 py-2 rounded-3"
                  style={{ fontSize: '0.86rem' }}
                >
                  <Pill size={16} />
                  <span>Issue Prescription</span>
                </Link>
                <button
                  type="button"
                  onClick={fetchDashboard}
                  className="btn btn-link text-white-50 d-inline-flex align-items-center gap-1.5 px-3 py-2 text-decoration-none"
                  style={{ fontSize: '0.86rem' }}
                >
                  <RefreshCw size={15} className={loading ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            <div className="col-lg-4 text-center d-none d-lg-block">
              <div
                className="p-4 rounded-4 d-inline-block text-start border"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="text-uppercase text-white-50 small mb-1">Clinical Department</div>
                <div className="h5 fw-bold text-white mb-2">{doctor.specialization || 'Cardiology'}</div>
                <div className="d-flex align-items-center gap-2 text-success small">
                  <span className="p-1 rounded-circle bg-success" />
                  <span>Active Duty • Room 304</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        {/* Total Patients */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs h-100 bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small fw-medium">Assigned Patients</span>
                <div
                  className="p-2.5 rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ backgroundColor: '#e0f2fe' }}
                >
                  <Users size={20} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">{metrics.total_patients}</h3>
                <span className="text-success small fw-medium d-flex align-items-center">
                  <ArrowUpRight size={14} /> Active
                </span>
              </div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                Patients under your clinical care
              </div>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs h-100 bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small fw-medium">Today's Appointments</span>
                <div
                  className="p-2.5 rounded-3 d-flex align-items-center justify-content-center text-info"
                  style={{ backgroundColor: '#cffafe' }}
                >
                  <Calendar size={20} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">{metrics.today_appointments}</h3>
                <span className="badge bg-info-subtle text-info small">Today</span>
              </div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                Consultations booked for today
              </div>
            </div>
          </div>
        </div>

        {/* Completed Consultations */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs h-100 bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small fw-medium">Completed Encounters</span>
                <div
                  className="p-2.5 rounded-3 d-flex align-items-center justify-content-center text-success"
                  style={{ backgroundColor: '#dcfce7' }}
                >
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">{metrics.completed_consultations}</h3>
                <span className="text-success small fw-medium">Finished</span>
              </div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                Documented clinical consultations
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs h-100 bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small fw-medium">Pending Tasks</span>
                <div
                  className="p-2.5 rounded-3 d-flex align-items-center justify-content-center text-warning"
                  style={{ backgroundColor: '#fef3c7' }}
                >
                  <Clock size={20} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">{metrics.pending_tasks}</h3>
                <span className="badge bg-warning-subtle text-warning small">Pending</span>
              </div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                Follow-ups and scheduled visits
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="row g-4 mb-4">
        {/* Appointment Distribution */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 rounded-4 shadow-xs h-100 bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 className="fw-bold text-dark mb-1">Appointment Status Breakdown</h6>
                  <p className="text-muted small mb-0">Total volume across your scheduled consultations</p>
                </div>
                <span className="badge bg-light text-secondary border">Overall</span>
              </div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} barSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Consultation Trends */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 rounded-4 shadow-xs h-100 bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 className="fw-bold text-dark mb-1">Consultation Trends (Past 7 Days)</h6>
                  <p className="text-muted small mb-0">Daily patient encounter volumes</p>
                </div>
                <span className="badge bg-light text-secondary border">Last 7 Days</span>
              </div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consultationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConsults" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorConsults)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Appointments & Recent Activity */}
      <div className="row g-4">
        {/* Today's Appointments Table */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 className="fw-bold text-dark mb-1">Today's Appointment Schedule</h6>
                  <p className="text-muted small mb-0">Manage and update appointments for today</p>
                </div>
                <Link
                  to="/doctor/appointments"
                  className="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1"
                >
                  <span>All Appointments</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {todayAppointments.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <CheckCircle2 size={36} className="text-success mb-2 mx-auto d-block" />
                  <p className="fw-medium mb-1">No appointments scheduled for today</p>
                  <small className="text-muted">You have no remaining clinical visits booked today.</small>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle table-hover mb-0">
                    <thead className="table-light">
                      <tr className="text-secondary small">
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Condition / Reason</th>
                        <th>Status</th>
                        <th className="text-end">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAppointments.map((appt) => {
                        const isScheduled = appt.status === 'Scheduled'
                        const isCompleted = appt.status === 'Completed'
                        const isCancelled = appt.status === 'Cancelled'
                        return (
                          <tr key={appt.id}>
                            <td className="fw-semibold text-dark small">
                              <div className="d-flex align-items-center gap-1.5">
                                <Clock size={14} className="text-primary" />
                                <span>{appt.appointment_time}</span>
                              </div>
                            </td>
                            <td>
                              <Link
                                to={`/doctor/patients/${appt.patient_id}`}
                                className="fw-semibold text-dark text-decoration-none hover-primary d-block"
                              >
                                {appt.patient_name}
                              </Link>
                              <small className="text-muted">{appt.patient_email}</small>
                            </td>
                            <td className="small text-muted">{appt.reason || 'General Checkup'}</td>
                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  isCompleted
                                    ? 'bg-success-subtle text-success'
                                    : isCancelled
                                    ? 'bg-danger-subtle text-danger'
                                    : 'bg-primary-subtle text-primary'
                                }`}
                              >
                                {appt.status}
                              </span>
                            </td>
                            <td className="text-end">
                              {isScheduled ? (
                                <div className="btn-group btn-group-sm">
                                  <button
                                    type="button"
                                    className="btn btn-outline-success"
                                    disabled={actionLoading === appt.id}
                                    onClick={() => handleUpdateStatus(appt.id, 'Completed')}
                                  >
                                    Complete
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    disabled={actionLoading === appt.id}
                                    onClick={() => handleUpdateStatus(appt.id, 'Cancelled')}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <span className="small text-muted">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Shortcuts */}
        <div className="col-12 col-xl-4">
          {/* Quick Actions Card */}
          <div className="card border-0 rounded-4 shadow-xs bg-white mb-4">
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3">Quick Actions</h6>
              <div className="d-grid gap-2">
                <Link
                  to="/doctor/prescriptions"
                  className="btn btn-light text-start d-flex align-items-center justify-content-between p-3 rounded-3 border"
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <div className="p-2 rounded-2 bg-primary-subtle text-primary">
                      <Pill size={18} />
                    </div>
                    <div>
                      <div className="fw-semibold small text-dark">Issue Prescription</div>
                      <small className="text-muted">Create Rx for patient</small>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </Link>

                <Link
                  to="/doctor/medical-records"
                  className="btn btn-light text-start d-flex align-items-center justify-content-between p-3 rounded-3 border"
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <div className="p-2 rounded-2 bg-info-subtle text-info">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="fw-semibold small text-dark">Add Encounter Note</div>
                      <small className="text-muted">Document patient consultation</small>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </Link>

                <Link
                  to="/doctor/schedule"
                  className="btn btn-light text-start d-flex align-items-center justify-content-between p-3 rounded-3 border"
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <div className="p-2 rounded-2 bg-success-subtle text-success">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="fw-semibold small text-dark">Manage Schedule</div>
                      <small className="text-muted">Update working hours & slots</small>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </Link>
              </div>
            </div>
          </div>

          {/* Activity Stream */}
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold text-dark mb-0">Recent Activity</h6>
                <Activity size={18} className="text-muted" />
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center p-4 text-muted small">No recent activity logged</div>
              ) : (
                <div className="timeline position-relative">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="d-flex gap-3 mb-3 pb-2 border-bottom border-light">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor:
                            act.type === 'prescription'
                              ? '#e0f2fe'
                              : act.type === 'consultation'
                              ? '#dcfce7'
                              : '#fef3c7',
                          color:
                            act.type === 'prescription'
                              ? '#0284c7'
                              : act.type === 'consultation'
                              ? '#16a34a'
                              : '#d97706',
                        }}
                      >
                        {act.type === 'prescription' ? (
                          <Pill size={14} />
                        ) : act.type === 'consultation' ? (
                          <Stethoscope size={14} />
                        ) : (
                          <Calendar size={14} />
                        )}
                      </div>
                      <div className="overflow-hidden" style={{ fontSize: '0.82rem' }}>
                        <div className="fw-semibold text-dark text-truncate">{act.title}</div>
                        <div className="text-muted text-truncate">{act.description}</div>
                        <small className="text-muted">{act.timestamp}</small>
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
