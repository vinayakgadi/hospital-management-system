import { useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  BarChart3,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Pill,
  Download,
  Printer,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  ShieldCheck,
  Stethoscope,
  ChevronDown,
} from 'lucide-react'
import { reportsService } from '../../services/reportsService.js'

// Color palettes for HealthPulse SaaS theme
const COLORS = ['#0284c7', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']
const STATUS_COLORS = {
  Scheduled: '#0284c7',
  Completed: '#10b981',
  Cancelled: '#ef4444',
  'In Progress': '#f59e0b',
  Finalized: '#10b981',
  Draft: '#f59e0b',
  Active: '#0284c7',
  Discontinued: '#ef4444',
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false)

  // Date range filters
  const [dateRangePreset, setDateRangePreset] = useState('all') // '30', '90', 'all', 'custom'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Analytics data state
  const [overviewData, setOverviewData] = useState(null)
  const [patientData, setPatientData] = useState(null)
  const [appointmentData, setAppointmentData] = useState(null)
  const [doctorData, setDoctorData] = useState(null)
  const [recordsData, setRecordsData] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Calculate preset dates
  const handlePresetChange = (preset) => {
    setDateRangePreset(preset)
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    if (preset === '30') {
      const past = new Date()
      past.setDate(past.getDate() - 30)
      setStartDate(past.toISOString().split('T')[0])
      setEndDate(todayStr)
    } else if (preset === '90') {
      const past = new Date()
      past.setDate(past.getDate() - 90)
      setStartDate(past.toISOString().split('T')[0])
      setEndDate(todayStr)
    } else if (preset === 'all') {
      setStartDate('')
      setEndDate('')
    }
  }

  // Load report data from backend
  const fetchReports = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const [overviewRes, patRes, apptRes, docRes, recRes] = await Promise.all([
        reportsService.getOverview(),
        reportsService.getPatientAnalytics(params),
        reportsService.getAppointmentAnalytics(params),
        reportsService.getDoctorAnalytics(),
        reportsService.getMedicalRecordsAnalytics(),
      ])

      setOverviewData(overviewRes)
      setPatientData(patRes)
      setAppointmentData(apptRes)
      setDoctorData(docRes)
      setRecordsData(recRes)
    } catch (err) {
      console.error('Failed to load reports data:', err)
      setErrorMessage(err.response?.data?.error || 'Unable to retrieve real-time report analytics. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleExportCSV = async (type) => {
    setExporting(true)
    setExportDropdownOpen(false)
    try {
      await reportsService.downloadExport(type)
      showToast(`Exported ${type} dataset as CSV successfully.`)
    } catch (err) {
      console.error('Failed to export CSV:', err)
      setErrorMessage('Export failed. Please check network connection and try again.')
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="reports-analytics-container pb-5">
      {/* Print-specific style */}
      <style>{`
        @media print {
          .sidebar-nav, .top-header, .no-print, .btn, .nav-tabs {
            display: none !important;
          }
          .reports-analytics-container {
            padding: 0 !important;
            margin: 0 !important;
          }
          .card {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1060, marginTop: '70px' }}
        >
          <div className="toast show align-items-center text-bg-success border-0 shadow-lg" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <CheckCircle2 size={18} />
                <span>{toastMessage}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 mb-4 no-print">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div
              className="p-2 rounded-3 text-white d-flex align-items-center justify-content-center"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
            >
              <BarChart3 size={22} />
            </div>
            <h1 className="h3 fw-bold text-slate-900 mb-0">Reports & Analytics</h1>
          </div>
          <p className="text-muted mb-0 small">
            Live institutional intelligence, patient cohort distributions, clinical workload, and compliance data.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Refresh Button */}
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2 btn-sm px-3 shadow-sm bg-white"
            onClick={fetchReports}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spin-animation' : ''} />
            <span>Refresh</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2 btn-sm px-3 shadow-sm bg-white"
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>

          {/* Export CSV Dropdown */}
          <div className="position-relative">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center gap-2 btn-sm px-3 shadow-sm"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              disabled={exporting}
            >
              <Download size={15} />
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
              <ChevronDown size={14} />
            </button>

            {exportDropdownOpen && (
              <div
                className="dropdown-menu show position-absolute end-0 mt-1 shadow-lg border rounded-3 p-1"
                style={{ zIndex: 1050, minWidth: '190px' }}
              >
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 py-2 small"
                  onClick={() => handleExportCSV('patients')}
                >
                  <Users size={15} className="text-primary" />
                  <span>Patients Dataset</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 py-2 small"
                  onClick={() => handleExportCSV('appointments')}
                >
                  <Calendar size={15} className="text-info" />
                  <span>Appointments Dataset</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 py-2 small"
                  onClick={() => handleExportCSV('doctors')}
                >
                  <UserCheck size={15} className="text-success" />
                  <span>Clinicians Roster</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 py-2 small"
                  onClick={() => handleExportCSV('prescriptions')}
                >
                  <Pill size={15} className="text-warning" />
                  <span>Prescriptions Dataset</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3 shadow-sm mb-4">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={20} className="text-danger flex-shrink-0" />
            <span className="small">{errorMessage}</span>
          </div>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchReports}>
            Retry
          </button>
        </div>
      )}

      {/* Date Range Filter Bar */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white no-print">
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            {/* Presets */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-semibold d-flex align-items-center gap-1">
                <Filter size={15} /> Timeframe:
              </span>
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn ${dateRangePreset === '30' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handlePresetChange('30')}
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  className={`btn ${dateRangePreset === '90' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handlePresetChange('90')}
                >
                  Last 90 Days
                </button>
                <button
                  type="button"
                  className={`btn ${dateRangePreset === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handlePresetChange('all')}
                >
                  All Time
                </button>
              </div>
            </div>

            {/* Custom Dates */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="d-flex align-items-center gap-1">
                <label className="text-muted small mb-0">From:</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  style={{ width: '140px' }}
                  value={startDate}
                  onChange={(e) => {
                    setDateRangePreset('custom')
                    setStartDate(e.target.value)
                  }}
                />
              </div>
              <div className="d-flex align-items-center gap-1">
                <label className="text-muted small mb-0">To:</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  style={{ width: '140px' }}
                  value={endDate}
                  onChange={(e) => {
                    setDateRangePreset('custom')
                    setEndDate(e.target.value)
                  }}
                />
              </div>
              {(startDate || endDate) && (
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 ms-1 small"
                  onClick={() => handlePresetChange('all')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <ul className="nav nav-pills custom-report-tabs mb-4 gap-2 no-print">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link px-3 py-2 rounded-3 small fw-semibold d-flex align-items-center gap-2 ${
              activeTab === 'overview' ? 'active bg-primary text-white shadow-sm' : 'bg-white text-dark border'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={16} />
            <span>Overview Metrics</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link px-3 py-2 rounded-3 small fw-semibold d-flex align-items-center gap-2 ${
              activeTab === 'patients' ? 'active bg-primary text-white shadow-sm' : 'bg-white text-dark border'
            }`}
            onClick={() => setActiveTab('patients')}
          >
            <Users size={16} />
            <span>Patient Trends</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link px-3 py-2 rounded-3 small fw-semibold d-flex align-items-center gap-2 ${
              activeTab === 'appointments' ? 'active bg-primary text-white shadow-sm' : 'bg-white text-dark border'
            }`}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar size={16} />
            <span>Appointments</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link px-3 py-2 rounded-3 small fw-semibold d-flex align-items-center gap-2 ${
              activeTab === 'clinicians' ? 'active bg-primary text-white shadow-sm' : 'bg-white text-dark border'
            }`}
            onClick={() => setActiveTab('clinicians')}
          >
            <Stethoscope size={16} />
            <span>Clinicians & Workload</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link px-3 py-2 rounded-3 small fw-semibold d-flex align-items-center gap-2 ${
              activeTab === 'records' ? 'active bg-primary text-white shadow-sm' : 'bg-white text-dark border'
            }`}
            onClick={() => setActiveTab('records')}
          >
            <ShieldCheck size={16} />
            <span>EMR & Compliance</span>
          </button>
        </li>
      </ul>

      {/* Loading Skeleton */}
      {loading && !overviewData && (
        <div className="card border-0 shadow-sm rounded-3 p-5 text-center bg-white">
          <div className="spinner-border text-primary mx-auto mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
            <span className="visually-hidden">Loading analytics...</span>
          </div>
          <p className="text-muted fw-semibold mb-0">Querying institutional database analytics...</p>
        </div>
      )}

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && overviewData && (
        <div className="tab-pane-content">
          {/* Top KPI Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold text-uppercase">Total Patients</span>
                    <div className="p-2 rounded-2 bg-primary bg-opacity-10 text-primary">
                      <Users size={18} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-1">{overviewData.overview.total_patients}</h3>
                  <div className="d-flex align-items-center gap-1 text-muted small">
                    <span className="badge bg-success bg-opacity-10 text-success fw-normal">Active Cohort</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold text-uppercase">Active Clinicians</span>
                    <div className="p-2 rounded-2 bg-info bg-opacity-10 text-info">
                      <UserCheck size={18} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-1">{overviewData.overview.total_doctors}</h3>
                  <div className="d-flex align-items-center gap-1 text-muted small">
                    <span className="badge bg-info bg-opacity-10 text-info fw-normal">Multi-specialty</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold text-uppercase">Appointments</span>
                    <div className="p-2 rounded-2 bg-warning bg-opacity-10 text-warning">
                      <Calendar size={18} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-1">{overviewData.overview.total_appointments}</h3>
                  <div className="d-flex align-items-center gap-1 text-muted small">
                    <span className="badge bg-warning bg-opacity-10 text-warning fw-normal">All statuses</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold text-uppercase">Medical Records</span>
                    <div className="p-2 rounded-2 bg-success bg-opacity-10 text-success">
                      <FileText size={18} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-1">{overviewData.overview.total_medical_records}</h3>
                  <div className="d-flex align-items-center gap-1 text-muted small">
                    <span className="badge bg-success bg-opacity-10 text-success fw-normal">EMR Encounters</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold text-uppercase">Prescriptions</span>
                    <div className="p-2 rounded-2 bg-purple bg-opacity-10 text-purple" style={{ color: '#8b5cf6' }}>
                      <Pill size={18} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-1">{overviewData.overview.total_prescriptions}</h3>
                  <div className="d-flex align-items-center gap-1 text-muted small">
                    <span className="badge bg-purple bg-opacity-10 text-purple fw-normal" style={{ color: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)' }}>Pharmacy Orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="row g-4 mb-4">
            {/* Department Distribution */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h6 className="fw-bold mb-0">Department & Specialization Mix</h6>
                      <small className="text-muted">Physician allocation across clinical disciplines</small>
                    </div>
                    <span className="badge bg-light text-dark border">
                      {overviewData.department_distribution.length} Specialties
                    </span>
                  </div>

                  <div style={{ height: '260px' }}>
                    {overviewData.department_distribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={overviewData.department_distribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={85}
                            innerRadius={45}
                            paddingAngle={3}
                          >
                            {overviewData.department_distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [`${value} Doctors`, name]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                        No department distribution data available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Status Pipeline */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h6 className="fw-bold mb-0">Appointment Pipeline Status</h6>
                      <small className="text-muted">Proportion of scheduled, completed, and cancelled visits</small>
                    </div>
                    <span className="badge bg-light text-dark border">Pipeline</span>
                  </div>

                  <div style={{ height: '260px' }}>
                    {overviewData.appointments_by_status.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overviewData.appointments_by_status} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="status" tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="count" name="Appointments" radius={[6, 6, 0, 0]}>
                            {overviewData.appointments_by_status.map((entry, index) => (
                              <Cell key={`bar-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                        No appointment status data recorded.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Row: Records & Prescriptions Status */}
          <div className="row g-4">
            {/* Medical Records Status */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-1">EMR Documentation Status</h6>
                  <small className="text-muted d-block mb-3">Draft vs Finalized consultation documentation ratio</small>
                  <div style={{ height: '220px' }}>
                    {overviewData.records_by_status.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={overviewData.records_by_status}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={75}
                            innerRadius={40}
                          >
                            {overviewData.records_by_status.map((entry, index) => (
                              <Cell
                                key={`rec-${index}`}
                                fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                        No medical record data available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Prescriptions by Status */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-1">Prescriptions Fulfillment Status</h6>
                  <small className="text-muted d-block mb-3">Active vs Completed pharmacy medication orders</small>
                  <div style={{ height: '220px' }}>
                    {overviewData.prescriptions_by_status.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overviewData.prescriptions_by_status} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="status" tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="count" name="Orders" fill="#0284c7" radius={[6, 6, 0, 0]}>
                            {overviewData.prescriptions_by_status.map((entry, index) => (
                              <Cell
                                key={`rx-${index}`}
                                fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                        No prescription data available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PATIENT TRENDS & DEMOGRAPHICS */}
      {activeTab === 'patients' && patientData && (
        <div className="tab-pane-content">
          <div className="row g-4 mb-4">
            {/* Monthly Registrations Trend */}
            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h6 className="fw-bold mb-0">Monthly Patient Registrations</h6>
                      <small className="text-muted">Inflow of new patient registrations over time</small>
                    </div>
                    <span className="badge bg-primary bg-opacity-10 text-primary">
                      {patientData.total_registered_in_range} Total Registered
                    </span>
                  </div>

                  <div style={{ height: '280px' }}>
                    {patientData.registrations_over_time.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={patientData.registrations_over_time} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                          <defs>
                            <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Area type="monotone" dataKey="registrations" name="New Patients" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#patientGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                        No registration history within this timeframe.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-1">Gender Demographics</h6>
                  <small className="text-muted d-block mb-3">Cohort gender composition</small>

                  <div style={{ height: '240px' }}>
                    {patientData.gender_distribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={patientData.gender_distribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={45}
                            paddingAngle={3}
                          >
                            {patientData.gender_distribution.map((entry, index) => (
                              <Cell
                                key={`gender-${index}`}
                                fill={
                                  entry.name.toLowerCase() === 'female'
                                    ? '#ec4899'
                                    : entry.name.toLowerCase() === 'male'
                                    ? '#0284c7'
                                    : '#10b981'
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                        No demographic data recorded.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Diagnoses / Conditions Bar Chart */}
          <div className="card border-0 shadow-sm rounded-3 bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 className="fw-bold mb-0">Prevalent Clinical Conditions</h6>
                  <small className="text-muted">Primary diagnostic classifications across patient cohort</small>
                </div>
                <span className="badge bg-light text-dark border">Top Conditions</span>
              </div>

              <div style={{ height: '260px' }}>
                {patientData.condition_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={patientData.condition_distribution}
                      margin={{ top: 10, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis type="category" dataKey="condition" width={120} tick={{ fill: '#1e293b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" name="Diagnoses" fill="#06b6d4" radius={[0, 6, 6, 0]}>
                        {patientData.condition_distribution.map((entry, index) => (
                          <Cell key={`cond-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                    No condition distribution recorded.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APPOINTMENTS */}
      {activeTab === 'appointments' && appointmentData && (
        <div className="tab-pane-content">
          {/* Key Appointment Metrics */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-3 bg-white p-3">
                <span className="text-muted small fw-semibold text-uppercase">Appointments In Range</span>
                <h3 className="fw-bold mt-1 mb-0">{appointmentData.total_in_range}</h3>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-3 bg-white p-3">
                <span className="text-muted small fw-semibold text-uppercase">Upcoming Scheduled</span>
                <h3 className="fw-bold mt-1 mb-0 text-primary">{appointmentData.upcoming_appointments}</h3>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-3 bg-white p-3">
                <span className="text-muted small fw-semibold text-uppercase">Status Breakdown Types</span>
                <h3 className="fw-bold mt-1 mb-0 text-success">{appointmentData.appointments_by_status.length}</h3>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Daily Volume Over Time */}
            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-1">Appointment Volume by Consultation Date</h6>
                  <small className="text-muted d-block mb-3">Daily booking distribution across clinic schedules</small>

                  <div style={{ height: '280px' }}>
                    {appointmentData.volume_over_time.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={appointmentData.volume_over_time} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="appointments"
                            name="Visits"
                            stroke="#0284c7"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#0284c7' }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                        No appointments found within selected date range.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Breakdown Pie */}
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-1">Status Proportions</h6>
                  <small className="text-muted d-block mb-3">Outcome ratio of booked appointments</small>

                  <div style={{ height: '240px' }}>
                    {appointmentData.appointments_by_status.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={appointmentData.appointments_by_status}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={75}
                            innerRadius={40}
                          >
                            {appointmentData.appointments_by_status.map((entry, index) => (
                              <Cell
                                key={`app-st-${index}`}
                                fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                        No appointment status data.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLINICIANS & WORKLOAD */}
      {activeTab === 'clinicians' && doctorData && (
        <div className="tab-pane-content">
          {/* Workload Comparison Bar Chart */}
          <div className="card border-0 shadow-sm rounded-3 bg-white mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 className="fw-bold mb-0">Physician Clinical Workload Comparison</h6>
                  <small className="text-muted">Total appointments vs active patients assigned per doctor</small>
                </div>
                <span className="badge bg-light text-dark border">Workload Metrics</span>
              </div>

              <div style={{ height: '280px' }}>
                {doctorData.doctors_summary.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={doctorData.doctors_summary} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="appointment_count" name="Appointments" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="patient_count" name="Patients Assigned" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="record_count" name="EMR Records" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                    No doctor workload data available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinician Performance Table */}
          <div className="card border-0 shadow-sm rounded-3 bg-white">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold mb-0">Staff Clinical Productivity Roster</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted text-uppercase">
                    <th className="ps-4">Doctor Name</th>
                    <th>Specialization</th>
                    <th>Status</th>
                    <th className="text-center">Assigned Patients</th>
                    <th className="text-center">Appointments</th>
                    <th className="text-center">EMR Records</th>
                    <th className="text-center pe-4">Prescriptions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorData.doctors_summary.map((doc) => (
                    <tr key={doc.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '34px', height: '34px', fontSize: '0.8rem' }}
                          >
                            {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-slate-800 d-block">{doc.name}</span>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>ID #{doc.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{doc.specialization}</span>
                      </td>
                      <td>
                        <span className={`badge ${doc.status === 'Active' ? 'bg-success' : 'bg-secondary'} bg-opacity-10 text-${doc.status === 'Active' ? 'success' : 'secondary'} border`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="text-center fw-bold text-slate-700">{doc.patient_count}</td>
                      <td className="text-center fw-bold text-primary">{doc.appointment_count}</td>
                      <td className="text-center fw-bold text-slate-700">{doc.record_count}</td>
                      <td className="text-center pe-4 fw-bold text-info">{doc.prescription_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EMR & COMPLIANCE */}
      {activeTab === 'records' && recordsData && (
        <div className="tab-pane-content">
          {/* Key Compliance Badges */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-3 bg-white p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase">Amended Medical Records</span>
                    <h3 className="fw-bold mt-1 mb-0 text-warning">{recordsData.amended_records_count}</h3>
                    <small className="text-muted">Clinically corrected records under audit trail</small>
                  </div>
                  <div className="p-3 rounded-3 bg-warning bg-opacity-10 text-warning">
                    <ShieldCheck size={28} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-3 bg-white p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase">Total Encounters</span>
                    <h3 className="fw-bold mt-1 mb-0 text-primary">
                      {recordsData.status_distribution.reduce((acc, curr) => acc + curr.count, 0)}
                    </h3>
                    <small className="text-muted">Documented patient encounters across all clinics</small>
                  </div>
                  <div className="p-3 rounded-3 bg-primary bg-opacity-10 text-primary">
                    <FileText size={28} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Consultation Timeline */}
            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-1">Monthly Consultation Volume</h6>
                  <small className="text-muted d-block mb-3">Encounter documentation logged per month</small>

                  <div style={{ height: '280px' }}>
                    {recordsData.records_over_time.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={recordsData.records_over_time} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="records" name="Clinical Encounters" fill="#0284c7" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                        No monthly clinical documentation data.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Draft vs Finalized Breakdown */}
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-1">Documentation Integrity Ratio</h6>
                  <small className="text-muted d-block mb-3">Finalized vs Draft record status</small>

                  <div style={{ height: '240px' }}>
                    {recordsData.status_distribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={recordsData.status_distribution}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={75}
                            innerRadius={40}
                          >
                            {recordsData.status_distribution.map((entry, index) => (
                              <Cell
                                key={`rec-status-${index}`}
                                fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                        No record status data.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
