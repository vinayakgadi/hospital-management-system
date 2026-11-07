import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'
import ScheduleAppointmentModal from '../../components/modals/ScheduleAppointmentModal.jsx'
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Filter,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [toast, setToast] = useState(null)

  // Server-side pagination
  const [page, setPage] = useState(1)
  const [perPage] = useState(15)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Fetch paginated appointments from server with cancellation
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const params = {
      page,
      per_page: perPage,
      search: debouncedSearch,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    }

    axios
      .get(`${API_BASE_URL}/api/appointments`, {
        params,
        signal: controller.signal,
      })
      .then((res) => {
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          setAppointments(res.data.appointments || [])
          setTotalCount(res.data.total || 0)
          setTotalPages(res.data.total_pages || 1)
        } else if (Array.isArray(res.data)) {
          setAppointments(res.data)
          setTotalCount(res.data.length)
          setTotalPages(1)
        }
        setLoading(false)
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          return
        }
        console.error('Failed to load appointments:', err)
        setError('Unable to load appointments schedule.')
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [page, perPage, debouncedSearch, statusFilter])

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId)
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        status: newStatus,
      })
      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? { ...app, status: newStatus } : app))
      )
      showToast(`Appointment status updated to ${newStatus}`)
    } catch (err) {
      console.error('Failed to update status:', err)
      showToast('Failed to update appointment status.', 'danger')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAppointmentScheduled = () => {
    setPage(1)
    showToast(`Appointment scheduled successfully!`)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-success-subtle text-success border border-success-subtle'
      case 'Cancelled':
        return 'bg-danger-subtle text-danger border border-danger-subtle'
      default:
        return 'bg-primary-subtle text-primary border border-primary-subtle'
    }
  }

  return (
    <div>
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
              <strong className="d-block small">
                {toast.type === 'danger' ? 'Error' : 'Success'}
              </strong>
              <small>{toast.message}</small>
            </div>
            <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={() => setToast(null)} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">Appointments Schedule</h2>
          <p className="text-muted small mb-0">
            {totalCount} total booked consultation{totalCount === 1 ? '' : 's'} across all departments
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1"
            onClick={() => setPage(1)}
            title="Refresh schedule"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-primary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1 shadow-xs fw-semibold"
            onClick={() => setIsScheduleOpen(true)}
          >
            <Plus size={16} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4" style={{ border: '1px solid #e2e8f0' }}>
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by patient, physician, or reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status Buttons */}
          <div className="col-12 col-md-6">
            <div className="btn-group w-100 p-1 bg-light rounded-pill border" role="group">
              {['ALL', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`btn rounded-pill px-2 py-1 small fw-medium ${
                    statusFilter === st ? 'btn-primary' : 'btn-light border-0 text-secondary'
                  }`}
                  onClick={() => {
                    setStatusFilter(st)
                    setPage(1)
                  }}
                >
                  {st === 'ALL' ? 'All Statuses' : st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h6 className="text-muted fw-normal">Retrieving appointment schedule...</h6>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="alert alert-danger rounded-4 p-4 shadow-sm text-center" role="alert">
          <AlertCircle size={32} className="text-danger mb-2" />
          <h5 className="alert-heading fw-semibold">Error Loading Appointments</h5>
          <p className="text-muted mb-3">{error}</p>
          <button className="btn btn-outline-danger rounded-pill px-4 btn-sm" onClick={() => setPage(1)}>
            Try Again
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4" style={{ border: '1px solid #e2e8f0' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th scope="col" className="text-muted fw-semibold ps-4">Appt ID</th>
                  <th scope="col" className="text-muted fw-semibold">Patient</th>
                  <th scope="col" className="text-muted fw-semibold">Attending Doctor</th>
                  <th scope="col" className="text-muted fw-semibold">Date & Time</th>
                  <th scope="col" className="text-muted fw-semibold">Clinical Reason</th>
                  <th scope="col" className="text-muted fw-semibold">Status</th>
                  <th scope="col" className="text-muted fw-semibold text-end pe-4">Update Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No appointments found matching current filters.
                    </td>
                  </tr>
                ) : (
                  appointments.map((app) => (
                    <tr key={app.id}>
                      <td className="ps-4 fw-medium text-muted">#{app.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0"
                            style={{
                              width: 32,
                              height: 32,
                              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                              fontSize: '0.75rem',
                            }}
                          >
                            {(app.patient_name || 'P').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.85rem' }}>
                              {app.patient_name}
                            </span>
                            <small className="text-muted">ID: #{app.patient_id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5">
                          <Stethoscope size={14} className="text-primary flex-shrink-0" />
                          <span className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>
                            {app.doctor_name}
                          </span>
                        </div>
                        {app.doctor_specialization && (
                          <small className="text-muted d-block ps-4">{app.doctor_specialization}</small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1 text-dark" style={{ fontSize: '0.85rem' }}>
                          <Calendar size={13} className="text-muted" />
                          <span>{app.appointment_date}</span>
                        </div>
                        <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.75rem' }}>
                          <Clock size={12} />
                          <span>{app.appointment_time}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-dark small d-inline-block text-truncate" style={{ maxWidth: '180px' }}>
                          {app.reason}
                        </span>
                      </td>
                      <td>
                        <span className={`badge rounded-pill px-2.5 py-1 small fw-medium ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex align-items-center gap-1">
                          {app.status === 'Scheduled' && (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success rounded-pill px-2 py-1 small d-inline-flex align-items-center gap-1"
                                disabled={updatingId === app.id}
                                onClick={() => handleStatusChange(app.id, 'Completed')}
                              >
                                <CheckCircle2 size={13} />
                                <span>Complete</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1 small d-inline-flex align-items-center gap-1"
                                disabled={updatingId === app.id}
                                onClick={() => handleStatusChange(app.id, 'Cancelled')}
                              >
                                <XCircle size={13} />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                          {app.status !== 'Scheduled' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1 small"
                              disabled={updatingId === app.id}
                              onClick={() => handleStatusChange(app.id, 'Scheduled')}
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && !error && totalPages > 1 && (
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mt-4 px-2">
          <small className="text-muted">
            Showing Page <span className="fw-bold text-dark">{page}</span> of{' '}
            <span className="fw-bold text-dark">{totalPages}</span> ({totalCount} total appointments)
          </small>

          <div className="btn-group shadow-xs">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 px-3"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 px-3"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <ScheduleAppointmentModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onAppointmentScheduled={handleAppointmentScheduled}
      />
    </div>
  )
}
