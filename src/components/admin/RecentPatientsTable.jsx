import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'

export default function RecentPatientsTable({
  patients = [],
  loading = false,
  onViewDetails,
  onEditPatient,
  onDeletePatient,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('ALL')
  const [sortField, setSortField] = useState('date-desc')

  // Extract unique conditions
  const conditions = useMemo(() => {
    const set = new Set()
    patients.forEach((p) => {
      if (p.disease) set.add(p.disease.trim())
    })
    return Array.from(set).sort()
  }, [patients])

  // Filter & Sort
  const processedPatients = useMemo(() => {
    let result = patients.filter((patient) => {
      const matchSearch =
        (patient.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchCondition =
        selectedCondition === 'ALL' ||
        (patient.disease || '').toLowerCase() === selectedCondition.toLowerCase()

      return matchSearch && matchCondition
    })

    return result.sort((a, b) => {
      if (sortField === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortField === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '')
      }
      if (sortField === 'date-desc') {
        return (b.id || 0) - (a.id || 0)
      }
      if (sortField === 'date-asc') {
        return (a.id || 0) - (b.id || 0)
      }
      return 0
    })
  }, [patients, searchTerm, selectedCondition, sortField])

  // Condition Badge styling helper
  const getBadgeClass = (disease = '') => {
    const d = disease.toLowerCase()
    if (d.includes('heart') || d.includes('cardio') || d.includes('brain')) {
      return 'bg-danger-subtle text-danger border-danger-subtle'
    }
    if (d.includes('bone') || d.includes('muscle') || d.includes('ortho')) {
      return 'bg-warning-subtle text-warning-emphasis border-warning-subtle'
    }
    return 'bg-info-subtle text-info-emphasis border-info-subtle'
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white mb-4" style={{ border: '1px solid #e2e8f0' }}>
      <div className="card-body p-4">
        {/* Card Header & Controls */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 bg-sky-50 text-primary rounded-3" style={{ backgroundColor: '#e0f2fe' }}>
                <Users size={18} />
              </div>
              <h5 className="fw-bold mb-0 text-dark">Recent Patients</h5>
            </div>
            <small className="text-muted">Clinical records and assigned attending physicians</small>
          </div>

          <Link
            to="/admin/patients"
            className="btn btn-sm btn-outline-primary rounded-pill px-3 d-inline-flex align-items-center gap-1 self-start"
          >
            <span>View All Records ({patients.length})</span>
            <ExternalLink size={14} />
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="row g-2 mb-3">
          {/* Search */}
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Search patient, doctor, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Condition Filter */}
          <div className="col-6 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Filter size={14} />
              </span>
              <select
                className="form-select bg-light border-start-0"
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
              >
                <option value="ALL">All Conditions</option>
                {conditions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="col-6 col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <ArrowUpDown size={14} />
              </span>
              <select
                className="form-select bg-light border-start-0"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name (A → Z)</option>
                <option value="name-desc">Name (Z → A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th scope="col" className="text-muted fw-semibold">ID</th>
                <th scope="col" className="text-muted fw-semibold">Patient Name</th>
                <th scope="col" className="text-muted fw-semibold">Condition</th>
                <th scope="col" className="text-muted fw-semibold">Attending Doctor</th>
                <th scope="col" className="text-muted fw-semibold">Registered</th>
                <th scope="col" className="text-muted fw-semibold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted small">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Loading patient directory...
                  </td>
                </tr>
              ) : processedPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted small">
                    No patient records match the selected filters.
                  </td>
                </tr>
              ) : (
                processedPatients.slice(0, 6).map((patient) => {
                  const isFemale = (patient.gender || '').toLowerCase() === 'female'
                  return (
                    <tr key={patient.id} style={{ fontSize: '0.88rem' }}>
                      <td className="text-muted fw-medium">#{patient.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0"
                            style={{
                              width: 32,
                              height: 32,
                              background: isFemale
                                ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
                                : 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                              fontSize: '0.75rem',
                            }}
                          >
                            {(patient.name || 'P').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block">
                              {patient.name}
                            </span>
                            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                              {patient.email}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge border rounded-pill px-2 py-1 small ${getBadgeClass(
                            patient.disease
                          )}`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {patient.disease || 'General Checkup'}
                        </span>
                      </td>
                      <td>
                        <div>
                          <span className="fw-medium text-dark d-block" style={{ fontSize: '0.84rem' }}>
                            Dr. {patient.doctor?.name || patient.doctor_name || 'Unassigned'}
                          </span>
                          <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {patient.doctor?.specialization || patient.doctor_specialization || 'General Care'}
                          </small>
                        </div>
                      </td>
                      <td className="text-muted small">
                        {patient.created_at
                          ? new Date(patient.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Active'}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-light p-1 rounded-2 text-secondary hover:text-primary"
                            title="View Patient Details"
                            onClick={() => onViewDetails && onViewDetails(patient)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light p-1 rounded-2 text-secondary hover:text-primary"
                            title="Edit Patient"
                            onClick={() => onEditPatient && onEditPatient(patient)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light p-1 rounded-2 text-secondary hover:text-danger"
                            title="Delete Patient"
                            onClick={() => onDeletePatient && onDeletePatient(patient)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
