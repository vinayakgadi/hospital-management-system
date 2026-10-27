import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  Users,
  Search,
  Filter,
  Eye,
  Calendar,
  Phone,
  Mail,
  Activity,
  AlertCircle,
  FileText,
  ChevronRight,
  RefreshCw,
  HeartPulse,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'

export default function DoctorPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDisease, setSelectedDisease] = useState('ALL')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (searchTerm) params.q = searchTerm
      if (selectedDisease !== 'ALL') params.disease = selectedDisease

      const res = await axios.get(`${API_BASE_URL}/api/doctor/patients`, { params })
      setPatients(res.data || [])
    } catch (err) {
      console.error('Failed to fetch doctor patients:', err)
      setError(err.response?.data?.error || 'Failed to load assigned patients.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients()
    }, 250)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm, selectedDisease])

  // Extract distinct diseases for dropdown filter
  const diseasesList = [
    'ALL',
    'Cardiology',
    'Hypertension',
    'Type 2 Diabetes',
    'Asthma',
    'Migraine',
    'Dermatitis',
  ]

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">My Assigned Patients</h1>
          <p className="text-muted small mb-0">
            View patient profiles, clinical histories, active diagnoses, and electronic health charts.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={fetchPatients}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-3.5 d-flex align-items-center gap-3">
              <div
                className="p-3 rounded-3 text-primary d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#e0f2fe' }}
              >
                <Users size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Total Assigned Patients</span>
                <h4 className="fw-bold mb-0 text-dark">{patients.length}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-3.5 d-flex align-items-center gap-3">
              <div
                className="p-3 rounded-3 text-info d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#cffafe' }}
              >
                <HeartPulse size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Chronic Care Patients</span>
                <h4 className="fw-bold mb-0 text-dark">
                  {patients.filter((p) => p.disease && p.disease !== 'General Checkup').length}
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-3.5 d-flex align-items-center gap-3">
              <div
                className="p-3 rounded-3 text-success d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#dcfce7' }}
              >
                <Calendar size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Active Consultations</span>
                <h4 className="fw-bold mb-0 text-dark">
                  {patients.reduce((acc, p) => acc + (p.appointments_count || 0), 0)}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="card border-0 rounded-4 shadow-xs bg-white mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Search */}
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted ps-3">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 py-2"
                  placeholder="Search by name, email, or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Condition Filter */}
            <div className="col-12 col-md-4 col-lg-3">
              <div className="d-flex align-items-center gap-2">
                <Filter size={16} className="text-muted flex-shrink-0" />
                <select
                  className="form-select bg-light py-2"
                  value={selectedDisease}
                  onChange={(e) => setSelectedDisease(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Conditions / Specializations</option>
                  {diseasesList
                    .filter((d) => d !== 'ALL')
                    .map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* View Switcher */}
            <div className="col-12 col-md-2 col-lg-4 text-md-end">
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('table')}
                >
                  Table
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('grid')}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Content */}
      {error && (
        <div className="alert alert-danger rounded-4 d-flex align-items-center gap-2 p-3 mb-4" role="alert">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-3" role="status">
            <span className="visually-hidden">Loading patients...</span>
          </div>
          <p className="text-muted small mb-0">Retrieving authorized patient records...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center">
          <Users size={48} className="text-muted mx-auto mb-3" />
          <h5 className="fw-bold text-dark">No Patients Found</h5>
          <p className="text-muted small mb-3">
            {searchTerm || selectedDisease !== 'ALL'
              ? 'No patients matched your current search filters.'
              : 'You have not been assigned any patients yet.'}
          </p>
          {(searchTerm || selectedDisease !== 'ALL') && (
            <div>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm rounded-3"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedDisease('ALL')
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="card border-0 rounded-4 shadow-xs bg-white overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="text-secondary small">
                  <th className="ps-4">Patient Profile</th>
                  <th>Demographics</th>
                  <th>Primary Condition</th>
                  <th>Last Consultation</th>
                  <th>Total Visits</th>
                  <th className="text-end pe-4">Clinical Chart</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                          style={{
                            width: '38px',
                            height: '38px',
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            fontSize: '0.85rem',
                          }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/doctor/patients/${p.id}`}
                            className="fw-bold text-dark text-decoration-none hover-primary d-block"
                          >
                            {p.name}
                          </Link>
                          <small className="text-muted d-flex align-items-center gap-1">
                            <Mail size={12} /> {p.email}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small text-dark fw-medium">
                        {p.age} yrs • {p.gender}
                      </div>
                      <small className="text-muted d-flex align-items-center gap-1">
                        <Phone size={12} /> {p.contact}
                      </small>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary px-2.5 py-1.5 rounded-pill font-monospace small">
                        {p.disease || 'General Care'}
                      </span>
                    </td>
                    <td className="small text-muted">{p.last_consultation}</td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1">
                        {p.appointments_count || 0} visits
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <Link
                        to={`/doctor/patients/${p.id}`}
                        className="btn btn-outline-primary btn-sm rounded-3 d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
                      >
                        <Eye size={15} />
                        <span>View Chart</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid / Card View */
        <div className="row g-3">
          {patients.map((p) => (
            <div key={p.id} className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 rounded-4 shadow-xs bg-white h-100 p-3.5">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{
                        width: '44px',
                        height: '44px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        fontSize: '1rem',
                      }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">{p.name}</h6>
                      <small className="text-muted">ID: #{p.id} • {p.age} yrs, {p.gender}</small>
                    </div>
                  </div>
                  <span className="badge bg-primary-subtle text-primary rounded-pill small">
                    {p.disease || 'General'}
                  </span>
                </div>

                <div className="border-top border-bottom py-2.5 mb-3" style={{ fontSize: '0.82rem' }}>
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Phone:</span>
                    <strong className="text-dark">{p.contact}</strong>
                  </div>
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Email:</span>
                    <strong className="text-dark text-truncate" style={{ maxWidth: '170px' }}>{p.email}</strong>
                  </div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>Last Consult:</span>
                    <strong className="text-dark">{p.last_consultation}</strong>
                  </div>
                </div>

                <Link
                  to={`/doctor/patients/${p.id}`}
                  className="btn btn-outline-primary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2 small"
                >
                  <Eye size={16} />
                  <span>Open Medical Chart</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
