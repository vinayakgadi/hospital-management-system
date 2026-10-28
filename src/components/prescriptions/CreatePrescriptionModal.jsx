import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  X,
  Pill,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  User,
  Stethoscope,
  FileText,
  Calendar,
  Eye,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'

export default function CreatePrescriptionModal({ onClose, onSuccess }) {
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patientRecords, setPatientRecords] = useState([])
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [isReviewStep, setIsReviewStep] = useState(false)

  // Form State
  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [medicalRecordId, setMedicalRecordId] = useState('')
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().slice(0, 10))

  const [medications, setMedications] = useState([
    {
      medication_name: '',
      dosage: '',
      route: 'Oral',
      frequency: 'Once daily (QD)',
      duration: '30 days',
      instructions: 'Take after meals with water.',
    },
  ])

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        setLoadingInitial(true)
        const [patientsRes, doctorsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/patients`),
          axios.get(`${API_BASE_URL}/api/doctors`),
        ])
        setPatients(patientsRes.data || [])
        const docs = doctorsRes.data || []
        setDoctors(docs)
        if (docs.length > 0) {
          setDoctorId(docs[0].id)
        }
      } catch (err) {
        console.error('Failed to load doctors/patients:', err)
        setError('Failed to load patient and doctor directories.')
      } finally {
        setLoadingInitial(false)
      }
    }
    fetchPrerequisites()
  }, [])

  // When patient selection changes, fetch their medical records and default to their assigned doctor
  useEffect(() => {
    if (!patientId) {
      setPatientRecords([])
      setMedicalRecordId('')
      return
    }

    const selectedPat = patients.find((p) => p.id === parseInt(patientId, 10))
    if (selectedPat?.doctor_id) {
      setDoctorId(selectedPat.doctor_id)
    }

    const fetchRecords = async () => {
      try {
        setLoadingRecords(true)
        const res = await axios.get(`${API_BASE_URL}/api/patients/${patientId}/medical-records`)
        setPatientRecords(res.data || [])
      } catch (err) {
        console.warn('Could not load patient medical records:', err)
        setPatientRecords([])
      } finally {
        setLoadingRecords(false)
      }
    }
    fetchRecords()
  }, [patientId, patients])

  const handleMedicationChange = (index, field, value) => {
    setMedications((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleAddMedication = () => {
    setMedications((prev) => [
      ...prev,
      {
        medication_name: '',
        dosage: '',
        route: 'Oral',
        frequency: 'Once daily (QD)',
        duration: '14 days',
        instructions: 'Take as directed.',
      },
    ])
  }

  const handleRemoveMedication = (index) => {
    if (medications.length <= 1) return
    setMedications((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    if (!patientId) {
      setError('Please select an existing patient.')
      return false
    }
    if (!doctorId) {
      setError('Please select an authorized prescribing doctor.')
      return false
    }
    for (let i = 0; i < medications.length; i++) {
      const med = medications[i]
      if (!med.medication_name.trim() || !med.dosage.trim()) {
        setError(`Medication entry #${i + 1} requires a medication name and dosage.`)
        return false
      }
    }
    setError(null)
    return true
  }

  const handleProceedToReview = (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsReviewStep(true)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        patient_id: parseInt(patientId, 10),
        doctor_id: parseInt(doctorId, 10),
        medical_record_id: medicalRecordId ? parseInt(medicalRecordId, 10) : null,
        prescription_date: prescriptionDate,
        medications,
      }

      await axios.post(`${API_BASE_URL}/api/prescriptions`, payload)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Failed to create prescription:', err)
      setError(err.response?.data?.error || 'Failed to issue prescription order.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedPatientObj = patients.find((p) => p.id === parseInt(patientId, 10))
  const selectedDoctorObj = doctors.find((d) => d.id === parseInt(doctorId, 10))

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div
            className="modal-header text-white px-4 py-3 d-flex align-items-center justify-content-between"
            style={{ backgroundColor: '#0f172a' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="p-2 rounded-3 text-white d-flex align-items-center justify-content-center"
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' }}
              >
                <Pill size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white fs-6">
                  {isReviewStep ? 'Review Prescription Order' : 'Issue New Prescription'}
                </h5>
                <span className="text-white-50" style={{ fontSize: '0.75rem' }}>
                  Electronic Medication Order Formulation
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
              disabled={submitting}
            />
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 fs-7" role="alert">
                <AlertCircle size={16} className="flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            {loadingInitial ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary spinner-border-sm mb-2" role="status" />
                <p className="text-muted small mb-0">Loading patient and doctor registries...</p>
              </div>
            ) : isReviewStep ? (
              /* Review Summary Step */
              <div className="d-flex flex-column gap-3">
                <div className="alert alert-info border-info-subtle py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                  <Eye size={16} />
                  <span>
                    Please review this clinical prescription before final submission to ensure dosage safety and accuracy.
                  </span>
                </div>

                {/* Patient & Doctor Card */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 border rounded-3 bg-light">
                      <span className="text-muted small d-block">Patient</span>
                      <strong className="text-dark fs-6">{selectedPatientObj?.name}</strong>
                      <div className="text-muted small">
                        #{selectedPatientObj?.id} • {selectedPatientObj?.gender} • {selectedPatientObj?.age} yrs
                      </div>
                      {selectedPatientObj?.disease && (
                        <div className="text-muted small">Condition: {selectedPatientObj.disease}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 border rounded-3 bg-light">
                      <span className="text-muted small d-block">Authorized Prescribing Clinician</span>
                      <strong className="text-dark fs-6">{selectedDoctorObj?.name}</strong>
                      <div className="text-muted small">{selectedDoctorObj?.specialization || 'Clinical Care'}</div>
                      <div className="text-muted small">Order Date: {prescriptionDate}</div>
                    </div>
                  </div>
                </div>

                {/* Medications to be created */}
                <div className="border rounded-3 p-3 bg-white">
                  <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                    <Pill size={16} className="text-primary" />
                    <span>Medications ({medications.length})</span>
                  </h6>

                  <div className="d-flex flex-column gap-2">
                    {medications.map((m, idx) => (
                      <div key={idx} className="p-3 border rounded-2 bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-primary">
                            {idx + 1}. {m.medication_name}
                          </strong>
                          <span className="badge bg-white text-dark border">{m.dosage}</span>
                        </div>
                        <div className="text-muted small mb-1">
                          Route: <strong>{m.route}</strong> • Frequency: <strong>{m.frequency}</strong> • Duration: <strong>{m.duration}</strong>
                        </div>
                        {m.instructions && (
                          <div className="text-dark small bg-white p-2 rounded border">
                            <em>Instructions:</em> {m.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Input Form Step */
              <form onSubmit={handleProceedToReview}>
                {/* Row 1: Patient and Doctor Selection */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Select Patient <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (ID: #{p.id}) - {p.gender}, {p.age} yrs
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Prescribing Doctor <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialization})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Optional Medical Record Link & Date */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Link Medical Record / Consultation (Optional)
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={medicalRecordId}
                      onChange={(e) => setMedicalRecordId(e.target.value)}
                      disabled={!patientId || loadingRecords}
                    >
                      <option value="">-- No Direct Record Linked --</option>
                      {patientRecords.map((mr) => (
                        <option key={mr.id} value={mr.id}>
                          EMR #{mr.id} ({mr.consultation_date}) - {mr.diagnosis}
                        </option>
                      ))}
                    </select>
                    {loadingRecords && <small className="text-muted">Loading consultations...</small>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Prescription Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={prescriptionDate}
                      onChange={(e) => setPrescriptionDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Medications List */}
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label small fw-bold text-dark mb-0 d-flex align-items-center gap-1">
                      <Pill size={16} className="text-primary" />
                      <span>Medication Entries</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm py-1 px-2 d-flex align-items-center gap-1"
                      onClick={handleAddMedication}
                    >
                      <Plus size={14} />
                      <span>Add Another Medication</span>
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {medications.map((med, index) => (
                      <div key={index} className="p-3 border rounded-3 bg-light position-relative">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                            Item #{index + 1}
                          </span>
                          {medications.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm p-1 py-0"
                              onClick={() => handleRemoveMedication(index)}
                              title="Remove medication"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-md-7">
                            <label className="form-label small mb-1 text-muted">
                              Medication Name <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm bg-white"
                              placeholder="e.g. Lisinopril, Metformin"
                              value={med.medication_name}
                              onChange={(e) => handleMedicationChange(index, 'medication_name', e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-md-5">
                            <label className="form-label small mb-1 text-muted">
                              Dosage <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm bg-white"
                              placeholder="e.g. 10 mg, 500 mg, 1 tablet"
                              value={med.dosage}
                              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <label className="form-label small mb-1 text-muted">Route</label>
                            <select
                              className="form-select form-select-sm bg-white"
                              value={med.route}
                              onChange={(e) => handleMedicationChange(index, 'route', e.target.value)}
                            >
                              <option value="Oral">Oral</option>
                              <option value="Intravenous (IV)">Intravenous (IV)</option>
                              <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                              <option value="Sublingual">Sublingual</option>
                              <option value="Inhalation">Inhalation</option>
                              <option value="Topical">Topical</option>
                              <option value="Ophthalmic">Ophthalmic</option>
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small mb-1 text-muted">Frequency</label>
                            <select
                              className="form-select form-select-sm bg-white"
                              value={med.frequency}
                              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            >
                              <option value="Once daily (QD)">Once daily (QD)</option>
                              <option value="Twice daily (BID)">Twice daily (BID)</option>
                              <option value="Three times daily (TID)">Three times daily (TID)</option>
                              <option value="Four times daily (QID)">Four times daily (QID)</option>
                              <option value="Every 8 hours">Every 8 hours</option>
                              <option value="Every 12 hours">Every 12 hours</option>
                              <option value="At bedtime (QHS)">At bedtime (QHS)</option>
                              <option value="As needed (PRN)">As needed (PRN)</option>
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small mb-1 text-muted">Duration</label>
                            <select
                              className="form-select form-select-sm bg-white"
                              value={med.duration}
                              onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                            >
                              <option value="5 days">5 days</option>
                              <option value="7 days">7 days</option>
                              <option value="10 days">10 days</option>
                              <option value="14 days">14 days</option>
                              <option value="30 days">30 days</option>
                              <option value="60 days">60 days</option>
                              <option value="90 days">90 days</option>
                              <option value="Ongoing / Chronic">Ongoing / Chronic</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="form-label small mb-1 text-muted">Instructions / Sig</label>
                          <input
                            type="text"
                            className="form-control form-control-sm bg-white"
                            placeholder="e.g. Take with food. Do not skip doses."
                            value={med.instructions}
                            onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-none">
                  <button type="submit" id="create-rx-hidden-submit" />
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light px-4 py-2 d-flex justify-content-between">
            {isReviewStep ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsReviewStep(false)}
                  disabled={submitting}
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm px-4 d-flex align-items-center gap-1"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Saving Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Confirm & Issue Prescription</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-4"
                  onClick={() => {
                    document.getElementById('create-rx-hidden-submit')?.click()
                  }}
                  disabled={loadingInitial || submitting}
                >
                  Review Order &rarr;
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
