import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  User,
  ShieldCheck,
  Check,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

export default function TopNavbar({ onToggleSidebar, onSearch, searchValue }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Map route to breadcrumb label
  const getBreadcrumb = () => {
    const path = location.pathname
    if (path.includes('/admin/patients')) return { section: 'Administration', page: 'Patients Directory' }
    if (path.includes('/admin/doctors')) return { section: 'Administration', page: 'Doctors & Physicians' }
    if (path.includes('/admin/appointments')) return { section: 'Administration', page: 'Appointments Schedule' }
    if (path.includes('/admin/medical-records')) return { section: 'Clinical', page: 'Medical Records' }
    if (path.includes('/admin/prescriptions')) return { section: 'Pharmacy', page: 'Prescriptions' }
    if (path.includes('/admin/reports')) return { section: 'Analytics', page: 'System Reports' }
    if (path.includes('/admin/settings')) return { section: 'System', page: 'Settings & Security' }
    return { section: 'Administration', page: 'System Overview' }
  }

  const breadcrumb = getBreadcrumb()

  const notifications = [
    {
      id: 1,
      title: 'New Patient Registration',
      desc: 'Patient "shravan" added to Cardiology department',
      time: '10m ago',
      icon: User,
      color: 'text-primary',
    },
    {
      id: 2,
      title: 'Appointment Scheduled',
      desc: 'Dr. Satya Deep has a scheduled consultation at 10:30 AM',
      time: '25m ago',
      icon: Calendar,
      color: 'text-info',
    },
    {
      id: 3,
      title: 'System Security Check',
      desc: 'Role-based authorization checks passed with 0 warnings',
      time: '1h ago',
      icon: ShieldCheck,
      color: 'text-success',
    },
  ]

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
              <span>{breadcrumb.section}</span>
              <ChevronRight size={12} />
              <span className="text-secondary fw-medium">{breadcrumb.page}</span>
            </div>
            <h1 className="h5 fw-bold text-dark mb-0 d-none d-sm-block">{breadcrumb.page}</h1>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="d-none d-md-block flex-grow-1 mx-4" style={{ maxWidth: 420 }}>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 ps-0"
              placeholder="Search patients, doctors, or records..."
              value={searchValue || ''}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            />
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="d-flex align-items-center gap-2">
          {/* Notification Bell */}
          <div className="position-relative">
            <button
              type="button"
              className="btn btn-light rounded-circle p-2 border position-relative"
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              title="Notifications"
            >
              <Bell size={18} className="text-secondary" />
              <span
                className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
                style={{ width: 8, height: 8 }}
              />
            </button>

            {/* Notification Panel Dropdown */}
            {showNotifications && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg border p-0"
                style={{ width: '320px', zIndex: 1050 }}
              >
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                  <h6 className="fw-bold mb-0">Notifications</h6>
                  <span className="badge bg-primary-subtle text-primary small">3 New</span>
                </div>
                <div className="py-1">
                  {notifications.map((n) => {
                    const Icon = n.icon
                    return (
                      <div
                        key={n.id}
                        className="px-3 py-2 border-bottom border-light-subtle hover-bg-light transition-all"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-start gap-2">
                          <Icon size={16} className={`${n.color} mt-1 flex-shrink-0`} />
                          <div className="flex-grow-1">
                            <span className="fw-semibold text-dark small d-block">
                              {n.title}
                            </span>
                            <span className="text-muted small d-block" style={{ fontSize: '0.78rem' }}>
                              {n.desc}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {n.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="p-2 text-center bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-primary text-decoration-none small p-0"
                    onClick={() => setShowNotifications(false)}
                  >
                    Close notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin User Avatar & Profile Dropdown */}
          <div className="position-relative">
            <button
              type="button"
              className="btn btn-light d-flex align-items-center gap-2 border p-1 pe-3 rounded-pill"
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
            >
              <div
                className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  fontSize: '0.78rem',
                }}
              >
                {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD')}
              </div>
              <div className="text-start d-none d-sm-block">
                <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.82rem', lineHeight: 1.2 }}>
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                  Super Admin
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg border p-2"
                style={{ width: '220px', zIndex: 1050 }}
              >
                <div className="px-3 py-2 border-bottom mb-1">
                  <span className="fw-bold text-dark d-block small">{user?.name || 'Admin'}</span>
                  <span className="text-muted small d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                    {user?.email || 'admin@healthpulse.com'}
                  </span>
                </div>
                <Link
                  to="/login"
                  className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-secondary hover-bg-light text-decoration-none"
                  onClick={() => setShowUserMenu(false)}
                >
                  <ExternalLink size={16} />
                  <span>Portal Selection Hub</span>
                </Link>
                <div className="dropdown-divider my-1"></div>
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-danger hover-bg-light border-0 bg-transparent w-100 text-start"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
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
