import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { patientService } from '../../services/patientService.js'
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Activity,
  Pill,
  Clock,
  CheckCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

export default function PatientNotifications() {
  const navigate = useNavigate()
  const context = useOutletContext()
  const setUnreadCount = context?.setUnreadCount

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await patientService.getNotifications({ filter: filterType })
      const list = Array.isArray(data) ? data : []
      setNotifications(list)
      const unread = list.filter((n) => !n.is_read).length
      if (setUnreadCount) setUnreadCount(unread)
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setError('Unable to load communications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [filterType])

  const handleMarkAsRead = async (id) => {
    try {
      await patientService.markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      if (setUnreadCount) setUnreadCount((c) => Math.max(0, c - 1))
      showToast('Notification marked as read.')
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await patientService.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      if (setUnreadCount) setUnreadCount(0)
      showToast('All notifications marked as read.')
    } catch (err) {
      console.error('Failed to mark all read:', err)
      showToast('Failed to mark all as read.', 'danger')
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar size={18} className="text-primary" />
      case 'record':
        return <FileText size={18} className="text-info" />
      case 'lab':
        return <Activity size={18} className="text-warning" />
      case 'prescription':
        return <Pill size={18} className="text-success" />
      default:
        return <Bell size={18} className="text-secondary" />
    }
  }

  return (
    <div>
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
            <span className="small fw-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Patient Communications & Alerts</h4>
          <p className="text-muted small mb-0">
            Real-time updates regarding appointment confirmations, lab results, and physician notes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-2 rounded-3 shadow-xs"
        >
          <CheckCheck size={16} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="nav nav-pills gap-1">
            <button
              type="button"
              className={`nav-link rounded-3 px-3.5 py-1.5 small fw-medium ${
                filterType === 'all' ? 'active bg-primary' : 'text-secondary bg-light'
              }`}
              onClick={() => setFilterType('all')}
            >
              All Alerts
            </button>
            <button
              type="button"
              className={`nav-link rounded-3 px-3.5 py-1.5 small fw-medium ${
                filterType === 'unread' ? 'active bg-primary' : 'text-secondary bg-light'
              }`}
              onClick={() => setFilterType('unread')}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Loading notifications...</span>
          </div>
          <p className="text-muted small">Loading communications...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 p-4 shadow-sm d-flex align-items-center gap-3">
          <AlertCircle size={24} className="text-danger flex-shrink-0" />
          <div className="flex-grow-1">
            <div className="fw-semibold">{error}</div>
            <button onClick={loadNotifications} className="btn btn-outline-danger btn-sm rounded-3 mt-2">
              <RefreshCw size={13} className="me-1" /> Retry
            </button>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <Bell size={44} className="text-muted opacity-50 mx-auto mb-3" />
          <h6 className="fw-bold text-dark mb-1">No notifications found</h6>
          <p className="text-muted small mb-0">
            {filterType === 'unread'
              ? 'You have caught up with all your clinical notifications!'
              : 'You do not have any notifications registered.'}
          </p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="list-group list-group-flush">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`list-group-item p-4 d-flex align-items-start gap-3 border-bottom border-light transition-all ${
                  !notif.is_read ? 'bg-light bg-opacity-50' : ''
                }`}
              >
                <div className="p-2.5 bg-white rounded-3 shadow-xs border mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <span>{notif.title}</span>
                      {!notif.is_read && (
                        <span className="badge bg-primary-subtle text-primary small" style={{ fontSize: '0.65rem' }}>
                          New
                        </span>
                      )}
                    </h6>
                    <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: '0.75rem' }}>
                      <Clock size={13} />
                      <span>{notif.created_at ? String(notif.created_at).substring(0, 16) : 'Recent'}</span>
                    </div>
                  </div>

                  <p className="text-secondary small mb-2">{notif.message}</p>

                  <div className="d-flex align-items-center gap-3">
                    {notif.link && (
                      <button
                        type="button"
                        onClick={() => navigate(notif.link)}
                        className="btn btn-link p-0 text-primary small text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <span>View Details</span>
                        <ExternalLink size={12} />
                      </button>
                    )}

                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="btn btn-link p-0 text-muted small text-decoration-none"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
