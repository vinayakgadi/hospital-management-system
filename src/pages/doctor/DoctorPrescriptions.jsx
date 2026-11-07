import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  Pill,
  PlusCircle,
  Search,
  Filter,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  HeartPulse,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function DoctorPrescriptions() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [printRx, setPrintRx] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({
    patient_id: '',
    medication_name: '',
    dosage: '',
    frequency: 'Once daily (QD)',
    duration: '7 days',
    route: 'Oral',
    instructions: 'Take after meals with water.',
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_BASE_URL}/api/doctor/prescriptions`)
      setPrescriptions(Array.isArray(res.data) ? res.data : (res.data.prescriptions || []))
    } catch (err) {
      console.error('Failed to load prescriptions:', err)
      setError(err.response?.data?.error || 'Failed to load prescriptions.')
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
    fetchPrescriptions()
    fetchPatients()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.patient_id) {
      showToast('Please select a patient.', 'danger')
      return
    }
    if (!form.medication_name || !form.dosage) {
      showToast('Medication name and dosage are required.', 'danger')
      return
    }

    try {
      setSubmitting(true)
      await axios.post(`${API_BASE_URL}/api/doctor/prescriptions`, {
        patient_id: parseInt(form.patient_id, 10),
        ...form,
      })
      showToast('Prescription issued successfully!')
      setShowModal(false)
      setForm({
        patient_id: '',
        medication_name: '',
        dosage: '',
        frequency: 'Once daily (QD)',
        duration: '7 days',
        route: 'Oral',
        instructions: 'Take after meals with water.',
      })
      fetchPrescriptions()
    } catch (err) {
      console.error('Failed to issue prescription:', err)
      showToast(err.response?.data?.error || 'Failed to issue prescription.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const filteredRx = prescriptions.filter((rx) => {
    const matchesSearch =
      !search ||
      (rx.patient_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (rx.medication_name || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || rx.status === statusFilter
    return matchesSearch && matchesStatus
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
          <h1 className="h4 fw-bold text-dark mb-1">Prescription Management</h1>
          <p className="text-muted small mb-0">
            Create, track, and print clinical prescriptions and pharmaceutical orders.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={fetchPrescriptions}
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
            <span>New Prescription</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card border-0 rounded-4 shadow-xs bg-white mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted ps-3">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 py-2"
                  placeholder="Search by medication name or patient..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-4">
              <select
                className="form-select bg-light py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="ALL">All Prescription Statuses</option>
                <option value="Active">Active Regimens</option>
                <option value="Completed">Completed Regimens</option>
              </select>
            </div>
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
            <span className="visually-hidden">Loading prescriptions...</span>
          </div>
          <p className="text-muted small mb-0">Retrieving prescription records...</p>
        </div>
      ) : filteredRx.length === 0 ? (
        <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center">
          <Pill size={48} className="text-muted mx-auto mb-3" />
          <h5 className="fw-bold text-dark">No Prescriptions Found</h5>
          <p className="text-muted small mb-3">
            {search || statusFilter !== 'ALL'
              ? 'No prescriptions match your current filters.'
              : 'You have not issued any prescriptions yet.'}
          </p>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm rounded-3"
            onClick={() => setShowModal(true)}
          >
            Write Prescription
          </button>
        </div>
      ) : (
        <div className="card border-0 rounded-4 shadow-xs bg-white overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="text-secondary small">
                  <th className="ps-4">Patient</th>
                  <th>Medication & Dosage</th>
                  <th>Frequency & Route</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                  <th>Date Issued</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRx.map((rx) => (
                  <tr key={rx.id}>
                    <td className="ps-4">
                      <Link
                        to={`/doctor/patients/${rx.patient_id}`}
                        className="fw-bold text-dark text-decoration-none hover-primary d-block"
                      >
                        {rx.patient_name}
                      </Link>
                      <small className="text-muted">{rx.patient_email}</small>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{rx.medication_name}</div>
                      <span className="badge bg-light text-secondary border small">{rx.dosage}</span>
                    </td>
                    <td className="small">
                      <div className="text-dark fw-medium">{rx.frequency}</div>
                      <small className="text-muted">{rx.route || 'Oral'}</small>
                    </td>
                    <td className="small text-dark">{rx.duration}</td>
                    <td className="small text-muted" style={{ maxWidth: '200px' }}>
                      {rx.instructions}
                    </td>
                    <td className="small text-muted">{rx.prescription_date}</td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          rx.status === 'Active'
                            ? 'bg-success-subtle text-success'
                            : 'bg-light text-muted border'
                        }`}
                      >
                        {rx.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-3 d-inline-flex align-items-center gap-1 py-1 px-2.5"
                        onClick={() => setPrintRx(rx)}
                        title="View printable official prescription"
                      >
                        <Printer size={14} />
                        <span>Print Rx</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Create Prescription */}
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
                  <h5 className="modal-title fw-bold text-dark">Issue New Prescription</h5>
                  <small className="text-muted">Prescribe medication regimen for an assigned patient</small>
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

                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-dark">Medication Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Lisinopril, Metformin, Amoxicillin, Atorvastatin"
                        value={form.medication_name}
                        onChange={(e) => setForm({ ...form, medication_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Dosage *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 10mg, 500mg, 100mcg"
                        value={form.dosage}
                        onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Frequency</label>
                      <select
                        className="form-select"
                        value={form.frequency}
                        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      >
                        <option value="Once daily (QD)">Once daily (QD)</option>
                        <option value="Twice daily (BID)">Twice daily (BID)</option>
                        <option value="Three times daily (TID)">Three times daily (TID)</option>
                        <option value="Four times daily (QID)">Four times daily (QID)</option>
                        <option value="Every 8 hours">Every 8 hours</option>
                        <option value="At bedtime (QHS)">At bedtime (QHS)</option>
                        <option value="As needed (PRN)">As needed (PRN)</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Duration</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 5 days, 14 days, 30 days"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Administration Route</label>
                      <select
                        className="form-select"
                        value={form.route}
                        onChange={(e) => setForm({ ...form, route: e.target.value })}
                      >
                        <option value="Oral">Oral (PO)</option>
                        <option value="Sublingual">Sublingual (SL)</option>
                        <option value="Inhalation">Inhalation</option>
                        <option value="Topical">Topical</option>
                        <option value="Intravenous (IV)">Intravenous (IV)</option>
                        <option value="Subcutaneous (SC)">Subcutaneous (SC)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Patient Instructions</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Take with a glass of water after food. Do not chew."
                        value={form.instructions}
                        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
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
                    {submitting ? 'Authorizing...' : 'Issue Prescription'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Printable Official Prescription Preview */}
      {printRx && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom p-3 px-4 bg-light d-flex justify-content-between align-items-center">
                <span className="fw-bold small text-dark">Official HealthPulse Electronic Prescription (eRx)</span>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1.5"
                    onClick={handlePrint}
                  >
                    <Printer size={15} />
                    <span>Print Document</span>
                  </button>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setPrintRx(null)}
                  />
                </div>
              </div>

              {/* Printable Body */}
              <div className="modal-body p-4 p-md-5 bg-white print-area" id="rx-print-area">
                {/* Header letterhead */}
                <div className="d-flex align-items-start justify-content-between pb-3 mb-4 border-bottom border-2 border-primary">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center"
                      style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
                    >
                      <HeartPulse size={24} />
                    </div>
                    <div>
                      <h4 className="fw-bold text-dark mb-0 tracking-wide">
                        Health<span className="text-primary">Pulse</span> Clinic
                      </h4>
                      <small className="text-muted">Advanced Healthcare System & Clinical Practice</small>
                    </div>
                  </div>

                  <div className="text-end small text-muted">
                    <div className="fw-bold text-dark">{printRx.doctor_name || user?.name || 'Dr. Satya Deep'}</div>
                    <div>{printRx.doctor_specialization || 'Cardiology Specialist'}</div>
                    <div>Lic: HP-MED-92841</div>
                  </div>
                </div>

                {/* Patient Information Box */}
                <div className="p-3 rounded-3 bg-light border mb-4">
                  <div className="row g-2 small">
                    <div className="col-6">
                      <span className="text-muted">Patient Name:</span>{' '}
                      <strong className="text-dark">{printRx.patient_name}</strong>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-muted">Date:</span>{' '}
                      <strong className="text-dark">{printRx.prescription_date}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted">Patient Email:</span>{' '}
                      <strong className="text-dark">{printRx.patient_email}</strong>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-muted">Rx Number:</span>{' '}
                      <strong className="text-dark">HP-RX-{printRx.id.toString().padStart(5, '0')}</strong>
                    </div>
                  </div>
                </div>

                {/* Rx Symbol */}
                <div className="d-flex align-items-baseline gap-2 mb-3">
                  <span className="font-monospace fw-bold display-6 text-primary">℞</span>
                  <span className="fw-bold text-secondary text-uppercase small">Authorized Prescription Order</span>
                </div>

                {/* Medication Details */}
                <div className="table-responsive mb-4">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr className="small text-secondary">
                        <th>Medication & Strength</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Route</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold text-dark">{printRx.medication_name}</td>
                        <td>{printRx.dosage}</td>
                        <td>{printRx.frequency}</td>
                        <td>{printRx.route || 'Oral'}</td>
                        <td>{printRx.duration}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Instructions */}
                <div className="p-3 rounded-3 bg-light-subtle border mb-5">
                  <div className="fw-bold small text-dark mb-1">Direction / Special Instructions:</div>
                  <p className="mb-0 small text-secondary">{printRx.instructions || 'Take as directed.'}</p>
                </div>

                {/* Doctor Signature Area */}
                <div className="row align-items-end pt-4 mt-4 border-top">
                  <div className="col-7 small text-muted">
                    <div>Valid for dispense at licensed pharmacies.</div>
                    <div className="text-secondary">Security Hash: SHA256-ERX-HP-{printRx.id}</div>
                  </div>
                  <div className="col-5 text-center">
                    <div className="font-italic mb-1" style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#0369a1' }}>
                      {printRx.doctor_name || 'Dr. Satya Deep, MD'}
                    </div>
                    <div className="border-top pt-1 small text-dark fw-bold">Physician Signature & Seal</div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light border-top p-3 px-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-3"
                  onClick={() => setPrintRx(null)}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
