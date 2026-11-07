import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'
import {
  Activity,
  UserPlus,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileEdit,
  Trash2,
  LogIn,
} from 'lucide-react'

export default function RecentActivity({ refreshTrigger }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = () => {
    setLoading(true)
    axios
      .get(`${API_BASE_URL}/api/admin/dashboard/activity?limit=10`)
      .then((res) => {
        setActivities(Array.isArray(res.data) ? res.data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load audit activities:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchActivities()
  }, [refreshTrigger])

  const getEventIcon = (type) => {
    switch (type) {
      case 'PATIENT_CREATED':
      case 'PATIENT_REGISTERED':
        return { icon: UserPlus, color: 'text-primary', bg: 'bg-primary-subtle' }
      case 'DOCTOR_REGISTERED':
        return { icon: ShieldCheck, color: 'text-info', bg: 'bg-info-subtle' }
      case 'APPOINTMENT_SCHEDULED':
      case 'APPOINTMENT_STATUS_UPDATE':
        return { icon: Calendar, color: 'text-purple', bg: 'bg-purple-subtle' }
      case 'PATIENT_UPDATED':
        return { icon: FileEdit, color: 'text-warning', bg: 'bg-warning-subtle' }
      case 'PATIENT_DELETED':
        return { icon: Trash2, color: 'text-danger', bg: 'bg-danger-subtle' }
      case 'ADMIN_LOGIN':
      case 'DOCTOR_LOGIN':
      case 'PATIENT_LOGIN':
        return { icon: LogIn, color: 'text-success', bg: 'bg-success-subtle' }
      default:
        return { icon: Activity, color: 'text-secondary', bg: 'bg-secondary-subtle' }
    }
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white h-100" style={{ border: '1px solid #e2e8f0' }}>
      <div className="card-body p-4 d-flex flex-column">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-3 bg-emerald-50 text-success" style={{ backgroundColor: '#dcfce7' }}>
              <Activity size={18} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Audit & System Activity</h5>
              <small className="text-muted">Live event logging</small>
            </div>
          </div>
          <span className="badge bg-light text-muted border small rounded-pill">Audit Log</span>
        </div>

        {/* Timeline List */}
        <div className="flex-grow-1 overflow-y-auto" style={{ maxHeight: '380px' }}>
          {loading ? (
            <div className="text-center py-4 text-muted small">
              <div className="spinner-border text-success spinner-border-sm me-2" role="status"></div>
              Loading activity stream...
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-5 text-muted small">
              No recent administrative activities logged yet.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3 py-1">
              {activities.map((act) => {
                const conf = getEventIcon(act.event_type)
                const Icon = conf.icon
                return (
                  <div key={act.id} className="d-flex align-items-start gap-3">
                    <div
                      className={`p-2 rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center ${conf.bg} ${conf.color}`}
                      style={{ width: 34, height: 34 }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-grow-1 border-bottom pb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-semibold text-dark small">{act.description}</span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {act.created_at
                            ? new Date(act.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now'}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span
                          className="badge bg-light text-secondary border"
                          style={{ fontSize: '0.65rem' }}
                        >
                          Actor: {act.actor_name || 'System'} ({act.actor_role || 'Admin'})
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
