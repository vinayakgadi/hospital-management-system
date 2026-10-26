import { useState, useEffect, useMemo } from 'react'
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
} from 'lucide-react'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL')
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchDoctors = () => {
    setLoading(true)
    setError(null)
    axios
      .get(`${API_BASE_URL}/api/doctors`)
      .then((res) => {
        setDoctors(Array.isArray(res.data) ? res.data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load doctors:', err)
        setError('Unable to retrieve doctors directory.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleDoctorRegistered = (newDoc) => {
    setDoctors((prev) => [newDoc, ...prev])
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
      showToast(`Account for Dr. ${doc.name} ${newActiveState ? 'activated' : 'deactivated'}.`)
      fetchDoctors()
    } catch (err) {
      console.error('Failed to update doctor status:', err)
      showToast(err.response?.data?.error || 'Failed to update account status.', 'danger')
    } finally {
      setTogglingId(null)
    }
  }

  // Unique specializations
  const specializations = useMemo(() => {
    const set = new Set()
    doctors.forEach((d) => {
      if (d.specialization) set.add(d.specialization.trim())
    })
    return Array.from(set).sort()
  }, [doctors])

  // Filtered
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchSearch =
        (doc.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (doc.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (doc.specialization || '').toLowerCase().includes(search.toLowerCase())

      const matchSpec =
        selectedSpecialization === 'ALL' ||
        (doc.specialization || '').toLowerCase() === selectedSpecialization.toLowerCase()

      return matchSearch && matchSpec
    })
  }, [doctors, search, selectedSpecialization])

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1099 }}>
          <div
            className={`alert alert-${
              toast.type === 'danger' ? 'danger' : 'success'
            } shadow-lg border-0 d-flex align-items-center gap-2 rounded-4 px-4 py-3`}
            role="alert"
          >
            {toast.type === 'danger' ? (
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
            ) : (
              <CheckCircle2 size={20} className="text-success flex-shrink-0" />
            )}
            <div>
              <strong className="d-block small">
                {toast.type === 'danger' ? 'Action Failed' : 'Success'}
              </strong>
              <small>{toast.message}</small>
            </div>
            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Close"
              onClick={() => setToast(null)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">Doctors & Medical Specialists</h2>
          <p className="text-muted small mb-0">
            Credentialed clinical staff directory, departments, and active statuses
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1"
            onClick={fetchDoctors}
            title="Refresh doctor roster"
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
            <span>Register Doctor</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4" style={{ border: '1px solid #e2e8f0' }}>
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search physician by name, email, or specialty..."
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

          {/* Specialization Filter */}
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Filter size={16} />
              </span>
              <select
                className="form-select border-start-0"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                <option value="ALL">All Specializations</option>
                {specializations.map((spec) => (
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
          <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
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
              <h6 className="fw-bold mb-1">Failed to Load Physicians</h6>
              <p className="mb-0 small text-danger-emphasis">{error}</p>
            </div>
            <button className="btn btn-danger btn-sm px-3 rounded-pill" onClick={fetchDoctors}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Doctor Grid */}
      {!loading && !error && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-4">
          {filteredDoctors.length === 0 ? (
            <div className="col-12 w-100">
              <div className="card text-center py-5 px-3 border-0 shadow-sm rounded-4 bg-white">
                <Stethoscope size={40} className="text-muted mx-auto mb-3" />
                <h5 className="fw-bold text-dark">No Physicians Found</h5>
                <p className="text-muted small mb-3">No doctors match your active search filters.</p>
                <button
                  className="btn btn-primary rounded-pill px-4 btn-sm mx-auto"
                  onClick={() => setIsRegisterOpen(true)}
                >
                  Register New Doctor
                </button>
              </div>
            </div>
          ) : (
            filteredDoctors.map((doc) => {
              const isActive = (doc.status || '').toLowerCase() === 'active'
              return (
                <div className="col" key={doc.id}>
                  <div
                    className="card border-0 shadow-sm rounded-4 h-100 bg-white transition-all overflow-hidden"
                    style={{
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      opacity: isActive ? 1 : 0.75,
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
                      {/* Header */}
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

      {/* Modal */}
      <RegisterDoctorModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onDoctorRegistered={handleDoctorRegistered}
      />
    </div>
  )
}
