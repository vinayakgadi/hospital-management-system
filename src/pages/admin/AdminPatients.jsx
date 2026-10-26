import { useState, useEffect, useMemo } from 'react'
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
} from 'lucide-react'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [selectedDisease, setSelectedDisease] = useState('ALL')
  const [sortBy, setSortBy] = useState('name-asc')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [patientToEdit, setPatientToEdit] = useState(null)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const [patientDetails, setPatientDetails] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastNotification, setToastNotification] = useState(null)

  const showToast = (message, type = 'success') => {
    setToastNotification({ message, type })
    setTimeout(() => {
      setToastNotification(null)
    }, 4500)
  }

  const fetchPatients = () => {
    setLoading(true)
    setError(null)
    axios
      .get(`${API_BASE_URL}/patients`)
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

  // Create Patient Handler
  const handlePatientAdded = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev])
    showToast(`Patient record for "${newPatient.name}" created successfully!`)
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
      showToast(`Patient record for "${patient.name}" has been deleted.`, 'danger')
      setPatientToDelete(null)
    } catch (err) {
      console.error('Failed to delete on server:', err)
      setPatients((prev) => prev.filter((p) => p.id !== patient.id))
      showToast(`Patient record for "${patient.name}" has been deleted.`, 'danger')
      setPatientToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // Extract unique disease list
  const diseaseOptions = useMemo(() => {
    const list = new Set()
    patients.forEach((p) => {
      if (p.disease) list.add(p.disease.trim())
    })
    return Array.from(list).sort()
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

    return result.sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '')
      if (sortBy === 'age-asc') return Number(a.age || 0) - Number(b.age || 0)
      if (sortBy === 'age-desc') return Number(b.age || 0) - Number(a.age || 0)
      return 0
    })
  }, [patients, search, selectedDisease, sortBy])

  const handleResetFilters = () => {
    setSearch('')
    setSelectedDisease('ALL')
    setSortBy('name-asc')
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

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">Patient Management Directory</h2>
          <p className="text-muted small mb-0">
            Comprehensive patient registry, condition tracking, and clinical details
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* View Mode Toggle */}
          <div className="btn-group btn-group-sm p-1 bg-white border rounded-pill shadow-xs" role="group">
            <button
              type="button"
              className={`btn rounded-pill px-3 py-1 ${viewMode === 'grid' ? 'btn-primary' : 'btn-light border-0 text-secondary'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={14} className="me-1" />
              Grid
            </button>
            <button
              type="button"
              className={`btn rounded-pill px-3 py-1 ${viewMode === 'table' ? 'btn-primary' : 'btn-light border-0 text-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={14} className="me-1" />
              Table
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1"
            onClick={fetchPatients}
            title="Refresh patient list"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1 shadow-xs fw-semibold"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4" style={{ border: '1px solid #e2e8f0' }}>
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Search size={16} />
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
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="col-12 col-sm-6 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Filter size={16} />
              </span>
              <select
                className="form-select border-start-0"
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

          {/* Sort */}
          <div className="col-12 col-sm-6 col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <ArrowUpDown size={16} />
              </span>
              <select
                className="form-select border-start-0"
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

      {/* Results Metadata */}
      {!loading && !error && (
        <div className="d-flex justify-content-between align-items-center mb-3 px-1 text-muted small">
          <div>
            Showing <strong className="text-dark">{filteredPatients.length}</strong> of{' '}
            <strong className="text-dark">{patients.length}</strong> registered patients
            {(search || selectedDisease !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="btn btn-sm btn-link text-primary text-decoration-none ms-2 p-0"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h6 className="text-muted fw-normal">Retrieving medical directory...</h6>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="alert alert-danger p-4 rounded-4 shadow-sm my-4">
          <div className="d-flex align-items-center gap-3">
            <AlertCircle size={28} className="text-danger flex-shrink-0" />
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

      {/* Grid View */}
      {!loading && !error && viewMode === 'grid' && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4 mb-4">
          {filteredPatients.length === 0 ? (
            <div className="col-12 w-100">
              <div className="card text-center py-5 px-3 border-0 shadow-sm rounded-4 bg-white">
                <Users size={40} className="text-muted mx-auto mb-3" />
                <h5 className="fw-bold text-dark">No Patients Found</h5>
                <p className="text-muted small mb-3">No records match your active search or condition filters.</p>
                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-outline-secondary rounded-pill px-4 btn-sm" onClick={handleResetFilters}>
                    Reset Filters
                  </button>
                  <button className="btn btn-primary rounded-pill px-4 btn-sm" onClick={() => setIsModalOpen(true)}>
                    Register New Patient
                  </button>
                </div>
              </div>
            </div>
          ) : (
            filteredPatients.map((patient, index) => (
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
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No records match your active search or condition filters.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
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
                            Dr. {patient.doctor?.name || patient.doctor_name || 'Unassigned'}
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
