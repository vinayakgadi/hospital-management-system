import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import PatientCard from './PatientCard.jsx'

function App() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [selectedDisease, setSelectedDisease] = useState('ALL')
  const [sortBy, setSortBy] = useState('name-asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPatients = () => {
    setLoading(true)
    setError(null)
    axios
      .get('https://doc-back.onrender.com/patients')
      .then((res) => {
        setPatients(Array.isArray(res.data) ? res.data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching patients:', err)
        setError('Unable to load patient records from server. Please try again.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // Extract unique disease list for filter options
  const diseaseOptions = useMemo(() => {
    const list = new Set()
    patients.forEach((p) => {
      if (p.disease) list.add(p.disease.trim())
    })
    return Array.from(list).sort()
  }, [patients])

  // Extract unique doctor count
  const uniqueDoctorsCount = useMemo(() => {
    const list = new Set()
    patients.forEach((p) => {
      if (p.doctor?.name) list.add(p.doctor.name)
    })
    return list.size
  }, [patients])

  // Filter and Sort logic
  const filteredPatients = useMemo(() => {
    let result = patients.filter((patient) => {
      const matchesSearch =
        (patient.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (patient.doctor?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (patient.email || '').toLowerCase().includes(search.toLowerCase())

      const matchesDisease =
        selectedDisease === 'ALL' ||
        (patient.disease || '').toLowerCase() === selectedDisease.toLowerCase()

      return matchesSearch && matchesDisease
    })

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '')
      }
      if (sortBy === 'age-asc') {
        return Number(a.age || 0) - Number(b.age || 0)
      }
      if (sortBy === 'age-desc') {
        return Number(b.age || 0) - Number(a.age || 0)
      }
      return 0
    })
  }, [patients, search, selectedDisease, sortBy])

  const handleResetFilters = () => {
    setSearch('')
    setSelectedDisease('ALL')
    setSortBy('name-asc')
  }

  return (
    <div className="min-vh-100 bg-light pb-5">
      {/* Hero Header */}
      <header className="header-hero shadow-sm">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="p-2 bg-primary bg-opacity-25 rounded-3 d-inline-flex text-info fs-4">
                  <i className="bi bi-heart-pulse-fill text-danger"></i>
                </span>
                <h2 className="fw-bold mb-0 text-white tracking-tight">HealthPulse</h2>
              </div>
              <p className="text-white-50 mb-0">
                Centralized Patient Directory & Clinical Care Portal
              </p>
            </div>

            {/* Quick Stat Counter Pills */}
            <div className="d-flex flex-wrap gap-2">
              <div className="stat-pill text-center">
                <small className="d-block text-white-50" style={{ fontSize: '0.75rem' }}>
                  Total Patients
                </small>
                <strong className="fs-5">{patients.length}</strong>
              </div>
              <div className="stat-pill text-center">
                <small className="d-block text-white-50" style={{ fontSize: '0.75rem' }}>
                  Active Doctors
                </small>
                <strong className="fs-5">{uniqueDoctorsCount}</strong>
              </div>
              <div className="stat-pill text-center">
                <small className="d-block text-white-50" style={{ fontSize: '0.75rem' }}>
                  Conditions
                </small>
                <strong className="fs-5">{diseaseOptions.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container">
        {/* Search & Filter Toolbar Card */}
        <div className="search-box-card mb-4">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group search-input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by patient, doctor, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="btn btn-link text-muted text-decoration-none"
                    type="button"
                    onClick={() => setSearch('')}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Condition Dropdown */}
            <div className="col-12 col-sm-6 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-funnel"></i>
                </span>
                <select
                  className="form-select form-select-custom border-start-0"
                  value={selectedDisease}
                  onChange={(e) => setSelectedDisease(e.target.value)}
                >
                  <option value="ALL">All Medical Conditions</option>
                  {diseaseOptions.map((disease) => (
                    <option key={disease} value={disease}>
                      {disease}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort by Dropdown */}
            <div className="col-12 col-sm-6 col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-sort-down"></i>
                </span>
                <select
                  className="form-select form-select-custom border-start-0"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                  <option value="age-asc">Age (Youngest First)</option>
                  <option value="age-desc">Age (Oldest First)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Metadata Bar */}
        {!loading && !error && (
          <div className="d-flex justify-content-between align-items-center mb-4 px-1">
            <div className="text-muted small">
              Showing <strong className="text-dark">{filteredPatients.length}</strong> of{' '}
              <strong className="text-dark">{patients.length}</strong> patient records
              {(search || selectedDisease !== 'ALL') && (
                <button
                  onClick={handleResetFilters}
                  className="btn btn-sm btn-link text-primary text-decoration-none ms-2 p-0"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <button
              onClick={fetchPatients}
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              title="Refresh records"
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-5 my-5">
            <div
              className="spinner-border text-primary mb-3"
              style={{ width: '3rem', height: '3rem' }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted fw-normal">Retrieving medical directory...</h5>
          </div>
        )}

        {/* Error Banner */}
        {error && !loading && (
          <div className="alert alert-danger p-4 rounded-4 shadow-sm my-4">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-exclamation-triangle-fill fs-2 text-danger"></i>
              <div className="flex-grow-1">
                <h6 className="fw-bold mb-1">Failed to Load Records</h6>
                <p className="mb-0 small text-danger-emphasis">{error}</p>
              </div>
              <button className="btn btn-danger btn-sm px-3 rounded-pill" onClick={fetchPatients}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Patient Grid */}
        {!loading && !error && (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {filteredPatients.length === 0 ? (
              <div className="col-12 w-100">
                <div className="card text-center py-5 px-3 border-0 shadow-sm rounded-4 bg-white">
                  <div className="mb-3">
                    <span className="p-3 bg-light rounded-circle d-inline-flex text-muted fs-1">
                      <i className="bi bi-search"></i>
                    </span>
                  </div>
                  <h5 className="fw-bold text-dark">No Patients Found</h5>
                  <p className="text-muted small mb-3">
                    No records match your active search or condition filters.
                  </p>
                  <div>
                    <button
                      className="btn btn-primary rounded-pill px-4 btn-sm"
                      onClick={handleResetFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              filteredPatients.map((patient, index) => (
                <div className="col" key={patient.id || patient._id || index}>
                  <PatientCard patient={patient} />
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App