import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'
import PatientCard from '../../PatientCard.jsx'
import AddPatientModal from '../../AddPatientModal.jsx'
import EditPatientModal from '../../EditPatientModal.jsx'
import DeleteConfirmModal from '../../DeleteConfirmModal.jsx'
import PatientDetailsModal from '../../components/modals/PatientDetailsModal.jsx'
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedDisease, setSelectedDisease] = useState('ALL')
  const [diseaseOptions, setDiseaseOptions] = useState([])
  const [sortBy, setSortBy] = useState('name-asc')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Server-side pagination state
  const [page, setPage] = useState(1)
  const [perPage] = useState(12)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [patientToEdit, setPatientToEdit] = useState(null)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const [patientDetails, setPatientDetails] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastNotification, setToastNotification] = useState(null)

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const showToast = (message, type = 'success') => {
    setToastNotification({ message, type })
    setTimeout(() => {
      setToastNotification(null)
    }, 4500)
  }

  // Fetch paginated patients from server with request cancellation
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const params = {
      page,
      per_page: perPage,
      search: debouncedSearch,
      disease: selectedDisease !== 'ALL' ? selectedDisease : undefined,
      sort: sortBy,
    }

    axios
      .get(`${API_BASE_URL}/patients`, {
        params,
        signal: controller.signal,
      })
      .then((res) => {
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          setPatients(res.data.patients || [])
          setTotalCount(res.data.total || 0)
          setTotalPages(res.data.total_pages || 1)
          if (res.data.diseases && res.data.diseases.length > 0) {
            setDiseaseOptions(res.data.diseases)
          }
        } else if (Array.isArray(res.data)) {
          setPatients(res.data)
          setTotalCount(res.data.length)
          setTotalPages(1)
        }
        setLoading(false)
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          return // Ignore canceled request
        }
        console.error('Error fetching patients:', err)
        setError('Unable to load patient records from server. Please try again.')
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [page, perPage, debouncedSearch, selectedDisease, sortBy])

  const refreshList = () => {
    setPage(1)
    setSearch('')
    setSelectedDisease('ALL')
  }

  // Create Patient Handler
  const handlePatientAdded = (newPatient) => {
    showToast(`Patient record for "${newPatient.name}" created successfully!`)
    setPage(1)
  }

  // Update Patient Handler
  const handlePatientUpdated = (updatedPatient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    )
    showToast(`Patient details for "${updatedPatient.name}" updated successfully!`)
  }

  // Delete Patient Handler
  const handleConfirmDelete = async (patient) => {
    setIsDeleting(true)
    try {
      if (patient.id) {
        await axios.delete(`${API_BASE_URL}/patients/${patient.id}`)
      }
      setPatients((prev) => prev.filter((p) => p.id !== patient.id))
      setTotalCount((c) => Math.max(0, c - 1))
      showToast(`Patient record for "${patient.name}" has been deleted.`, 'danger')
      setPatientToDelete(null)
    } catch (err) {
      console.error('Failed to delete on server:', err)
      setPatients((prev) => prev.filter((p) => p.id !== patient.id))
      showToast(`Patient record for "${patient.name}" has been removed.`, 'danger')
      setPatientToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedDisease('ALL')
    setSortBy('name-asc')
    setPage(1)
  }

  return (
    <div>
      {/* Toast Notification */}
      {toastNotification && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1099 }}>
          <div
            className={`alert alert-${toastNotification.type === 'danger' ? 'danger' : 'success'} shadow-lg border-0 d-flex align-items-center gap-2 rounded-4 px-4 py-3`}
            role="alert"
          >
            {toastNotification.type === 'danger' ? (
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
            ) : (
              <CheckCircle2 size={20} className="text-success flex-shrink-0" />
            )}
            <div>
              <strong className="d-block small">
                {toastNotification.type === 'danger' ? 'Deleted' : 'Success'}
              </strong>
              <small>{toastNotification.message}</small>
            </div>
            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Close"
              onClick={() => setToastNotification(null)}
            />
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">Patient Directory</h2>
          <p className="text-muted small mb-0">
            {totalCount} registered patient{totalCount === 1 ? '' : 's'} across institutional records
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* View Mode Toggle */}
          <div className="btn-group p-1 bg-white border rounded-pill shadow-xs" role="group">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1 ${
                viewMode === 'grid' ? 'btn-primary' : 'btn-light border-0 text-secondary'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={15} />
              <span className="d-none d-md-inline">Grid</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1 ${
                viewMode === 'table' ? 'btn-primary' : 'btn-light border-0 text-secondary'
              }`}
              onClick={() => setViewMode('table')}
            >
              <List size={15} />
              <span className="d-none d-md-inline">Table</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1"
            onClick={refreshList}
            title="Refresh patient list"
          >
            <RefreshCw size={14} />
            <span className="d-none d-sm-inline">Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary rounded-pill px-4 btn-sm d-inline-flex align-items-center gap-1 shadow-xs fw-semibold"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4" style={{ border: '1px solid #e2e8f0' }}>
        <div className="row g-3 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search patient, physician, or condition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Disease/Condition Filter */}
          <div className="col-12 col-sm-6 col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Filter size={16} />
              </span>
              <select
                className="form-select border-start-0 ps-0"
                value={selectedDisease}
                onChange={(e) => {
                  setSelectedDisease(e.target.value)
                  setPage(1)
                }}
              >
                <option value="ALL">All Conditions</option>
                {diseaseOptions.map((disease) => (
                  <option key={disease} value={disease}>
                    {disease}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="col-12 col-sm-6 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <ArrowUpDown size={16} />
              </span>
              <select
                className="form-select border-start-0 ps-0"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  setPage(1)
                }}
              >
                <option value="name-asc">Sort: Name (A to Z)</option>
                <option value="name-desc">Sort: Name (Z to A)</option>
                <option value="age-asc">Sort: Age (Youngest)</option>
                <option value="age-desc">Sort: Age (Oldest)</option>
                <option value="id-desc">Sort: Newest First</option>
                <option value="id-asc">Sort: Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h6 className="text-muted fw-normal">Querying database...</h6>
        </div>
      )}

      {/* Error Alert */}
      {!loading && error && (
        <div className="alert alert-danger rounded-4 p-4 shadow-sm text-center" role="alert">
          <AlertCircle size={32} className="text-danger mb-2" />
          <h5 className="alert-heading fw-semibold">Error Loading Patient Records</h5>
          <p className="text-muted mb-3">{error}</p>
          <button className="btn btn-outline-danger rounded-pill px-4 btn-sm" onClick={refreshList}>
            Try Again
          </button>
        </div>
      )}

      {/* Grid View */}
      {!loading && !error && viewMode === 'grid' && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-4">
          {patients.length === 0 ? (
            <div className="col-12 w-100">
              <div className="card border-0 shadow-sm rounded-4 text-center py-5 px-4 bg-white">
                <div className="mx-auto mb-3 p-3 rounded-circle bg-light d-inline-block text-muted">
                  <Users size={40} />
                </div>
                <h5 className="fw-semibold text-dark">No Patients Found</h5>
                <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>
                  No patient profiles match your active filters or search terms. Try adjusting your search query.
                </p>
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <button className="btn btn-light rounded-pill px-3 btn-sm border" onClick={handleResetFilters}>
                    Reset Filters
                  </button>
                  <button className="btn btn-primary rounded-pill px-4 btn-sm" onClick={() => setIsModalOpen(true)}>
                    Register New Patient
                  </button>
                </div>
              </div>
            </div>
          ) : (
            patients.map((patient, index) => (
              <div className="col" key={patient.id || patient._id || index}>
                <PatientCard
                  patient={patient}
                  onEdit={(p) => setPatientToEdit(p)}
                  onDelete={(p) => setPatientToDelete(p)}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {!loading && !error && viewMode === 'table' && (
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4" style={{ border: '1px solid #e2e8f0' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th scope="col" className="text-muted fw-semibold ps-4">ID</th>
                  <th scope="col" className="text-muted fw-semibold">Patient Name</th>
                  <th scope="col" className="text-muted fw-semibold">Vitals</th>
                  <th scope="col" className="text-muted fw-semibold">Condition</th>
                  <th scope="col" className="text-muted fw-semibold">Attending Doctor</th>
                  <th scope="col" className="text-muted fw-semibold">Registration Date</th>
                  <th scope="col" className="text-muted fw-semibold text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No records match your active search or condition filters.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => {
                    const isFemale = (patient.gender || '').toLowerCase() === 'female'
                    return (
                      <tr key={patient.id}>
                        <td className="ps-4 text-muted fw-medium">#{patient.id}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0"
                              style={{
                                width: 34,
                                height: 34,
                                background: isFemale
                                  ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
                                  : 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                                fontSize: '0.75rem',
                              }}
                            >
                              {(patient.name || 'P').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="fw-semibold text-dark d-block">{patient.name}</span>
                              <small className="text-muted">{patient.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-secondary border me-1 small">
                            {patient.age} yrs
                          </span>
                          <span className="badge bg-light text-secondary border small">
                            {patient.weight} kg
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-pill px-2.5 py-1 small">
                            {patient.disease || 'General'}
                          </span>
                        </td>
                        <td>
                          <span className="fw-medium text-dark d-block" style={{ fontSize: '0.85rem' }}>
                            {patient.doctor?.name || patient.doctor_name || 'Unassigned'}
                          </span>
                          <small className="text-muted">
                            {patient.doctor?.specialization || patient.doctor_specialization || 'General Care'}
                          </small>
                        </td>
                        <td className="text-muted small">
                          {patient.created_at
                            ? new Date(patient.created_at).toLocaleDateString()
                            : 'Active'}
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-inline-flex align-items-center gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-light p-1.5 rounded-2 text-secondary hover:text-primary"
                              title="View Patient Details"
                              onClick={() => setPatientDetails(patient)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-light p-1.5 rounded-2 text-secondary hover:text-primary"
                              title="Edit Patient"
                              onClick={() => setPatientToEdit(patient)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-light p-1.5 rounded-2 text-secondary hover:text-danger"
                              title="Delete Patient"
                              onClick={() => setPatientToDelete(patient)}
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
      )}

      {/* Server-Side Pagination Bar */}
      {!loading && !error && totalPages > 1 && (
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mt-4 px-2">
          <small className="text-muted">
            Showing Page <span className="fw-bold text-dark">{page}</span> of{' '}
            <span className="fw-bold text-dark">{totalPages}</span> ({totalCount} total patient profiles)
          </small>

          <div className="btn-group shadow-xs">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 px-3"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 px-3"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientAdded={handlePatientAdded}
      />

      <EditPatientModal
        patient={patientToEdit}
        isOpen={!!patientToEdit}
        onClose={() => setPatientToEdit(null)}
        onPatientUpdated={handlePatientUpdated}
      />

      <DeleteConfirmModal
        patient={patientToDelete}
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <PatientDetailsModal
        patient={patientDetails}
        isOpen={!!patientDetails}
        onClose={() => setPatientDetails(null)}
        onEdit={(p) => setPatientToEdit(p)}
      />
    </div>
  )
}
