import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  FileText,
  Pill,
  Activity,
  Bell,
  User,
  ShieldCheck,
  LogOut,
  HeartPulse,
  X,
  Heart,
} from 'lucide-react'

export default function PatientSidebar({ isOpen, onClose, unreadCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Dashboard', to: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'My Appointments', to: '/patient/appointments', icon: Calendar },
    { label: 'Find a Doctor', to: '/patient/doctors', icon: UserCheck },
    { label: 'Medical Records', to: '/patient/medical-records', icon: FileText },
    { label: 'My Prescriptions', to: '/patient/prescriptions', icon: Pill },
    { label: 'Lab Results', to: '/patient/lab-results', icon: Activity },
    { label: 'Notifications', to: '/patient/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { label: 'My Profile', to: '/patient/profile', icon: User },
    { label: 'Privacy & Security', to: '/patient/settings', icon: ShieldCheck },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar-nav d-flex flex-column position-fixed top-0 start-0 h-100 text-white ${
          isOpen ? 'show' : ''
        }`}
        style={{
          width: '260px',
          backgroundColor: '#0f172a',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 1045,
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Brand Header */}
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3 flex-shrink-0"
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            minHeight: '70px',
            height: '70px',
            boxSizing: 'border-box',
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-3 text-white d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <HeartPulse size={22} className="text-white" />
            </div>
            <div style={{ minWidth: 0 }}>
              <span className="fw-bold fs-5 text-white tracking-wide d-block leading-tight">
                Health<span style={{ color: '#34d399' }}>Pulse</span>
              </span>
              <span
                className="badge text-uppercase px-2 py-0.5 fw-semibold"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.04em',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                }}
              >
                Patient Portal
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-link text-white-50 p-1 d-lg-none"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Patient Profile Card */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <div className="sidebar-profile-card">
            <div
              className="rounded-circle text-white flex-shrink-0 d-flex align-items-center justify-content-center"
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)',
              }}
            >
              <Heart size={18} />
            </div>
            <div className="overflow-hidden flex-grow-1" style={{ minWidth: 0 }}>
              <div
                className="text-truncate fw-semibold text-white mb-0"
                style={{ fontSize: '0.86rem', lineHeight: 1.3 }}
                title={user?.name || 'Verified Patient'}
              >
                {user?.name || 'Verified Patient'}
              </div>
              <div
                className="text-truncate d-flex align-items-center gap-1"
                style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.2, marginTop: '2px' }}
              >
                <span
                  className="rounded-circle bg-success flex-shrink-0 d-inline-block"
                  style={{ width: '6px', height: '6px', boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)' }}
                />
                <span className="text-truncate">
                  Personal Health Record
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div
          className="flex-grow-1 overflow-y-auto px-3 py-2"
          style={{ minHeight: 0 }}
        >
          <div
            className="text-uppercase px-2 pt-2 mb-2 font-monospace fw-semibold"
            style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#64748b' }}
          >
            Patient Care
          </div>
          <nav className="nav flex-column gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-decoration-none transition-all ${
                      isActive
                        ? 'text-white fw-semibold'
                        : 'text-white-50 hover-text-white'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    borderLeft: isActive ? '3px solid #34d399' : '3px solid transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.15s ease-in-out',
                  })}
                >
                  <div className="d-flex align-items-center gap-3">
                    <Icon size={18} style={{ color: 'inherit' }} />
                    <span style={{ fontSize: '0.88rem' }}>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="badge rounded-pill bg-danger text-white"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div
          className="p-3"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 border-danger-subtle text-danger"
            style={{ fontSize: '0.85rem' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
