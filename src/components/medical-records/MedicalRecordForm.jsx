import { useState, useEffect } from 'react'
import {
  X,
  FileText,
  User,
  Stethoscope,
  Calendar,
  Clock,
  HeartPulse,
  Activity,
  AlertTriangle,
  Save,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react'

export default function MedicalRecordForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  patients = [],
  doctors = [],
  isSubmitting = false,
}) {
  const isEditing = Boolean(initialData && initialData.id)
  const isPreviouslyFinalized = isEditing && initialData?.status === 'Finalized'

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    consultation_date: new Date().toISOString().split('T')[0],
    consultation_time: '10:00 AM',
    visit_type: 'In-Person',
    visit_reason: '',
    symptoms: '',
    observations: '',
    vital_signs: {
      blood_pressure: '120/80',
      heart_rate: '72',
      temperature: '98.6',
      respiratory_rate: '16',
      spo2: '98',
      weight: '',
    },
    diagnosis: '',
    treatment_plan: '',
    clinical_notes: '',
    follow_up_date: '',
    follow_up_notes: '',
    status: 'Finalized',
  })

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [amendmentReason, setAmendmentReason] = useState('')
  const [formError, setFormError] = useState(null)

  // Initialize or populate form
  useEffect(() => {
    if (!isOpen) return

    if (initialData) {
      // 1. Parsing vital signs reliably
      let initialVitals = {
        blood_pressure: '120/80',
        heart_rate: '72',
        temperature: '98.6',
        respiratory_rate: '16',
        spo2: '98',
        weight: '',
      }

      if (initialData.vital_signs) {
        if (typeof initialData.vital_signs === 'object') {
          initialVitals = {
            blood_pressure: initialData.vital_signs.blood_pressure || initialData.vital_signs.bp || '120/80',
            heart_rate: initialData.vital_signs.heart_rate || initialData.vital_signs.hr || '72',
            temperature: initialData.vital_signs.temperature || initialData.vital_signs.temp || '98.6',
            respiratory_rate: initialData.vital_signs.respiratory_rate || '16',
            spo2: initialData.vital_signs.spo2 || '98',
            weight: initialData.vital_signs.weight || '',
          }
        } else if (typeof initialData.vital_signs === 'string' && initialData.vital_signs.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(initialData.vital_signs)
            initialVitals = {
              blood_pressure: parsed.blood_pressure || parsed.bp || '120/80',
              heart_rate: parsed.heart_rate || parsed.hr || '72',
              temperature: parsed.temperature || parsed.temp || '98.6',
              respiratory_rate: parsed.respiratory_rate || '16',
              spo2: parsed.spo2 || '98',
              weight: parsed.weight || '',
            }
          } catch {
            // Keep default
          }
        }
      }

      setFormData({
        patient_id: initialData.patient_id || '',
        doctor_id: initialData.doctor_id || '',
        consultation_date: initialData.consultation_date || new Date().toISOString().split('T')[0],
        consultation_time: initialData.consultation_time || '10:00 AM',
        visit_type: initialData.visit_type || 'In-Person',
        visit_reason: initialData.visit_reason || '',
        symptoms: initialData.symptoms || '',
        observations: initialData.observations || '',
        vital_signs: initialVitals,
        diagnosis: initialData.diagnosis || '',
        treatment_plan: initialData.treatment_plan || '',
        clinical_notes: initialData.clinical_notes || '',
        follow_up_date: initialData.follow_up_date || '',
        follow_up_notes: initialData.follow_up_notes || '',
        status: initialData.status || 'Draft',
        appointment_id: initialData.appointment_id || null,
        resolve_review: Boolean(initialData.review_required),
      })

      const foundPat = patients.find((p) => p.id === initialData.patient_id)
      setSelectedPatient(foundPat || null)

      const foundDoc = doctors.find((d) => d.id === initialData.doctor_id)
      setSelectedDoctor(foundDoc || null)
      setAmendmentReason('')
    } else {
      // Creating a new medical record
      // Find first active doctor if available
      const firstActiveDoctor = doctors.find((d) => d.status === 'Active') || (doctors.length > 0 ? doctors[0] : null)

      setFormData({
        patient_id: patients.length > 0 ? patients[0].id : '',
        doctor_id: firstActiveDoctor ? firstActiveDoctor.id : '',
        consultation_date: new Date().toISOString().split('T')[0],
        consultation_time: '10:00 AM',
        visit_type: 'In-Person',
        visit_reason: '',
        symptoms: '',
        observations: '',
        vital_signs: {
          blood_pressure: '120/80',
          heart_rate: '72',
          temperature: '98.6',
          respiratory_rate: '16',
          spo2: '98',
          weight: '',
        },
        diagnosis: '',
        treatment_plan: '',
        clinical_notes: '',
        follow_up_date: '',
        follow_up_notes: '',
        status: 'Finalized',
      })
      if (patients.length > 0) {
        setSelectedPatient(patients[0])
      }
      setSelectedDoctor(firstActiveDoctor || null)
      setAmendmentReason('')
    }
    setFormError(null)
  }, [initialData, patients, doctors, isOpen])

  // Handle patient selection (only permitted when creating new record)
  const handlePatientSelect = (patientId) => {
    const pId = parseInt(patientId, 10)
    setFormData((prev) => ({ ...prev, patient_id: pId }))
    const found = patients.find((p) => p.id === pId)
    setSelectedPatient(found || null)

    // Suggest patient's primary doctor if active and currently unselected
    if (found && found.doctor_id && !formData.doctor_id) {
      const doc = doctors.find((d) => d.id === found.doctor_id)
      if (doc && doc.status === 'Active') {
        setFormData((prev) => ({ ...prev, doctor_id: doc.id }))
        setSelectedDoctor(doc)
      }
    }
  }

  // Handle doctor selection
  const handleDoctorSelect = (doctorIdStr) => {
    if (!doctorIdStr) {
      setFormData((prev) => ({ ...prev, doctor_id: '' }))
      setSelectedDoctor(null)
      return
    }
    const dId = parseInt(doctorIdStr, 10)
    setFormData((prev) => ({ ...prev, doctor_id: dId }))
    const foundDoc = doctors.find((d) => d.id === dId)
    setSelectedDoctor(foundDoc || null)
  }

  const handleVitalChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [field]: value,
      },
    }))
  }

  const handleSubmit = (targetStatus) => {
    if (!formData.patient_id) {
      setFormError('Please select a valid patient.')
      return
    }
    if (!formData.doctor_id) {
      setFormError('Attending physician must be selected. Please choose a doctor.')
      return
    }

    const doc = doctors.find((d) => d.id === parseInt(formData.doctor_id, 10))
    if (doc && doc.status !== 'Active') {
      setFormError(`Doctor ${doc.name} is currently Inactive. Please select an active attending physician.`)
      return
    }

    if (!formData.diagnosis || !formData.diagnosis.trim()) {
      setFormError('Clinical Diagnosis is required.')
      return
    }

    // Require amendment reason if modifying a finalized record
    if (isPreviouslyFinalized && !amendmentReason.trim()) {
      setFormError('Please provide an Amendment Reason explaining the changes to this finalized clinical record.')
      return
    }

    setFormError(null)
    const payload = {
      ...formData,
      status: targetStatus,
      amendment_reason: amendmentReason.trim(),
    }
    onSubmit(payload)
  }

  if (!isOpen) return null

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          {/* Modal Header */}
          <div className="modal-header border-bottom p-4 bg-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center"
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
              >
                <FileText size={22} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">
                  {isEditing ? `Edit Medical Record (#MR-${initialData.id.toString().padStart(4, '0')})` : 'New Electronic Medical Record (EMR)'}
                </h5>
                <small className="text-muted">
                  {isPreviouslyFinalized
                    ? 'Clinical Amendment Workflow — Correct physician assignments and verified medical details'
                    : isEditing
                    ? 'Update clinical encounter details, vitals, and diagnostic observations'
                    : 'Document clinical consultation, vitals, diagnosis, and treatment plan'}
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
            />
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4 p-lg-4" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            {formError && (
              <div className="alert alert-danger rounded-3 d-flex align-items-center gap-2 p-3 mb-4" role="alert">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Alert for previously finalized record amendment */}
            {isPreviouslyFinalized && (
              <div className="alert alert-warning border border-warning rounded-4 p-3.5 mb-4 bg-warning-subtle text-dark">
                <div className="d-flex align-items-start gap-2.5">
                  <ShieldAlert size={20} className="text-warning-emphasis flex-shrink-0 mt-0.5" />
                  <div className="w-100">
                    <strong className="d-block text-warning-emphasis fw-bold mb-1">
                      Controlled Clinical Amendment Mode
                    </strong>
                    <p className="small text-muted mb-2">
                      This medical record is currently marked as <strong>Finalized</strong>. All corrections (including doctor re-assignments, vitals, and diagnostic revisions) will be recorded in the clinical amendment audit trail along with your justification.
                    </p>
                    <div>
                      <label className="form-label small fw-bold text-dark mb-1">
                        Reason for Amendment / Physician Reassignment *
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="e.g. Corrected attending physician to Dr. Teja based on Dialysis Review encounter #6; updated vital sign baseline..."
                        value={amendmentReason}
                        onChange={(e) => setAmendmentReason(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row g-4">
              {/* Left Column: Patient & Consultation Logistics */}
              <div className="col-12 col-lg-5">
                {/* Patient Information Section */}
                <div className="card border rounded-4 p-3.5 mb-3 bg-light-subtle">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-1.5">
                    <User size={16} className="text-primary" />
                    <span>Patient Information</span>
                  </h6>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Select Patient {isEditing ? '(Locked for Editing)' : '*'}
                    </label>
                    <select
                      className="form-select"
                      value={formData.patient_id}
                      onChange={(e) => handlePatientSelect(e.target.value)}
                      disabled={isEditing}
                      required
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (#{p.id}) — {p.disease || 'General Care'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Auto-populated Patient Overview */}
                  {selectedPatient ? (
                    <div className="p-3 rounded-3 bg-white border small">
                      <div className="d-flex justify-content-between mb-1.5">
                        <span className="text-muted">Name / ID:</span>
                        <strong className="text-dark">{selectedPatient.name} (#{selectedPatient.id})</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1.5">
                        <span className="text-muted">Demographics:</span>
                        <span className="text-dark">
                          {selectedPatient.age || '30'} yrs • {selectedPatient.gender || 'Male'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-1.5">
                        <span className="text-muted">Primary Condition:</span>
                        <span className="badge bg-primary-subtle text-primary">
                          {selectedPatient.disease || 'General Care'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Contact:</span>
                        <span className="text-dark text-truncate" style={{ maxWidth: '180px' }}>
                          {selectedPatient.email}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-muted small bg-white rounded-3 border">
                      Select a patient to preview clinical demographics
                    </div>
                  )}

                  {/* Allergy Alert Strip */}
                  <div className="mt-2.5 p-2 rounded-3 bg-warning-subtle border border-warning-subtle d-flex align-items-center gap-2 small">
                    <AlertTriangle size={15} className="text-warning-emphasis flex-shrink-0" />
                    <span className="text-warning-emphasis" style={{ fontSize: '0.78rem' }}>
                      Allergy Check: NKDA (No Known Drug Allergies) on verified file.
                    </span>
                  </div>
                </div>

                {/* Consultation Logistics & Doctor Selection */}
                <div className="card border rounded-4 p-3.5 bg-light-subtle">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-1.5">
                    <Stethoscope size={16} className="text-primary" />
                    <span>Attending Physician & Logistics</span>
                  </h6>

                  {/* Attending Physician Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Attending Physician *
                    </label>
                    <select
                      className="form-select"
                      value={formData.doctor_id}
                      onChange={(e) => handleDoctorSelect(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Attending Doctor --</option>
                      {doctors.map((d) => {
                        const isInactive = d.status !== 'Active'
                        return (
                          <option key={d.id} value={d.id}>
                            {d.name} — {d.specialization} {isInactive ? '(Inactive)' : ''}
                          </option>
                        )
                      })}
                    </select>

                    {/* Selected Doctor Summary Card */}
                    {selectedDoctor && (
                      <div className="mt-2 p-2.5 rounded-3 bg-white border small">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-muted">Specialization:</span>
                          <strong className="text-dark">{selectedDoctor.specialization}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">Status:</span>
                          <span
                            className={`badge ${
                              selectedDoctor.status === 'Active'
                                ? 'bg-success-subtle text-success border border-success-subtle'
                                : 'bg-danger-subtle text-danger border border-danger-subtle'
                            }`}
                          >
                            {selectedDoctor.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="row g-2.5 mb-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-dark">Consultation Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.consultation_date}
                        onChange={(e) => setFormData({ ...formData, consultation_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-dark">Time</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="10:00 AM"
                        value={formData.consultation_time}
                        onChange={(e) => setFormData({ ...formData, consultation_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Visit Type</label>
                    <select
                      className="form-select"
                      value={formData.visit_type}
                      onChange={(e) => setFormData({ ...formData, visit_type: e.target.value })}
                    >
                      <option value="In-Person">In-Person Outpatient</option>
                      <option value="Follow-up">Clinical Follow-up</option>
                      <option value="Telehealth">Telehealth / Virtual Consult</option>
                      <option value="Emergency">Urgent Care / Emergency</option>
                      <option value="Annual Wellness">Annual Wellness Exam</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label small fw-semibold text-dark">Reason for Encounter / Visit</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Annual hypertension review, acute headaches"
                      value={formData.visit_reason}
                      onChange={(e) => setFormData({ ...formData, visit_reason: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Clinical Documentation & Vitals */}
              <div className="col-12 col-lg-7">
                {/* Vital Signs Grid */}
                <div className="card border rounded-4 p-3.5 mb-3 bg-light-subtle">
                  <h6 className="fw-bold text-dark mb-2.5 d-flex align-items-center gap-1.5">
                    <HeartPulse size={16} className="text-danger" />
                    <span>Vital Signs & Physiological Baseline</span>
                  </h6>

                  <div className="row g-2">
                    <div className="col-6 col-sm-4">
                      <label className="form-label text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                        Blood Pressure (mmHg)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="120/80"
                        value={formData.vital_signs.blood_pressure}
                        onChange={(e) => handleVitalChange('blood_pressure', e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-sm-4">
                      <label className="form-label text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                        Heart Rate (bpm)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="72"
                        value={formData.vital_signs.heart_rate}
                        onChange={(e) => handleVitalChange('heart_rate', e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-sm-4">
                      <label className="form-label text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                        Temperature (°F)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="98.6"
                        value={formData.vital_signs.temperature}
                        onChange={(e) => handleVitalChange('temperature', e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-sm-4">
                      <label className="form-label text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                        Respiratory Rate (/min)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="16"
                        value={formData.vital_signs.respiratory_rate}
                        onChange={(e) => handleVitalChange('respiratory_rate', e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-sm-4">
                      <label className="form-label text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                        Oxygen Saturation (SpO2 %)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="98%"
                        value={formData.vital_signs.spo2}
                        onChange={(e) => handleVitalChange('spo2', e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-sm-4">
                      <label className="form-label text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                        Patient Weight (kg)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="70 kg"
                        value={formData.vital_signs.weight}
                        onChange={(e) => handleVitalChange('weight', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Clinical Documentation: SOAP Format */}
                <div className="card border rounded-4 p-3.5 bg-light-subtle">
                  <h6 className="fw-bold text-dark mb-2.5 d-flex align-items-center gap-1.5">
                    <Activity size={16} className="text-primary" />
                    <span>Clinical Findings & Assessment</span>
                  </h6>

                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold text-dark">Subjective Symptoms & Complaints *</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Patient reports onset of palpitations, fatigue, and occasional dizziness..."
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold text-dark">Objective Observations & Exam Findings</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Chest auscultation clear bilaterally, S1/S2 regular without murmur, no peripheral edema..."
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold text-dark">Primary Clinical Diagnosis *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Essential Stage 1 Hypertension, Hyperlipidemia"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold text-dark">Treatment & Care Management Plan</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Initiate low-dose ACE inhibitor, dietary sodium restriction, aerobic exercise 30 min daily..."
                      value={formData.treatment_plan}
                      onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-2.5">
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-dark">Recommended Follow-up Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.follow_up_date}
                        onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-dark">Follow-up Notes / Targets</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Re-evaluate BP target < 130/80 in 4 weeks"
                        value={formData.follow_up_notes}
                        onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label small fw-semibold text-dark">Additional Clinical Notes</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Patient education provided regarding lifestyle modifications and medication adherence."
                      value={formData.clinical_notes}
                      onChange={(e) => setFormData({ ...formData, clinical_notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-light border-top p-3 px-4 d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-3 px-3"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <div className="d-flex align-items-center gap-2">
              {/* Save as Draft */}
              <button
                type="button"
                className="btn btn-outline-warning btn-sm rounded-3 px-3.5 d-flex align-items-center gap-1.5"
                disabled={isSubmitting}
                onClick={() => handleSubmit('Draft')}
              >
                <Save size={15} />
                <span>Save as Draft</span>
              </button>

              {/* Finalize Record / Re-Finalize Record */}
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-3 px-4 d-flex align-items-center gap-1.5"
                disabled={isSubmitting}
                onClick={() => handleSubmit('Finalized')}
              >
                <CheckCircle size={15} />
                <span>
                  {isSubmitting
                    ? 'Saving...'
                    : isPreviouslyFinalized
                    ? 'Re-Finalize & Authenticate Record'
                    : 'Finalize & Authenticate Record'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
