import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  User,
  HeartPulse,
  Calendar,
  FileText,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  AlertTriangle,
  PlusCircle,
  Printer,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'

export default function DoctorPatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'history' | 'consultations' | 'prescriptions' | 'appointments'

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showRxModal, setShowRxModal] = useState(false)
  const [toast, setToast] = useState(null)

  // Form states
  const [recordForm, setRecordForm] = useState({
    symptoms: '',
    observations: '',
    diagnosis: '',
    treatment_plan: '',
    clinical_notes: '',
    follow_up_date: '',
  })

  const [rxForm, setRxForm] = useState({
    medication_name: '',
    dosage: '',
    frequency: 'Once daily (QD)',
    duration: '7 days',
    route: 'Oral',
    instructions: 'Take after meals with a glass of water.',
  })

  const [submitting, setSubmitting] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchChart = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_BASE_URL}/api/doctor/patients/${id}`)
      setData(res.data)
    } catch (err) {
      console.error('Failed to load patient chart:', err)
      setError(err.response?.data?.error || 'Unable to retrieve authorized patient chart.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchChart()
  }, [id])

  const handleAddRecord = async (e) => {
    e.preventDefault()
    if (!recordForm.diagnosis || !recordForm.symptoms) {
      showToast('Please enter both diagnosis and symptoms.', 'danger')
      return
    }

    try {
      setSubmitting(true)
      await axios.post(`${API_BASE_URL}/api/doctor/medical-records`, {
        patient_id: parseInt(id, 10),
        ...recordForm,
      })
      showToast('Clinical encounter record saved successfully!')
      setShowRecordModal(false)
      setRecordForm({
        symptoms: '',
        observations: '',
        diagnosis: '',
        treatment_plan: '',
        clinical_notes: '',
        follow_up_date: '',
      })
      fetchChart()
    } catch (err) {
      console.error('Failed to save record:', err)
      showToast(err.response?.data?.error || 'Failed to save record.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddRx = async (e) => {
    e.preventDefault()
    if (!rxForm.medication_name || !rxForm.dosage) {
      showToast('Medication name and dosage are required.', 'danger')
      return
    }

    try {
      setSubmitting(true)
      await axios.post(`${API_BASE_URL}/api/doctor/prescriptions`, {
        patient_id: parseInt(id, 10),
        ...rxForm,
      })
      showToast('Prescription issued successfully!')
      setShowRxModal(false)
      setRxForm({
        medication_name: '',
        dosage: '',
        frequency: 'Once daily (QD)',
        duration: '7 days',
        route: 'Oral',
        instructions: 'Take after meals with a glass of water.',
      })
      fetchChart()
    } catch (err) {
      console.error('Failed to issue prescription:', err)
      showToast(err.response?.data?.error || 'Failed to issue prescription.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center my-4">
        <div className="spinner-border text-primary mx-auto mb-3" role="status">
          <span className="visually-hidden">Loading medical chart...</span>
        </div>
        <h6 className="fw-semibold text-dark">Accessing Electronic Health Record (EHR)...</h6>
        <p className="text-muted small mb-0">Verifying clinical authorization and retrieving clinical history.</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center my-4">
        <ShieldAlert size={48} className="text-danger mx-auto mb-3" />
        <h5 className="fw-bold text-dark">Access Restricted or Chart Not Found</h5>
        <p className="text-muted small mb-4">{error || 'Could not find this patient.'}</p>
        <div>
          <Link to="/doctor/patients" className="btn btn-primary btn-sm rounded-3 px-4">
            Return to Patients Directory
          </Link>
        </div>
      </div>
    )
  }

  const { patient, medical_history, consultations, prescriptions, appointments } = data

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

      {/* Back button */}
      <div className="mb-3">
        <Link
          to="/doctor/patients"
          className="btn btn-link text-decoration-none text-muted p-0 d-inline-flex align-items-center gap-1.5 small fw-medium"
        >
          <ArrowLeft size={16} />
          <span>Back to Patients Directory</span>
        </Link>
      </div>

      {/* Patient Header Banner */}
      <div className="card border-0 rounded-4 shadow-xs bg-white mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  fontSize: '1.4rem',
                }}
              >
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h4 className="fw-bold mb-0 text-dark">{patient.name}</h4>
                  <span className="badge bg-primary-subtle text-primary px-2.5 py-1 rounded-pill small">
                    {patient.disease || 'General Care'}
                  </span>
                  <span className="badge bg-light text-secondary border small">
                    Blood Group: {medical_history.blood_group}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-3 text-muted small flex-wrap">
                  <span>Age: <strong className="text-dark">{patient.age} yrs</strong></span>
                  <span>•</span>
                  <span>Gender: <strong className="text-dark">{patient.gender}</strong></span>
                  <span>•</span>
                  <span className="d-flex align-items-center gap-1">
                    <Phone size={13} /> {patient.contact}
                  </span>
                  <span>•</span>
                  <span className="d-flex align-items-center gap-1">
                    <Mail size={13} /> {patient.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1.5 px-3 py-2"
                onClick={() => setShowRecordModal(true)}
              >
                <PlusCircle size={16} />
                <span>Add Encounter Note</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1.5 px-3 py-2"
                onClick={() => setShowRxModal(true)}
              >
                <Pill size={16} />
                <span>Write Prescription</span>
              </button>
            </div>
          </div>

          {/* Allergy Warning Strip */}
          <div
            className="mt-3 p-2.5 rounded-3 d-flex align-items-center gap-2"
            style={{
              backgroundColor: medical_history.allergies.includes('NKDA') ? '#f0fdf4' : '#fffbeb',
              border: medical_history.allergies.includes('NKDA')
                ? '1px solid #bbf7d0'
                : '1px solid #fde68a',
            }}
          >
            <AlertTriangle
              size={18}
              className={medical_history.allergies.includes('NKDA') ? 'text-success' : 'text-warning'}
            />
            <div className="small">
              <strong className={medical_history.allergies.includes('NKDA') ? 'text-success' : 'text-warning-emphasis'}>
                Allergy Alert:{' '}
              </strong>
              <span className="text-dark">{medical_history.allergies}</span>
            </div>
          </div>
        </div>

        {/* Chart Navigation Tabs */}
        <div className="px-4 border-top">
          <ul className="nav nav-tabs border-0">
            {[
              { key: 'overview', label: 'Demographics & Vitals', icon: HeartPulse },
              { key: 'history', label: 'Medical History', icon: FileText },
              { key: 'consultations', label: `Consultations (${consultations.length})`, icon: User },
              { key: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: Pill },
              { key: 'appointments', label: `Appointments (${appointments.length})`, icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <li key={tab.key} className="nav-item">
                  <button
                    type="button"
                    className={`nav-link border-0 py-3 px-3.5 d-flex align-items-center gap-2 fw-medium ${
                      isActive ? 'active text-primary fw-bold border-bottom border-primary border-2' : 'text-muted'
                    }`}
                    style={{ background: 'transparent', cursor: 'pointer' }}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Tab 1: Overview & Demographics */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 rounded-4 shadow-xs bg-white h-100">
              <div className="card-body p-4">
                <h6 className="fw-bold text-dark mb-3">Patient Identification & Contact</h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between px-0 py-2.5">
                    <span className="text-muted">Full Legal Name:</span>
                    <strong className="text-dark">{patient.name}</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2.5">
                    <span className="text-muted">Medical Record ID:</span>
                    <strong className="text-dark">HP-PAT-{patient.id.toString().padStart(4, '0')}</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2.5">
                    <span className="text-muted">Email Address:</span>
                    <strong className="text-dark">{patient.email}</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2.5">
                    <span className="text-muted">Primary Phone:</span>
                    <strong className="text-dark">{patient.contact}</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2.5">
                    <span className="text-muted">Emergency Contact:</span>
                    <strong className="text-dark">{medical_history.emergency_contact}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card border-0 rounded-4 shadow-xs bg-white h-100">
              <div className="card-body p-4">
                <h6 className="fw-bold text-dark mb-3">Clinical Baseline & Vitals</h6>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light text-center border">
                      <div className="text-muted small">Blood Pressure</div>
                      <div className="h5 fw-bold text-dark mb-0">120/80 mmHg</div>
                      <small className="text-success">Normal Range</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light text-center border">
                      <div className="text-muted small">Heart Rate</div>
                      <div className="h5 fw-bold text-dark mb-0">74 bpm</div>
                      <small className="text-success">Resting Pulse</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light text-center border">
                      <div className="text-muted small">Oxygen Saturation (SpO2)</div>
                      <div className="h5 fw-bold text-dark mb-0">99%</div>
                      <small className="text-success">Optimal</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light text-center border">
                      <div className="text-muted small">BMI / Status</div>
                      <div className="h5 fw-bold text-dark mb-0">22.4 kg/m²</div>
                      <small className="text-success">Healthy Weight</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Medical History */}
      {activeTab === 'history' && (
        <div className="card border-0 rounded-4 shadow-xs bg-white">
          <div className="card-body p-4">
            <h6 className="fw-bold text-dark mb-3">Chronic Diagnoses & Medical Background</h6>
            <div className="p-3 rounded-3 bg-light border mb-4">
              <div className="fw-semibold text-dark small mb-1">Primary Chronic Condition</div>
              <p className="mb-0 text-muted small">
                {patient.disease} — Patient is actively managed under continuous outpatient monitoring.
              </p>
            </div>

            <h6 className="fw-bold text-dark mb-3">Historical Consultation Timeline</h6>
            {consultations.length === 0 ? (
              <div className="text-center p-4 text-muted small">No prior consultations recorded.</div>
            ) : (
              <div className="timeline">
                {consultations.map((rec) => (
                  <div key={rec.id} className="p-3 mb-3 rounded-3 border bg-light-subtle">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-dark small">{rec.diagnosis}</strong>
                      <span className="badge bg-light text-secondary border">{rec.consultation_date}</span>
                    </div>
                    <div className="text-muted small mb-1">
                      <strong>Symptoms:</strong> {rec.symptoms}
                    </div>
                    <div className="text-muted small">
                      <strong>Plan:</strong> {rec.treatment_plan || 'Symptomatic management'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Consultations / Encounter Notes */}
      {activeTab === 'consultations' && (
        <div className="card border-0 rounded-4 shadow-xs bg-white">
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h6 className="fw-bold text-dark mb-1">Clinical Consultations & SOAP Notes</h6>
                <p className="text-muted small mb-0">Chronological clinical encounter documentation</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1.5"
                onClick={() => setShowRecordModal(true)}
              >
                <PlusCircle size={15} />
                <span>Add Note</span>
              </button>
            </div>

            {consultations.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <FileText size={36} className="text-muted mx-auto mb-2" />
                <p className="fw-medium mb-1">No clinical notes recorded yet</p>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-3 mt-2"
                  onClick={() => setShowRecordModal(true)}
                >
                  Document First Consultation
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {consultations.map((rec) => (
                  <div key={rec.id} className="card border rounded-3 p-3.5 bg-light-subtle">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary text-white">Record #{rec.id}</span>
                        <h6 className="fw-bold text-dark mb-0">{rec.diagnosis}</h6>
                      </div>
                      <span className="small text-muted">{rec.consultation_date}</span>
                    </div>

                    <div className="row g-2 small mt-2">
                      <div className="col-12 col-md-6">
                        <strong className="text-secondary d-block">Symptoms / Chief Complaint:</strong>
                        <p className="text-dark mb-2">{rec.symptoms}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <strong className="text-secondary d-block">Objective Observations:</strong>
                        <p className="text-dark mb-2">{rec.observations || 'Unremarkable'}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <strong className="text-secondary d-block">Treatment Plan:</strong>
                        <p className="text-dark mb-2">{rec.treatment_plan || 'Observation'}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <strong className="text-secondary d-block">Physician Notes:</strong>
                        <p className="text-dark mb-2">{rec.clinical_notes || 'None noted'}</p>
                      </div>
                    </div>

                    {rec.follow_up_date && (
                      <div className="border-top pt-2 mt-2 d-flex align-items-center gap-2 small text-muted">
                        <Clock size={14} className="text-primary" />
                        <span>Recommended Follow-up: <strong>{rec.follow_up_date}</strong></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="card border-0 rounded-4 shadow-xs bg-white">
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h6 className="fw-bold text-dark mb-1">Medication Regimen & Prescriptions</h6>
                <p className="text-muted small mb-0">Pharmacological orders issued to this patient</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1.5"
                onClick={() => setShowRxModal(true)}
              >
                <PlusCircle size={15} />
                <span>Issue Prescription</span>
              </button>
            </div>

            {prescriptions.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <Pill size={36} className="text-muted mx-auto mb-2" />
                <p className="fw-medium mb-1">No active prescriptions</p>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-3 mt-2"
                  onClick={() => setShowRxModal(true)}
                >
                  Write First Prescription
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="text-secondary small">
                      <th>Medication & Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Route</th>
                      <th>Instructions</th>
                      <th>Date Issued</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((rx) => (
                      <tr key={rx.id}>
                        <td>
                          <div className="fw-bold text-dark">{rx.medication_name}</div>
                          <small className="text-muted">{rx.dosage}</small>
                        </td>
                        <td className="small text-dark">{rx.frequency}</td>
                        <td className="small text-dark">{rx.duration}</td>
                        <td className="small text-muted">{rx.route || 'Oral'}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Appointments */}
      {activeTab === 'appointments' && (
        <div className="card border-0 rounded-4 shadow-xs bg-white">
          <div className="card-body p-4">
            <h6 className="fw-bold text-dark mb-3">Appointment History & Upcoming Visits</h6>
            {appointments.length === 0 ? (
              <div className="text-center p-4 text-muted small">No appointment records for this patient.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="text-secondary small">
                      <th>Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id}>
                        <td className="fw-semibold text-dark small">{a.appointment_date}</td>
                        <td className="small text-muted">{a.appointment_time}</td>
                        <td className="small text-dark">{a.reason || 'General Checkup'}</td>
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              a.status === 'Completed'
                                ? 'bg-success-subtle text-success'
                                : a.status === 'Cancelled'
                                ? 'bg-danger-subtle text-danger'
                                : 'bg-primary-subtle text-primary'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Add Medical Record */}
      {showRecordModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom p-4">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Add Clinical Encounter Note</h5>
                  <small className="text-muted">Document patient consultation for {patient.name}</small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRecordModal(false)}
                />
              </div>
              <form onSubmit={handleAddRecord}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Symptoms / Chief Complaint *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Chest tightness, fatigue, palpitations"
                        value={recordForm.symptoms}
                        onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Diagnosis *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Stage 1 Essential Hypertension"
                        value={recordForm.diagnosis}
                        onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Objective Observations & Findings</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="e.g. BP 138/88 mmHg, regular rhythm, no peripheral edema"
                        value={recordForm.observations}
                        onChange={(e) => setRecordForm({ ...recordForm, observations: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Treatment Plan</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="e.g. Prescribe ACE-inhibitor, sodium-restricted diet, daily aerobic exercise"
                        value={recordForm.treatment_plan}
                        onChange={(e) => setRecordForm({ ...recordForm, treatment_plan: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-dark">Additional Clinical Notes</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Patient advised on medication adherence"
                        value={recordForm.clinical_notes}
                        onChange={(e) => setRecordForm({ ...recordForm, clinical_notes: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Recommended Follow-up</label>
                      <input
                        type="date"
                        className="form-control"
                        value={recordForm.follow_up_date}
                        onChange={(e) => setRecordForm({ ...recordForm, follow_up_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-3 px-3"
                    onClick={() => setShowRecordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-3 px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving Note...' : 'Save Encounter Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add Prescription */}
      {showRxModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom p-4">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Write Prescription</h5>
                  <small className="text-muted">Issue clinical prescription for {patient.name}</small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRxModal(false)}
                />
              </div>
              <form onSubmit={handleAddRx}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-dark">Medication Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Atorvastatin, Metformin, Amoxicillin"
                        value={rxForm.medication_name}
                        onChange={(e) => setRxForm({ ...rxForm, medication_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Dosage *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 20mg, 500mg, 10ml"
                        value={rxForm.dosage}
                        onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Frequency</label>
                      <select
                        className="form-select"
                        value={rxForm.frequency}
                        onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                      >
                        <option value="Once daily (QD)">Once daily (QD)</option>
                        <option value="Twice daily (BID)">Twice daily (BID)</option>
                        <option value="Three times daily (TID)">Three times daily (TID)</option>
                        <option value="Four times daily (QID)">Four times daily (QID)</option>
                        <option value="As needed (PRN)">As needed (PRN)</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Duration</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 7 days, 30 days, 3 months"
                        value={rxForm.duration}
                        onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Route</label>
                      <select
                        className="form-select"
                        value={rxForm.route}
                        onChange={(e) => setRxForm({ ...rxForm, route: e.target.value })}
                      >
                        <option value="Oral">Oral</option>
                        <option value="Sublingual">Sublingual</option>
                        <option value="Inhalation">Inhalation</option>
                        <option value="Topical">Topical</option>
                        <option value="Intravenous (IV)">Intravenous (IV)</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Special Patient Instructions</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Take immediately after evening meal with water."
                        value={rxForm.instructions}
                        onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-3 px-3"
                    onClick={() => setShowRxModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-3 px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Issuing...' : 'Authorize & Issue Rx'}
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
