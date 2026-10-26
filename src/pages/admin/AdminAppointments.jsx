import { useState, useEffect, useMemo } from 'react'
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
} from 'lucide-react'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchAppointments = () => {
    setLoading(true)
    setError(null)
    axios
      .get(`${API_BASE_URL}/api/appointments`)
      .then((res) => {
        setAppointments(Array.isArray(res.data) ? res.data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load appointments:', err)
        setError('Unable to load appointments schedule.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

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

  const handleAppointmentScheduled = (newApp) => {
    fetchAppointments()
    showToast(`Appointment scheduled successfully!`)
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const matchStatus = statusFilter === 'ALL' || app.status === statusFilter
      const matchSearch =
        (app.patient_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (app.doctor_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (app.reason || '').toLowerCase().includes(search.toLowerCase())

      return matchStatus && matchSearch
    })
  }, [appointments, statusFilter, search])

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
            Clinical consultations, patient visits, and physician schedules
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1"
            onClick={fetchAppointments}
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

      {/* Filters */}
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
                  onClick={() => setStatusFilter(st)}
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
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No appointments match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((app) => (
                    <tr key={app.id}>
                      <td className="ps-4 text-muted fw-medium">#{app.id}</td>
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
                          <span className="fw-semibold text-dark">{app.patient_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="fw-medium text-dark d-block" style={{ fontSize: '0.85rem' }}>
                          Dr. {app.doctor_name}
                        </span>
                        <small className="text-muted">{app.doctor_specialization || 'General Care'}</small>
                      </td>
                      <td>
                        <span className="d-block fw-medium text-dark" style={{ fontSize: '0.85rem' }}>
                          {app.appointment_date}
                        </span>
                        <small className="text-muted">{app.appointment_time}</small>
                      </td>
                      <td>
                        <span className="text-secondary small">{app.reason || 'Routine Consultation'}</span>
                      </td>
                      <td>
                        <span className={`badge rounded-pill px-2.5 py-1 ${getStatusBadge(app.status)}`}>
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

      {/* Modal */}
      <ScheduleAppointmentModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onAppointmentScheduled={handleAppointmentScheduled}
      />
    </div>
  )
}
