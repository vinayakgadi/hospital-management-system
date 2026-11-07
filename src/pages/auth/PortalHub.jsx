import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  Stethoscope,
  UserCheck,
  ArrowRight,
  HeartPulse,
  Lock,
  Activity,
  CheckCircle2,
} from 'lucide-react'

export default function PortalHub() {
  const portals = [
    {
      id: 'admin',
      title: 'Administrator Portal',
      subtitle: 'System Governance & Operations',
      description:
        'Oversee healthcare operations, manage attending physicians, track patient registrations, monitor clinical KPIs, and audit activities.',
      path: '/admin/login',
      icon: ShieldAlert,
      badge: 'Full Access',
      badgeColor: 'bg-rose-100 text-rose-700',
      themeColor: '#e11d48',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      features: [
        'KPIs & Patient registration analytics',
        'Physician credentialing & directory',
        'System audit logs & security control',
      ],
      demoCreds: 'admin@healthpulse.com / admin123',
    },
    {
      id: 'doctor',
      title: 'Doctor Portal',
      subtitle: 'Clinical Care & Consultations',
      description:
        'Access daily appointment schedules, review authorized patient charts, update consultation statuses, and coordinate clinical care.',
      path: '/doctor/login',
      icon: Stethoscope,
      badge: 'Clinical Care',
      badgeColor: 'bg-sky-100 text-sky-700',
      themeColor: '#0284c7',
      gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
      features: [
        'Personal appointment schedule',
        'Assigned patient history & vitals',
        'Clinical notes & status updates',
      ],
      demoCreds: 'dr.satyadeep@healthpulse.com / doctor123',
    },
    {
      id: 'patient',
      title: 'Patient Portal',
      subtitle: 'Personal Health Records',
      description:
        'Review your medical profile, track upcoming doctor appointments, view prescribed medications, and check attending physician details.',
      path: '/patient/login',
      icon: UserCheck,
      badge: 'Personal Health',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      themeColor: '#059669',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
      features: [
        'Personal profile & medical vitals',
        'Upcoming appointment schedule',
        'Attending physician contact',
      ],
      demoCreds: 'shravan@healthpulse.com / patient123',
    },
  ]

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-between text-dark"
      style={{
        background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      }}
    >
      {/* Top Header Bar */}
      <nav className="navbar navbar-expand-lg bg-white border-bottom border-light-subtle shadow-xs py-3">
        <div className="container">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white"
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
              }}
            >
              <HeartPulse size={22} className="text-info" />
            </div>
            <div>
              <span className="h4 fw-bold mb-0 text-dark tracking-tight">HealthPulse</span>
              <small className="d-block text-muted" style={{ fontSize: '0.72rem', marginTop: -3 }}>
                Enterprise Clinical Platform
              </small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2 rounded-pill small">
              <Activity size={14} className="d-inline me-1" />
              Role-Based Authentication Active
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container py-5 my-auto">
        <div className="text-center max-w-2xl mx-auto mb-5">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 bg-white border rounded-pill shadow-xs text-secondary small fw-medium mb-3">
            <Lock size={14} className="text-primary" />
            <span>Secure Role-Based Portal Gateway</span>
          </div>
          <h1 className="fw-bolder display-5 text-dark mb-3">
            Select Your <span className="text-primary">HealthPulse</span> Portal
          </h1>
          <p className="text-muted lead fs-6 mx-auto" style={{ maxWidth: 620 }}>
            Welcome to the unified healthcare management system. Please choose your designated
            role below to access your secure portal and dashboard.
          </p>
        </div>

        {/* 3 Portal Selection Cards */}
        <div className="row g-4 justify-content-center">
          {portals.map((portal) => {
            const Icon = portal.icon
            return (
              <div className="col-12 col-md-6 col-lg-4" key={portal.id}>
                <div
                  className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column transition-all"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)'
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 23, 42, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Card Header Strip */}
                  <div
                    className="p-4 text-white"
                    style={{ background: portal.gradient }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div
                        className="rounded-3 p-2 d-inline-flex"
                        style={{ background: 'rgba(255, 255, 255, 0.15)' }}
                      >
                        <Icon size={28} className="text-white" />
                      </div>
                      <span
                        className="badge rounded-pill px-3 py-1"
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {portal.badge}
                      </span>
                    </div>
                    <h3 className="h5 fw-bold mb-1 text-white">{portal.title}</h3>
                    <p className="small text-white-50 mb-0">{portal.subtitle}</p>
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-4 d-flex flex-column flex-grow-1">
                    <p className="text-secondary small mb-4">{portal.description}</p>

                    <div className="mb-4 flex-grow-1">
                      <small className="text-uppercase fw-bold text-muted d-block mb-2" style={{ fontSize: '0.7rem' }}>
                        Key Capabilities
                      </small>
                      <ul className="list-unstyled mb-0">
                        {portal.features.map((feature, i) => (
                          <li
                            key={i}
                            className="d-flex align-items-start gap-2 text-secondary small mb-2"
                          >
                            <CheckCircle2
                              size={16}
                              className="text-primary mt-1 flex-shrink-0"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Demo Credentials Box */}
                    <div
                      className="p-2 px-3 rounded-3 mb-3 bg-light border border-light-subtle"
                      style={{ fontSize: '0.78rem' }}
                    >
                      <span className="text-muted d-block fw-semibold mb-1">
                        Demo Account:
                      </span>
                      <code className="text-dark fw-medium">{portal.demoCreds}</code>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={portal.path}
                      className="btn w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-auto"
                      style={{
                        backgroundColor: portal.themeColor,
                        borderColor: portal.themeColor,
                        color: '#ffffff',
                      }}
                    >
                      <span>Enter {portal.title.split(' ')[0]} Portal</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-top py-3 text-center text-muted small">
        <div className="container d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
          <span>&copy; {new Date().getFullYear()} HealthPulse Healthcare Platform. All rights reserved.</span>
          <span className="text-secondary">
            HIPAA Compliant &bull; End-to-End Encrypted &bull; Role-Based Access Control
          </span>
        </div>
      </footer>
    </div>
  )
}
