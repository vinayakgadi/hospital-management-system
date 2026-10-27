import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  User,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState('all') // 'today' | 'upcoming' | 'past' | 'all'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'Scheduled' | 'Completed' | 'Cancelled'
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_BASE_URL}/api/doctor/appointments`, {
        params: {
          filter: dateFilter,
          status: statusFilter,
          search: search,
        },
      })
      setAppointments(Array.isArray(res.data) ? res.data : (res.data.appointments || []))
    } catch (err) {
      console.error('Failed to load doctor appointments:', err)
      setError(err.response?.data?.error || 'Failed to load appointment schedule.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAppointments()
    }, 250)
    return () => clearTimeout(delayDebounce)
  }, [dateFilter, statusFilter, search])

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      setActionLoading(apptId)
      await axios.put(`${API_BASE_URL}/api/appointments/${apptId}/status`, {
        status: newStatus,
      })
      showToast(`Appointment status updated to ${newStatus}`)
      fetchAppointments()
    } catch (err) {
      console.error('Failed to update status:', err)
      showToast('Failed to update status.', 'danger')
    } finally {
      setActionLoading(null)
    }
  }

  // Calculate quick metrics
  const totalCount = appointments.length
  const scheduledCount = appointments.filter((a) => a.status === 'Scheduled').length
  const completedCount = appointments.filter((a) => a.status === 'Completed').length
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length

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

      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Appointment Schedule</h1>
          <p className="text-muted small mb-0">
            Manage your patient consultation bookings, review upcoming sessions, and record visit outcomes.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={fetchAppointments}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-3.5 d-flex align-items-center gap-3">
              <div className="p-3 rounded-3 text-primary" style={{ backgroundColor: '#e0f2fe' }}>
                <Calendar size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Total Consultations</span>
                <h4 className="fw-bold mb-0 text-dark">{totalCount}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-3.5 d-flex align-items-center gap-3">
              <div className="p-3 rounded-3 text-info" style={{ backgroundColor: '#cffafe' }}>
                <Clock size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Scheduled / Pending</span>
                <h4 className="fw-bold mb-0 text-dark">{scheduledCount}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-3.5 d-flex align-items-center gap-3">
              <div className="p-3 rounded-3 text-success" style={{ backgroundColor: '#dcfce7' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Completed</span>
                <h4 className="fw-bold mb-0 text-dark">{completedCount}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-3.5 d-flex align-items-center gap-3">
              <div className="p-3 rounded-3 text-danger" style={{ backgroundColor: '#fee2e2' }}>
                <XCircle size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Cancelled</span>
                <h4 className="fw-bold mb-0 text-dark">{cancelledCount}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Date Tabs Bar */}
      <div className="card border-0 rounded-4 shadow-xs bg-white mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Date filter tabs */}
            <div className="col-12 col-lg-5">
              <div className="btn-group btn-group-sm w-100">
                {[
                  { key: 'all', label: 'All Dates' },
                  { key: 'today', label: 'Today' },
                  { key: 'upcoming', label: 'Upcoming' },
                  { key: 'past', label: 'Past' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`btn py-2 ${dateFilter === item.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setDateFilter(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filter */}
            <div className="col-12 col-md-6 col-lg-3">
              <select
                className="form-select bg-light py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="all">All Statuses</option>
                <option value="Scheduled">Scheduled Only</option>
                <option value="Completed">Completed Only</option>
                <option value="Cancelled">Cancelled Only</option>
              </select>
            </div>

            {/* Search */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted ps-3">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 py-2"
                  placeholder="Search by patient name or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="alert alert-danger rounded-4 d-flex align-items-center gap-2 p-3 mb-4" role="alert">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-3" role="status">
            <span className="visually-hidden">Loading appointments...</span>
          </div>
          <p className="text-muted small mb-0">Retrieving appointment schedule...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center">
          <Calendar size={48} className="text-muted mx-auto mb-3" />
          <h5 className="fw-bold text-dark">No Appointments Found</h5>
          <p className="text-muted small mb-3">
            {search || dateFilter !== 'all' || statusFilter !== 'all'
              ? 'No appointments match the selected filters.'
              : 'You do not have any appointments scheduled currently.'}
          </p>
          {(search || dateFilter !== 'all' || statusFilter !== 'all') && (
            <div>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm rounded-3"
                onClick={() => {
                  setDateFilter('all')
                  setStatusFilter('all')
                  setSearch('')
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card border-0 rounded-4 shadow-xs bg-white overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="text-secondary small">
                  <th className="ps-4">Date & Time</th>
                  <th>Patient</th>
                  <th>Clinical Reason</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => {
                  const isScheduled = a.status === 'Scheduled'
                  const isCompleted = a.status === 'Completed'
                  const isCancelled = a.status === 'Cancelled'
                  return (
                    <tr key={a.id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark small">{a.appointment_date}</div>
                        <div className="small text-muted d-flex align-items-center gap-1">
                          <Clock size={13} className="text-primary" />
                          <span>{a.appointment_time}</span>
                        </div>
                      </td>
                      <td>
                        <Link
                          to={`/doctor/patients/${a.patient_id}`}
                          className="fw-bold text-dark text-decoration-none hover-primary d-block"
                        >
                          {a.patient_name}
                        </Link>
                        <small className="text-muted">{a.patient_email}</small>
                      </td>
                      <td>
                        <span className="small text-dark">{a.reason || 'General Consultation'}</span>
                      </td>
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
                          {a.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <Link
                            to={`/doctor/patients/${a.patient_id}`}
                            className="btn btn-outline-secondary btn-sm rounded-3 d-inline-flex align-items-center gap-1 py-1 px-2.5"
                            title="Open patient medical chart"
                          >
                            <Eye size={14} />
                            <span>Chart</span>
                          </Link>

                          {isScheduled && (
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-success py-1 px-2.5"
                                disabled={actionLoading === a.id}
                                onClick={() => handleUpdateStatus(a.id, 'Completed')}
                              >
                                Complete
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger py-1 px-2.5"
                                disabled={actionLoading === a.id}
                                onClick={() => handleUpdateStatus(a.id, 'Cancelled')}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
