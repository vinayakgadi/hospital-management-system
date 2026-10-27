import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Pill,
  Clock,
  User,
  Bell,
  Settings,
  LogOut,
  HeartPulse,
  X,
  Stethoscope,
} from 'lucide-react'

export default function DoctorSidebar({ isOpen, onClose, unreadCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Dashboard', to: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'My Patients', to: '/doctor/patients', icon: Users },
    { label: 'Appointments', to: '/doctor/appointments', icon: Calendar },
    { label: 'Medical Records', to: '/doctor/medical-records', icon: FileText },
    { label: 'Prescriptions', to: '/doctor/prescriptions', icon: Pill },
    { label: 'My Schedule', to: '/doctor/schedule', icon: Clock },
    { label: 'My Profile', to: '/doctor/profile', icon: User },
    { label: 'Notifications', to: '/doctor/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { label: 'Settings', to: '/doctor/settings', icon: Settings },
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
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', height: '70px' }}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              className="p-2 rounded-3 text-white d-flex align-items-center justify-content-center"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
              }}
            >
              <HeartPulse size={22} className="text-white" />
            </div>
            <div>
              <span className="fw-bold fs-5 text-white tracking-wide d-block leading-tight">
                Health<span style={{ color: '#38bdf8' }}>Pulse</span>
              </span>
              <span className="badge bg-cyan-subtle text-info text-uppercase px-2 py-0" style={{ fontSize: '0.65rem' }}>
                Doctor Portal
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

        {/* Doctor Quick Badge */}
        <div className="px-3 pt-3 pb-2">
          <div
            className="p-2.5 rounded-3 d-flex align-items-center gap-2.5"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-center font-monospace fw-bold text-white flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stethoscope size={18} />
            </div>
            <div className="overflow-hidden">
              <div className="text-truncate fw-semibold text-white" style={{ fontSize: '0.82rem' }}>
                {user?.name || 'Dr. Satya Deep'}
              </div>
              <div className="text-truncate text-white-50" style={{ fontSize: '0.72rem' }}>
                Physician & Specialist
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-grow-1 overflow-y-auto px-3 py-2">
          <div
            className="text-uppercase text-white-50 px-3 mb-2 font-monospace"
            style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}
          >
            Clinical Workspace
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
                    backgroundColor: isActive ? 'rgba(2, 132, 199, 0.22)' : 'transparent',
                    borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
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
