import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  FileText,
  Pill,
  BarChart3,
  Settings,
  LogOut,
  HeartPulse,
  X,
  ShieldCheck,
} from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Patients', to: '/admin/patients', icon: Users },
    { label: 'Doctors', to: '/admin/doctors', icon: UserPlus },
    { label: 'Appointments', to: '/admin/appointments', icon: Calendar },
    { label: 'Medical Records', to: '/admin/medical-records', icon: FileText },
    { label: 'Prescriptions', to: '/admin/prescriptions', icon: Pill },
    { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
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
              <span className="fw-bold fs-5 tracking-tight d-block text-white">HealthPulse</span>
              <span
                className="badge bg-danger bg-opacity-25 text-danger border border-danger-subtle"
                style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}
              >
                ADMIN SUITE
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-link text-white-50 p-0 d-lg-none"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-grow-1 overflow-y-auto py-3 px-3">
          <small
            className="text-uppercase fw-bold text-white-50 px-3 mb-2 d-block"
            style={{ fontSize: '0.68rem', letterSpacing: '1px' }}
          >
            Main Menu
          </small>
          <nav className="nav flex-column gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 992) onClose()
                  }}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center justify-content-between px-3 py-2 rounded-3 transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm fw-semibold'
                        : 'text-white-50 hover:text-white'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                    fontSize: '0.9rem',
                  })}
                >
                  <div className="d-flex align-items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        fontSize: '0.65rem',
                        fontWeight: 500,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Administrator Profile & Logout at the bottom */}
        <div
          className="p-3"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#090d16',
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                style={{
                  width: 38,
                  height: 38,
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  fontSize: '0.85rem',
                }}
              >
                {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD')}
              </div>
              <div className="text-truncate">
                <span className="fw-semibold text-white d-block text-truncate" style={{ fontSize: '0.85rem' }}>
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-white-50 small d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                  <ShieldCheck size={12} className="text-success" />
                  <span>Admin Access</span>
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-light border-0 text-white-50 p-2 rounded-3 hover:text-white"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
