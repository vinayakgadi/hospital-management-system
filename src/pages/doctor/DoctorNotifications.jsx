import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Check,
  RefreshCw,
  MailOpen,
  Filter,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'read'
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_BASE_URL}/api/doctor/notifications`)
      setNotifications(Array.isArray(res.data) ? res.data : (res.data.notifications || []))
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setError(err.response?.data?.error || 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/doctor/notifications/${notifId}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: 1 } : n))
      )
      showToast('Notification marked as read')
    } catch (err) {
      console.error('Failed to mark read:', err)
      showToast('Failed to mark notification read.', 'danger')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/doctor/notifications/read-all`)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
      showToast('All notifications marked as read!')
    } catch (err) {
      console.error('Failed to mark all read:', err)
      showToast('Failed to update notifications.', 'danger')
    }
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read') return n.is_read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

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
          <h1 className="h4 fw-bold text-dark mb-1">Clinical Notifications & Alerts</h1>
          <p className="text-muted small mb-0">
            Real-time updates regarding patient appointments, critical alerts, and prescription dispatches.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchNotifications}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3"
            >
              <Check size={16} />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card border-0 rounded-4 shadow-xs bg-white mb-4">
        <div className="card-body p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="btn-group btn-group-sm">
            {[
              { key: 'all', label: `All (${notifications.length})` },
              { key: 'unread', label: `Unread (${unreadCount})` },
              { key: 'read', label: `Read (${notifications.length - unreadCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`btn py-2 px-3 ${filter === tab.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-muted small">
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </span>
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
            <span className="visually-hidden">Loading notifications...</span>
          </div>
          <p className="text-muted small mb-0">Loading clinical alerts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center">
          <CheckCircle2 size={48} className="text-success mx-auto mb-3" />
          <h5 className="fw-bold text-dark">All Caught Up!</h5>
          <p className="text-muted small mb-0">
            {filter === 'unread'
              ? 'You have no unread notifications.'
              : 'There are no notifications in this category.'}
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2.5">
          {filtered.map((n) => {
            const isAlert = n.type === 'alert'
            const isAppointment = n.type === 'appointment'
            return (
              <div
                key={n.id}
                className={`card border rounded-4 shadow-xs transition-all ${
                  !n.is_read ? 'bg-white border-primary-subtle' : 'bg-light-subtle'
                }`}
              >
                <div className="card-body p-3.5 d-flex align-items-start justify-content-between gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="p-2.5 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: isAlert ? '#fee2e2' : isAppointment ? '#e0f2fe' : '#f0fdf4',
                        color: isAlert ? '#dc2626' : isAppointment ? '#0284c7' : '#16a34a',
                      }}
                    >
                      {isAlert ? <AlertCircle size={18} /> : isAppointment ? <Calendar size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <h6 className="fw-bold text-dark mb-0">{n.title}</h6>
                        {!n.is_read && (
                          <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>
                            NEW
                          </span>
                        )}
                        <span className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>
                          {n.type}
                        </span>
                      </div>
                      <p className="text-secondary small mb-1">{n.message}</p>
                      <small className="text-muted d-flex align-items-center gap-1">
                        <Clock size={12} /> {n.created_at}
                      </small>
                    </div>
                  </div>

                  {!n.is_read && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-3 py-1 px-2.5 flex-shrink-0"
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
