import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'
import { Calendar, Clock, User, Stethoscope, CheckCircle2, XCircle, Clock4, MoreHorizontal } from 'lucide-react'

export default function UpcomingAppointments({ refreshTrigger, onScheduleNew }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchUpcoming = () => {
    setLoading(true)
    axios
      .get(`${API_BASE_URL}/api/admin/dashboard/upcoming-appointments`)
      .then((res) => {
        setAppointments(Array.isArray(res.data) ? res.data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load upcoming appointments:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchUpcoming()
  }, [refreshTrigger])

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId)
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        status: newStatus,
      })
      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? { ...app, status: newStatus } : app))
      )
    } catch (err) {
      console.error('Failed to update appointment status:', err)
    } finally {
      setUpdatingId(null)
    }
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
    <div className="card border-0 shadow-sm rounded-4 bg-white h-100" style={{ border: '1px solid #e2e8f0' }}>
      <div className="card-body p-4 d-flex flex-column">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-3 bg-purple-50" style={{ backgroundColor: '#ede9fe', color: '#8b5cf6' }}>
              <Calendar size={18} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Upcoming Appointments</h5>
              <small className="text-muted">Clinical visit schedule</small>
            </div>
          </div>
          {onScheduleNew && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-3"
              onClick={onScheduleNew}
            >
              + New
            </button>
          )}
        </div>

        {/* List / Table */}
        <div className="flex-grow-1 overflow-y-auto" style={{ maxHeight: '380px' }}>
          {loading ? (
            <div className="text-center py-4 text-muted small">
              <div className="spinner-border text-info spinner-border-sm me-2" role="status"></div>
              Loading upcoming appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-5 text-muted small">
              No appointments scheduled for upcoming dates.
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {appointments.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="p-3 rounded-3 border bg-light d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2"
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                        {app.patient_name || `Patient #${app.patient_id}`}
                      </span>
                      <span className={`badge rounded-pill px-2 py-0.5 ${getStatusBadge(app.status)}`} style={{ fontSize: '0.68rem' }}>
                        {app.status}
                      </span>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-3 text-muted small" style={{ fontSize: '0.78rem' }}>
                      <span className="d-flex align-items-center gap-1">
                        <Stethoscope size={13} className="text-primary" />
                        <span>Dr. {app.doctor_name || 'Assigned Doctor'}</span>
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={13} className="text-secondary" />
                        <span>{app.appointment_date} at {app.appointment_time}</span>
                      </span>
                    </div>
                  </div>

                  {/* Quick status switch dropdown/buttons */}
                  <div className="d-flex align-items-center gap-1 self-end self-sm-center">
                    {app.status === 'Scheduled' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success rounded-pill px-2 py-0.5"
                          style={{ fontSize: '0.72rem' }}
                          title="Mark Completed"
                          disabled={updatingId === app.id}
                          onClick={() => handleStatusChange(app.id, 'Completed')}
                        >
                          <CheckCircle2 size={12} className="me-1" />
                          Complete
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-2 py-0.5"
                          style={{ fontSize: '0.72rem' }}
                          title="Cancel Appointment"
                          disabled={updatingId === app.id}
                          onClick={() => handleStatusChange(app.id, 'Cancelled')}
                        >
                          <XCircle size={12} className="me-1" />
                          Cancel
                        </button>
                      </>
                    )}
                    {app.status !== 'Scheduled' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0.5"
                        style={{ fontSize: '0.72rem' }}
                        disabled={updatingId === app.id}
                        onClick={() => handleStatusChange(app.id, 'Scheduled')}
                      >
                        Reset to Scheduled
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
