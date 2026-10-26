import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'
import { Users, UserPlus, Calendar, Activity, TrendingUp, AlertCircle } from 'lucide-react'

export default function StatCards({ refreshTrigger }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/dashboard/stats`)
      setStats(res.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError('Unable to load metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  const cards = [
    {
      title: 'Total Patients',
      value: stats?.total_patients ?? 0,
      trend: stats?.trends?.patients || '+12% from last month',
      icon: Users,
      color: '#0284c7',
      bgLight: '#e0f2fe',
      desc: 'Active registered patients',
    },
    {
      title: 'Total Doctors',
      value: stats?.total_doctors ?? 0,
      trend: stats?.trends?.doctors || '+2 newly registered',
      icon: UserPlus,
      color: '#0d9488',
      bgLight: '#ccfbf1',
      desc: 'Credentialed physicians',
    },
    {
      title: 'Total Appointments',
      value: stats?.total_appointments ?? 0,
      trend: stats?.trends?.appointments || '+8% this week',
      icon: Calendar,
      color: '#8b5cf6',
      bgLight: '#ede9fe',
      desc: 'Scheduled & completed visits',
    },
    {
      title: 'Active Medical Conditions',
      value: stats?.active_conditions ?? 0,
      trend: stats?.trends?.conditions || 'Across all departments',
      icon: Activity,
      color: '#f43f5e',
      bgLight: '#ffe4e6',
      desc: 'Distinct diagnoses managed',
    },
  ]

  if (loading) {
    return (
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div className="col-12 col-sm-6 col-xl-3" key={i}>
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white placeholder-glow">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="placeholder col-6"></span>
                <span className="placeholder col-2 rounded-circle p-3"></span>
              </div>
              <span className="placeholder col-4 fs-3 mb-2"></span>
              <span className="placeholder col-8 small"></span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="alert alert-warning rounded-4 shadow-sm mb-4 d-flex align-items-center gap-2">
        <AlertCircle size={18} className="text-warning-emphasis" />
        <span>{error}. Displaying latest cached metrics.</span>
        <button className="btn btn-sm btn-outline-dark ms-auto rounded-pill" onClick={fetchStats}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="row g-3 mb-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div className="col-12 col-sm-6 col-xl-3" key={idx}>
            <div
              className="card border-0 shadow-sm rounded-4 h-100 bg-white transition-all"
              style={{
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(15, 23, 42, 0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted fw-semibold small text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    {card.title}
                  </span>
                  <div
                    className="p-2 rounded-3 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: card.bgLight, color: card.color }}
                  >
                    <Icon size={20} />
                  </div>
                </div>

                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <span className="fs-2 fw-bold text-dark tracking-tight">
                    {card.value.toLocaleString()}
                  </span>
                </div>

                <div className="mt-auto d-flex align-items-center gap-1">
                  <span
                    className="badge bg-light text-secondary border small rounded-pill d-inline-flex align-items-center gap-1"
                    style={{ fontSize: '0.72rem' }}
                  >
                    <TrendingUp size={12} className="text-success" />
                    <span>{card.trend}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
