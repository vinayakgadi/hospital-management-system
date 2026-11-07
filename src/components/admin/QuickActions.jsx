import { useNavigate } from 'react-router-dom'
import { UserPlus, Stethoscope, Calendar, BarChart3, Plus } from 'lucide-react'

export default function QuickActions({
  onOpenAddPatient,
  onOpenRegisterDoctor,
  onOpenScheduleAppointment,
}) {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Add Patient',
      desc: 'Register new patient record',
      icon: UserPlus,
      color: '#0284c7',
      bg: '#e0f2fe',
      onClick: onOpenAddPatient,
    },
    {
      label: 'Register Doctor',
      desc: 'Credential attending physician',
      icon: Stethoscope,
      color: '#0d9488',
      bg: '#ccfbf1',
      onClick: onOpenRegisterDoctor,
    },
    {
      label: 'Schedule Visit',
      desc: 'Book consultation appointment',
      icon: Calendar,
      color: '#8b5cf6',
      bg: '#ede9fe',
      onClick: onOpenScheduleAppointment,
    },
    {
      label: 'View Reports',
      desc: 'System health & diagnostics',
      icon: BarChart3,
      color: '#f59e0b',
      bg: '#fef3c7',
      onClick: () => navigate('/admin/reports'),
    },
  ]

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white mb-4" style={{ border: '1px solid #e2e8f0' }}>
      <div className="card-body p-4">
        <h6 className="fw-bold text-dark mb-3 small text-uppercase" style={{ letterSpacing: '0.5px' }}>
          Administrative Quick Actions
        </h6>
        <div className="row g-3">
          {actions.map((act, index) => {
            const Icon = act.icon
            return (
              <div className="col-12 col-sm-6 col-lg-3" key={index}>
                <button
                  type="button"
                  className="btn btn-light w-100 text-start p-3 rounded-3 border d-flex align-items-center gap-3 transition-all h-100"
                  style={{
                    backgroundColor: '#f8fafc',
                    borderColor: '#e2e8f0',
                  }}
                  onClick={act.onClick}
                >
                  <div
                    className="p-2 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ backgroundColor: act.bg, color: act.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <span className="fw-bold text-dark d-block small">{act.label}</span>
                    <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                      {act.desc}
                    </span>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
