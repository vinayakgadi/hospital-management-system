import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { patientService } from '../../services/patientService.js'
import {
  Menu,
  Bell,
  ChevronRight,
  LogOut,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Heart,
  PlusCircle,
  FileText,
  Activity,
  Pill,
} from 'lucide-react'

export default function PatientTopbar({ onToggleSidebar, unreadCount, setUnreadCount }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  // Map route to breadcrumb label
  const getBreadcrumb = () => {
    const path = location.pathname
    if (path.includes('/patient/appointments')) return { section: 'Care Management', page: 'My Appointments' }
    if (path.includes('/patient/doctors')) return { section: 'Care Network', page: 'Find a Doctor' }
    if (path.includes('/patient/medical-records')) return { section: 'Health Chart', page: 'Medical Records' }
    if (path.includes('/patient/prescriptions')) return { section: 'Medications', page: 'My Prescriptions' }
    if (path.includes('/patient/lab-results')) return { section: 'Diagnostics', page: 'Lab Results' }
    if (path.includes('/patient/notifications')) return { section: 'Communications', page: 'Notifications' }
    if (path.includes('/patient/profile')) return { section: 'Account', page: 'My Health Profile' }
    if (path.includes('/patient/settings')) return { section: 'Security', page: 'Privacy & Security' }
    return { section: 'Patient Portal', page: 'Health Dashboard' }
  }

  const breadcrumb = getBreadcrumb()

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const list = await patientService.getNotifications({ filter: 'all' })
      const notifArray = Array.isArray(list) ? list : []
      setNotifications(notifArray.slice(0, 5))
      const unread = notifArray.filter((n) => !n.is_read).length
      if (setUnreadCount) setUnreadCount(unread)
    } catch (err) {
      console.warn('Failed to fetch patient notifications in topbar:', err)
    }
  }

  const handleMarkAsRead = async (e, notifId) => {
    e.stopPropagation()
    try {
      await patientService.markNotificationRead(notifId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      )
      if (setUnreadCount) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar size={14} className="text-primary" />
      case 'record':
        return <FileText size={14} className="text-info" />
      case 'lab':
        return <Activity size={14} className="text-warning" />
      case 'prescription':
        return <Pill size={14} className="text-success" />
      default:
        return <CheckCircle2 size={14} className="text-secondary" />
    }
  }

  return (
    <header
      className="bg-white border-bottom border-light-subtle sticky-top shadow-xs"
      style={{ height: '70px', zIndex: 1020 }}
    >
      <div className="container-fluid h-100 px-3 px-lg-4 d-flex align-items-center justify-content-between">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-light d-lg-none p-2 rounded-3 border"
            onClick={onToggleSidebar}
            aria-label="Open sidebar"
          >
            <Menu size={20} className="text-dark" />
          </button>

          <div className="d-none d-sm-flex align-items-center gap-2 text-muted small">
            <span className="fw-medium text-secondary">{breadcrumb.section}</span>
            <ChevronRight size={14} className="text-muted" />
            <span className="fw-semibold text-dark">{breadcrumb.page}</span>
          </div>
        </div>

        {/* Right: Quick Action, Notifications, User Menu */}
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          {/* Quick Action: Book Appointment */}
          <Link
            to="/patient/appointments"
            className="btn btn-primary btn-sm d-none d-md-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-medium shadow-xs"
            style={{ fontSize: '0.82rem', background: '#0284c7', borderColor: '#0284c7' }}
          >
            <PlusCircle size={15} />
            <span>Book Appointment</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="position-relative" ref={notifRef}>
            <button
              type="button"
              className="btn btn-light rounded-circle p-2 position-relative border"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell size={18} className="text-secondary" />
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                  style={{ fontSize: '0.65rem' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="position-absolute end-0 mt-2 card border-0 shadow-lg rounded-4 overflow-hidden"
                style={{ width: '320px', zIndex: 1050 }}
              >
                <div className="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
                  <div className="fw-semibold text-dark small">Recent Notifications</div>
                  <Link
                    to="/patient/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="small text-decoration-none text-primary"
                    style={{ fontSize: '0.75rem' }}
                  >
                    View All
                  </Link>
                </div>
                <div className="list-group list-group-flush" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted small">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotifications(false)
                          navigate('/patient/notifications')
                        }}
                        className={`list-group-item list-group-item-action p-3 d-flex align-items-start gap-2.5 border-bottom border-light ${
                          !n.is_read ? 'bg-light bg-opacity-75' : ''
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="p-1.5 bg-white rounded-circle shadow-xs mt-0.5">
                          {getNotifIcon(n.type)}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.8rem' }}>
                              {n.title}
                            </span>
                            {!n.is_read && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(e, n.id)}
                                className="btn btn-link p-0 text-muted hover-text-primary"
                                title="Mark read"
                              >
                                <span className="p-1 bg-primary rounded-circle d-inline-block" style={{ width: '6px', height: '6px' }} />
                              </button>
                            )}
                          </div>
                          <p className="text-muted mb-0 small text-truncate" style={{ fontSize: '0.74rem' }}>
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu Dropdown */}
          <div className="position-relative" ref={userMenuRef}>
            <button
              type="button"
              className="btn btn-light d-flex align-items-center gap-2 p-1.5 pe-2.5 rounded-pill border"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  fontSize: '0.8rem',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <span className="fw-medium text-dark small d-none d-sm-inline">
                {user?.name || 'Patient'}
              </span>
            </button>

            {showUserMenu && (
              <div
                className="position-absolute end-0 mt-2 card border-0 shadow-lg rounded-4 overflow-hidden py-1"
                style={{ width: '220px', zIndex: 1050 }}
              >
                <div className="px-3 py-2 border-bottom">
                  <div className="fw-semibold text-dark small text-truncate">{user?.name}</div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                    {user?.email}
                  </div>
                  <span className="badge bg-success-subtle text-success mt-1" style={{ fontSize: '0.65rem' }}>
                    Patient Account
                  </span>
                </div>

                <Link
                  to="/patient/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="dropdown-item px-3 py-2 small d-flex align-items-center gap-2 text-secondary"
                >
                  <User size={15} />
                  <span>My Health Profile</span>
                </Link>

                <Link
                  to="/patient/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="dropdown-item px-3 py-2 small d-flex align-items-center gap-2 text-secondary"
                >
                  <ShieldCheck size={15} />
                  <span>Privacy & Security</span>
                </Link>

                <div className="dropdown-divider my-1" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="dropdown-item px-3 py-2 small d-flex align-items-center gap-2 text-danger"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
