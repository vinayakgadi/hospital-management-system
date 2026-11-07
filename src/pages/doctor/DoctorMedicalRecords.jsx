import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  FileText,
  PlusCircle,
  Search,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Stethoscope,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'

export default function DoctorMedicalRecords() {
  const [records, setRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({
    patient_id: '',
    symptoms: '',
    observations: '',
    diagnosis: '',
    treatment_plan: '',
    clinical_notes: '',
    follow_up_date: '',
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_BASE_URL}/api/doctor/medical-records`)
      setRecords(Array.isArray(res.data) ? res.data : (res.data.records || []))
    } catch (err) {
      console.error('Failed to load medical records:', err)
      setError(err.response?.data?.error || 'Failed to load medical records.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/doctor/patients`)
      setPatients(res.data || [])
    } catch (err) {
      console.warn('Could not load patients list:', err)
    }
  }

  useEffect(() => {
    fetchRecords()
    fetchPatients()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.patient_id) {
      showToast('Please select a patient.', 'danger')
      return
    }
    if (!form.diagnosis || !form.symptoms) {
      showToast('Please fill in both diagnosis and symptoms.', 'danger')
      return
    }

    try {
      setSubmitting(true)
      await axios.post(`${API_BASE_URL}/api/doctor/medical-records`, {
        patient_id: parseInt(form.patient_id, 10),
        ...form,
      })
      showToast('Medical record documented successfully!')
      setShowModal(false)
      setForm({
        patient_id: '',
        symptoms: '',
        observations: '',
        diagnosis: '',
        treatment_plan: '',
        clinical_notes: '',
        follow_up_date: '',
      })
      fetchRecords()
    } catch (err) {
      console.error('Failed to create medical record:', err)
      showToast(err.response?.data?.error || 'Failed to create record.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredRecords = records.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (r.patient_name || '').toLowerCase().includes(q) ||
      (r.diagnosis || '').toLowerCase().includes(q) ||
      (r.symptoms || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="container-fluid p-0">
      {/* Toast Alert */}
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
              <strong className="d-block small">{toast.type === 'danger' ? 'Error' : 'Success'}</strong>
              <small>{toast.message}</small>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Clinical Medical Records</h1>
          <p className="text-muted small mb-0">
            Document outpatient encounters, diagnostic findings, treatment plans, and clinical observations.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={fetchRecords}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1.5 px-3 py-2"
            onClick={() => setShowModal(true)}
          >
            <PlusCircle size={16} />
            <span>Add Medical Record</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card border-0 rounded-4 shadow-xs bg-white mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted ps-3">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 py-2"
              placeholder="Search by patient name, diagnosis, or symptoms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="alert alert-danger rounded-4 d-flex align-items-center gap-2 p-3 mb-4" role="alert">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-3" role="status">
            <span className="visually-hidden">Loading records...</span>
          </div>
          <p className="text-muted small mb-0">Loading patient encounter notes...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center">
          <FileText size={48} className="text-muted mx-auto mb-3" />
          <h5 className="fw-bold text-dark">No Medical Records Found</h5>
          <p className="text-muted small mb-3">
            {search ? 'No records match your search criteria.' : 'No clinical records have been documented yet.'}
          </p>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm rounded-3"
            onClick={() => setShowModal(true)}
          >
            Document Clinical Encounter
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredRecords.map((rec) => (
            <div key={rec.id} className="card border-0 rounded-4 shadow-xs bg-white overflow-hidden">
              <div className="card-header bg-white border-bottom p-3 px-4 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-white">Record #{rec.id}</span>
                  <Link
                    to={`/doctor/patients/${rec.patient_id}`}
                    className="fw-bold text-dark text-decoration-none hover-primary"
                  >
                    {rec.patient_name}
                  </Link>
                  <span className="text-muted small">({rec.patient_email})</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-light text-secondary border small d-flex align-items-center gap-1">
                    <Calendar size={13} /> {rec.consultation_date}
                  </span>
                  <Link
                    to={`/doctor/patients/${rec.patient_id}`}
                    className="btn btn-outline-primary btn-sm py-1 px-2.5 rounded-3 d-flex align-items-center gap-1"
                  >
                    <Eye size={13} />
                    <span>View Chart</span>
                  </Link>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="mb-2">
                  <h6 className="fw-bold text-primary mb-1">Diagnosis: {rec.diagnosis}</h6>
                </div>
                <div className="row g-3 small">
                  <div className="col-12 col-md-6">
                    <strong className="text-secondary d-block">Symptoms Reported:</strong>
                    <p className="text-dark mb-0">{rec.symptoms}</p>
                  </div>
                  <div className="col-12 col-md-6">
                    <strong className="text-secondary d-block">Observations & Findings:</strong>
                    <p className="text-dark mb-0">{rec.observations || 'None recorded'}</p>
                  </div>
                  <div className="col-12 col-md-6">
                    <strong className="text-secondary d-block">Treatment & Management:</strong>
                    <p className="text-dark mb-0">{rec.treatment_plan || 'Conservative management'}</p>
                  </div>
                  <div className="col-12 col-md-6">
                    <strong className="text-secondary d-block">Clinical Notes:</strong>
                    <p className="text-dark mb-0">{rec.clinical_notes || 'Patient tolerating plan'}</p>
                  </div>
                </div>

                {rec.follow_up_date && (
                  <div className="mt-3 pt-2 border-top d-flex align-items-center gap-1.5 small text-muted">
                    <Clock size={14} className="text-primary" />
                    <span>Next Recommended Follow-Up: <strong className="text-dark">{rec.follow_up_date}</strong></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom p-4">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Document New Clinical Encounter</h5>
                  <small className="text-muted">Record diagnostic findings, treatment instructions, and notes</small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Select Patient *</label>
                      <select
                        className="form-select"
                        value={form.patient_id}
                        onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                        required
                      >
                        <option value="">-- Choose Assigned Patient --</option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (#{p.id}) — {p.disease || 'General Care'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Symptoms Reported *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Headache, blurred vision, dizziness"
                        value={form.symptoms}
                        onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Clinical Diagnosis *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Tension headache with cervical strain"
                        value={form.diagnosis}
                        onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Clinical Observations</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="e.g. Mild muscle tenderness, cranial nerves intact"
                        value={form.observations}
                        onChange={(e) => setForm({ ...form, observations: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Treatment Plan</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="e.g. Hydration, ergonomic workstation adjustment, NSAID PRN"
                        value={form.treatment_plan}
                        onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-dark">Physician Notes</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Advised to return if visual aura occurs"
                        value={form.clinical_notes}
                        onChange={(e) => setForm({ ...form, clinical_notes: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Follow-Up Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.follow_up_date}
                        onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-3 px-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-3 px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving Record...' : 'Save Encounter Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
