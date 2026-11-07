import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import { API_BASE_URL } from '../../config.js'
import { TrendingUp, PieChart as PieIcon, Calendar, Info } from 'lucide-react'

export default function AnalyticsCharts({ refreshTrigger }) {
  const [trendDays, setTrendDays] = useState(7)
  const [trendData, setTrendData] = useState([])
  const [appointmentStats, setAppointmentStats] = useState([])
  const [loadingTrends, setLoadingTrends] = useState(true)
  const [loadingAppointments, setLoadingAppointments] = useState(true)

  // Fetch patient registration trends
  useEffect(() => {
    const controller = new AbortController()
    setLoadingTrends(true)
    axios
      .get(`${API_BASE_URL}/api/admin/dashboard/patient-trends?days=${trendDays}`, {
        signal: controller.signal,
      })
      .then((res) => {
        setTrendData(Array.isArray(res.data) ? res.data : [])
        setLoadingTrends(false)
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.name === 'CanceledError') return
        console.error('Failed to load patient trends:', err)
        setLoadingTrends(false)
      })
    return () => {
      controller.abort()
    }
  }, [trendDays, refreshTrigger])

  // Fetch appointment status overview
  useEffect(() => {
    const controller = new AbortController()
    setLoadingAppointments(true)
    axios
      .get(`${API_BASE_URL}/api/admin/dashboard/appointment-stats`, {
        signal: controller.signal,
      })
      .then((res) => {
        setAppointmentStats(Array.isArray(res.data) ? res.data : [])
        setLoadingAppointments(false)
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.name === 'CanceledError') return
        console.error('Failed to load appointment stats:', err)
        setLoadingAppointments(false)
      })
    return () => {
      controller.abort()
    }
  }, [refreshTrigger])

  const statusColors = {
    Scheduled: '#0284c7', // Primary blue
    Completed: '#10b981', // Emerald green
    Cancelled: '#f43f5e', // Rose red
  }

  return (
    <div className="row g-4 mb-4">
      {/* Chart 1: Patient Registration Trends (Area Chart) */}
      <div className="col-12 col-xl-7">
        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white" style={{ border: '1px solid #e2e8f0' }}>
          <div className="card-body p-4 d-flex flex-column">
            {/* Header with Title and Time Range Toggle */}
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-4">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-sky-50 text-primary rounded-3" style={{ backgroundColor: '#e0f2fe' }}>
                    <TrendingUp size={18} />
                  </div>
                  <h5 className="fw-bold mb-0 text-dark">Patient Registration Trends</h5>
                </div>
                <small className="text-muted">Real-time daily patient intake history</small>
              </div>

              {/* Day range toggle pill */}
              <div className="btn-group btn-group-sm p-1 bg-light rounded-pill border" role="group">
                <button
                  type="button"
                  className={`btn rounded-pill px-3 py-1 fw-semibold ${
                    trendDays === 7 ? 'btn-primary shadow-xs' : 'btn-light border-0 text-secondary'
                  }`}
                  onClick={() => setTrendDays(7)}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  className={`btn rounded-pill px-3 py-1 fw-semibold ${
                    trendDays === 30 ? 'btn-primary shadow-xs' : 'btn-light border-0 text-secondary'
                  }`}
                  onClick={() => setTrendDays(30)}
                >
                  Last 30 Days
                </button>
              </div>
            </div>

            {/* Chart Container */}
            <div className="flex-grow-1" style={{ minHeight: '260px' }}>
              {loadingTrends ? (
                <div className="d-flex justify-content-center align-items-center h-100 py-5">
                  <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                  <span className="text-muted small">Loading registration data...</span>
                </div>
              ) : trendData.length === 0 ? (
                <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted py-5">
                  <Info size={32} className="text-secondary mb-2" />
                  <p className="mb-0 small">No patient registration data available for this range.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="patientTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                      formatter={(value) => [`${value} Patients`, 'Registrations']}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#patientTrendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart 2: Appointment Overview (Bar / Status Distribution) */}
      <div className="col-12 col-xl-5">
        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white" style={{ border: '1px solid #e2e8f0' }}>
          <div className="card-body p-4 d-flex flex-column">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-purple-50 text-purple rounded-3" style={{ backgroundColor: '#ede9fe', color: '#8b5cf6' }}>
                    <Calendar size={18} />
                  </div>
                  <h5 className="fw-bold mb-0 text-dark">Appointment Overview</h5>
                </div>
                <small className="text-muted">Breakdown by current consultation status</small>
              </div>
            </div>

            {/* Chart Container */}
            <div className="flex-grow-1" style={{ minHeight: '260px' }}>
              {loadingAppointments ? (
                <div className="d-flex justify-content-center align-items-center h-100 py-5">
                  <div className="spinner-border text-info spinner-border-sm me-2" role="status"></div>
                  <span className="text-muted small">Loading appointment metrics...</span>
                </div>
              ) : appointmentStats.length === 0 ? (
                <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted py-5">
                  <Info size={32} className="text-secondary mb-2" />
                  <p className="mb-0 small">No appointment records found in database.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={appointmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="status"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                      formatter={(value) => [`${value} Appointments`, 'Total']}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {appointmentStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.status] || '#64748b'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Custom Status Legend */}
            <div className="d-flex justify-content-center gap-4 pt-3 border-top mt-auto">
              {['Scheduled', 'Completed', 'Cancelled'].map((status) => (
                <div key={status} className="d-flex align-items-center gap-2 small">
                  <span
                    className="rounded-circle d-inline-block"
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: statusColors[status],
                    }}
                  />
                  <span className="text-secondary">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
