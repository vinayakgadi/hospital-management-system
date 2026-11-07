import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'
import RegisterDoctorModal from '../../components/modals/RegisterDoctorModal.jsx'
import {
  UserPlus,
  Stethoscope,
  Search,
  Filter,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL')
  const [specializationOptions, setSpecializationOptions] = useState([])
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [toast, setToast] = useState(null)

  // Server-side pagination
  const [page, setPage] = useState(1)
  const [perPage] = useState(12)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Fetch paginated doctors from server with cancellation
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const params = {
      page,
      per_page: perPage,
      search: debouncedSearch,
      specialization: selectedSpecialization !== 'ALL' ? selectedSpecialization : undefined,
    }

    axios
      .get(`${API_BASE_URL}/api/doctors`, {
        params,
        signal: controller.signal,
      })
      .then((res) => {
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          setDoctors(res.data.doctors || [])
          setTotalCount(res.data.total || 0)
          setTotalPages(res.data.total_pages || 1)
          if (res.data.specializations && res.data.specializations.length > 0) {
            setSpecializationOptions(res.data.specializations)
          }
        } else if (Array.isArray(res.data)) {
          setDoctors(res.data)
          setTotalCount(res.data.length)
          setTotalPages(1)
        }
        setLoading(false)
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          return
        }
        console.error('Failed to load doctors:', err)
        setError('Unable to retrieve doctors directory.')
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [page, perPage, debouncedSearch, selectedSpecialization])

  const handleDoctorRegistered = (newDoc) => {
    setPage(1)
    showToast(`Physician "${newDoc.name}" registered successfully!`)
  }

  const handleToggleStatus = async (doc) => {
    if (!doc.user_id) {
      showToast('No user account linked to this physician profile.', 'danger')
      return
    }

    const isCurrentlyActive = (doc.status || '').toLowerCase() === 'active'
    const newActiveState = !isCurrentlyActive
    const actionLabel = newActiveState ? 'activate' : 'deactivate'

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} Dr. ${doc.name}'s account? ${
          !newActiveState ? 'Their active sessions will be terminated immediately.' : ''
        }`
      )
    ) {
      return
    }

    setTogglingId(doc.id)
    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${doc.user_id}/status`, {
        is_active: newActiveState,
      })

      setDoctors((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status: newActiveState ? 'Active' : 'Inactive' } : d))
      )
      showToast(`Physician ${doc.name} account ${actionLabel}d.`)
    } catch (err) {
      console.error('Failed to toggle status:', err)
      showToast(`Failed to ${actionLabel} physician.`, 'danger')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1099 }}>
          <div
            className={`alert alert-${toast.type === 'danger' ? 'danger' : 'success'} shadow-lg border-0 d-flex align-items-center gap-2 rounded-4 px-4 py-3`}
            role="alert"
          >
            {toast.type === 'danger' ? (
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
            ) : (
              <CheckCircle2 size={20} className="text-success flex-shrink-0" />
            )}
            <div>
              <strong className="d-block small">
                {toast.type === 'danger' ? 'Notice' : 'Success'}
              </strong>
              <small>{toast.message}</small>
            </div>
            <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={() => setToast(null)} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">Clinical Faculty & Physicians</h2>
          <p className="text-muted small mb-0">
            {totalCount} credentialed physician{totalCount === 1 ? '' : 's'} across institutional specialties
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1"
            onClick={() => setPage(1)}
            title="Refresh list"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-primary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1 shadow-xs fw-semibold"
            onClick={() => setIsRegisterOpen(true)}
          >
            <Plus size={16} />
            <span>Credential Physician</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4" style={{ border: '1px solid #e2e8f0' }}>
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-7">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by physician name, specialty, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Specialty Filter */}
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Filter size={16} />
              </span>
              <select
                className="form-select border-start-0 ps-0"
                value={selectedSpecialization}
                onChange={(e) => {
                  setSelectedSpecialization(e.target.value)
                  setPage(1)
                }}
              >
                <option value="ALL">All Medical Specialties</option>
                {specializationOptions.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h6 className="text-muted fw-normal">Retrieving physicians directory...</h6>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="alert alert-danger rounded-4 p-4 shadow-sm text-center" role="alert">
          <AlertCircle size={32} className="text-danger mb-2" />
          <h5 className="alert-heading fw-semibold">Error Loading Doctors</h5>
          <p className="text-muted mb-3">{error}</p>
          <button className="btn btn-outline-danger rounded-pill px-4 btn-sm" onClick={() => setPage(1)}>
            Try Again
          </button>
        </div>
      )}

      {/* Grid of Doctor Cards */}
      {!loading && !error && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-4">
          {doctors.length === 0 ? (
            <div className="col-12 w-100">
              <div className="card border-0 shadow-sm rounded-4 text-center py-5 px-4 bg-white">
                <div className="mx-auto mb-3 p-3 rounded-circle bg-light d-inline-block text-muted">
                  <Stethoscope size={40} />
                </div>
                <h5 className="fw-semibold text-dark">No Physicians Found</h5>
                <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>
                  No doctors match your active search terms or clinical specialization filter.
                </p>
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <button
                    className="btn btn-light rounded-pill px-3 btn-sm border"
                    onClick={() => {
                      setSearch('')
                      setSelectedSpecialization('ALL')
                      setPage(1)
                    }}
                  >
                    Reset Filters
                  </button>
                  <button className="btn btn-primary rounded-pill px-4 btn-sm" onClick={() => setIsRegisterOpen(true)}>
                    Register Physician
                  </button>
                </div>
              </div>
            </div>
          ) : (
            doctors.map((doc) => {
              const isActive = (doc.status || '').toLowerCase() === 'active'
              return (
                <div className="col" key={doc.id}>
                  <div
                    className="card border-0 shadow-sm rounded-4 h-100 bg-white hover-shadow transition-all"
                    style={{ border: '1px solid #e2e8f0' }}
                  >
                    <div className="card-body p-4 d-flex flex-column">
                      {/* Top Header */}
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                            style={{
                              width: 48,
                              height: 48,
                              background: isActive
                                ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)'
                                : 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                              fontSize: '1.1rem',
                            }}
                          >
                            DR
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
                              {doc.name}
                            </h5>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill small mt-1">
                              {doc.specialization}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`badge rounded-pill small ${
                            isActive
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : 'bg-danger-subtle text-danger border border-danger-subtle'
                          }`}
                        >
                          {isActive ? 'Active Duty' : 'Deactivated'}
                        </span>
                      </div>

                      {/* Contact details */}
                      <div className="py-2 border-top border-bottom my-2">
                        <div className="d-flex align-items-center gap-2 text-secondary small mb-2">
                          <Mail size={15} className="text-muted" />
                          <span className="text-truncate">{doc.email}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-secondary small">
                          <Phone size={15} className="text-muted" />
                          <span>{doc.phone || '555-0199'}</span>
                        </div>
                      </div>

                      {/* Metadata Footer & Deactivation Action */}
                      <div className="mt-auto pt-3 d-flex align-items-center justify-content-between">
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                          ID: #{doc.id}
                        </span>

                        {doc.user_id && (
                          <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1 ${
                              isActive ? 'btn-outline-danger' : 'btn-outline-success'
                            }`}
                            style={{ fontSize: '0.75rem' }}
                            disabled={togglingId === doc.id}
                            onClick={() => handleToggleStatus(doc)}
                          >
                            {isActive ? (
                              <>
                                <UserX size={13} />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck size={13} />
                                <span>Reactivate</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && !error && totalPages > 1 && (
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mt-4 px-2">
          <small className="text-muted">
            Showing Page <span className="fw-bold text-dark">{page}</span> of{' '}
            <span className="fw-bold text-dark">{totalPages}</span> ({totalCount} total physicians)
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

      {/* Modal */}
      <RegisterDoctorModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onDoctorRegistered={handleDoctorRegistered}
      />
    </div>
  )
}
