import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext.jsx'
import { API_BASE_URL } from '../../config.js'
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

export default function DoctorTopbar({ onToggleSidebar, searchValue, onSearch, unreadCount, setUnreadCount }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  // Map route to breadcrumb label
  const getBreadcrumb = () => {
    const path = location.pathname
    if (path.includes('/doctor/patients/')) return { section: 'Clinical', page: 'Patient Health Chart' }
    if (path.includes('/doctor/patients')) return { section: 'Clinical', page: 'My Patients Directory' }
    if (path.includes('/doctor/appointments')) return { section: 'Schedule', page: 'Appointment Management' }
    if (path.includes('/doctor/medical-records')) return { section: 'Documentation', page: 'Medical Records' }
    if (path.includes('/doctor/prescriptions')) return { section: 'Pharmacology', page: 'Prescriptions' }
    if (path.includes('/doctor/schedule')) return { section: 'Availability', page: 'Working Hours & Slots' }
    if (path.includes('/doctor/profile')) return { section: 'Credentials', page: 'Doctor Profile' }
    if (path.includes('/doctor/notifications')) return { section: 'Clinical Updates', page: 'Notifications' }
    if (path.includes('/doctor/settings')) return { section: 'Security', page: 'Doctor Settings' }
    return { section: 'Clinical', page: 'Physician Overview' }
  }

  const breadcrumb = getBreadcrumb()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true)
      const res = await axios.get(`${API_BASE_URL}/api/doctor/notifications`)
      const list = Array.isArray(res.data) ? res.data : (res.data.notifications || [])
      setNotifications(list)
      const unread = list.filter((n) => !n.is_read).length
      if (setUnreadCount) setUnreadCount(unread)
    } catch (err) {
      console.warn('Failed to fetch doctor notifications in topbar:', err)
    } finally {
      setLoadingNotifs(false)
    }
  }

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/doctor/notifications/${notifId}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: 1 } : n))
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

          <div>
            <div className="d-flex align-items-center gap-1 text-muted small" style={{ fontSize: '0.78rem' }}>
              <span>Doctor Portal</span>
              <ChevronRight size={12} />
              <span className="text-secondary">{breadcrumb.section}</span>
            </div>
            <h1 className="h6 mb-0 fw-bold text-dark">{breadcrumb.page}</h1>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="d-none d-md-flex align-items-center flex-grow-1 max-w-md mx-4" style={{ maxWidth: '340px' }}>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted rounded-start-pill ps-3">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 rounded-end-pill py-2"
              placeholder="Search patients, records..."
              value={searchValue || ''}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Right: Notification & Doctor Profile */}
        <div className="d-flex align-items-center gap-2 gap-lg-3">
          {/* Notifications Dropdown */}
          <div className="position-relative">
            <button
              type="button"
              className="btn btn-light rounded-circle p-2 position-relative border"
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              aria-label="View notifications"
            >
              <Bell size={18} className="text-secondary" />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.62rem' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-0 overflow-hidden"
                style={{ width: '330px', zIndex: 1050 }}
              >
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                  <span className="fw-semibold small text-dark">Clinical Notifications</span>
                  <span className="badge bg-primary-subtle text-primary small">
                    {unreadCount || 0} New
                  </span>
                </div>
                <div className="list-group list-group-flush" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted small">
                      <CheckCircle2 size={24} className="text-success mb-2 d-block mx-auto" />
                      No recent notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`list-group-item list-group-item-action p-2.5 d-flex align-items-start gap-2.5 ${
                          !n.is_read ? 'bg-light-subtle' : ''
                        }`}
                      >
                        <div
                          className="p-1.5 rounded-circle flex-shrink-0 mt-1"
                          style={{
                            backgroundColor:
                              n.type === 'alert'
                                ? '#fee2e2'
                                : n.type === 'appointment'
                                ? '#e0f2fe'
                                : '#f0fdf4',
                            color:
                              n.type === 'alert'
                                ? '#dc2626'
                                : n.type === 'appointment'
                                ? '#0284c7'
                                : '#16a34a',
                          }}
                        >
                          <Clock size={14} />
                        </div>
                        <div className="flex-grow-1 overflow-hidden" style={{ fontSize: '0.8rem' }}>
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="fw-semibold text-truncate text-dark">{n.title}</span>
                            {!n.is_read && (
                              <button
                                className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => handleMarkAsRead(n.id)}
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <div className="text-muted text-truncate">{n.message}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {n.created_at}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 text-center border-top bg-light">
                  <Link
                    to="/doctor/notifications"
                    className="small text-primary text-decoration-none fw-semibold"
                    onClick={() => setShowNotifications(false)}
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="position-relative">
            <button
              type="button"
              className="btn d-flex align-items-center gap-2 p-1.5 rounded-pill border bg-white hover-bg-light"
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
            >
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '34px',
                  height: '34px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  fontSize: '0.85rem',
                }}
              >
                <Stethoscope size={16} />
              </div>
              <div className="d-none d-lg-block text-start me-2">
                <span className="d-block fw-semibold text-dark text-truncate" style={{ fontSize: '0.82rem', maxWidth: '140px' }}>
                  {user?.name || 'Dr. Satya Deep'}
                </span>
                <span className="badge bg-primary-subtle text-primary text-uppercase px-1.5 py-0" style={{ fontSize: '0.62rem' }}>
                  Physician
                </span>
              </div>
            </button>

            {showUserMenu && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2"
                style={{ width: '220px', zIndex: 1050 }}
              >
                <div className="px-3 py-2 border-bottom mb-1">
                  <div className="fw-semibold text-dark small">{user?.name || 'Dr. Satya Deep'}</div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                    {user?.email || 'dr.satyadeep@healthpulse.com'}
                  </div>
                </div>

                <Link
                  to="/doctor/profile"
                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-secondary"
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={15} />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/doctor/settings"
                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-secondary"
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => setShowUserMenu(false)}
                >
                  <ShieldCheck size={15} />
                  <span>Account & Password</span>
                </Link>

                <div className="dropdown-divider my-1" />

                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-danger"
                  style={{ fontSize: '0.82rem' }}
                  onClick={handleLogout}
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
