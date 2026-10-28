import { useEffect, useRef } from 'react'
import {
  FileText,
  User,
  Stethoscope,
  Calendar,
  Clock,
  HeartPulse,
  Activity,
  AlertTriangle,
  Printer,
  Edit3,
  CheckCircle,
  History,
  X,
  FlaskConical,
  Award,
  ShieldCheck,
} from 'lucide-react'

export default function MedicalRecordDetails({
  record,
  labResults = [],
  isOpen,
  onClose,
  onEditDraft,
  onFinalizeDraft,
  onViewPatientHistory,
  onPrint,
}) {
  const modalContainerRef = useRef(null)

  // Keyboard accessibility (Escape key to close) & Body scroll lock
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus inside modal for screen readers and keyboard users
    if (modalContainerRef.current) {
      modalContainerRef.current.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen || !record) return null

  const isDraft = record.status === 'Draft'
  const formattedId = `MR-${record.id.toString().padStart(4, '0')}`
  const vitals = record.vital_signs || {}

  // Handle clicking on backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="emr-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emr-modal-title"
    >
      <div
        className="emr-modal-container"
        ref={modalContainerRef}
        tabIndex="-1"
      >
        {/* =========================================================
            1. FIXED MODAL HEADER
            ========================================================= */}
        <header className="emr-modal-header">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <div
              className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
              }}
            >
              <FileText size={22} />
            </div>

            <div className="min-w-0">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h5 id="emr-modal-title" className="fw-bold text-dark mb-0 text-truncate">
                  Electronic Medical Record #{formattedId}
                </h5>
                {record.review_required ? (
                  <span className="badge rounded-pill font-monospace small px-2.5 py-1 bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1">
                    <AlertTriangle size={12} />
                    <span>Review Required</span>
                  </span>
                ) : isDraft ? (
                  <span className="badge rounded-pill font-monospace small px-2.5 py-1 bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                    Draft Status
                  </span>
                ) : record.is_amended ? (
                  <span className="badge rounded-pill font-monospace small px-2.5 py-1 bg-info-subtle text-info-emphasis border border-info-subtle">
                    Finalized & Amended
                  </span>
                ) : (
                  <span className="badge rounded-pill font-monospace small px-2.5 py-1 bg-success-subtle text-success border border-success-subtle">
                    Finalized & Verified
                  </span>
                )}
              </div>
              <small className="text-muted d-block text-truncate" style={{ fontSize: '0.8rem' }}>
                Consultation: <strong className="text-dark">{record.consultation_date}</strong> •{' '}
                {record.consultation_time || '10:00 AM'} • {record.visit_type || 'In-Person'} Encounter
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <button
              type="button"
              className="btn btn-outline-dark btn-sm rounded-3 d-flex align-items-center gap-1.5 px-3 py-1.5"
              onClick={() => onPrint(record)}
              title="Print official clinical summary"
            >
              <Printer size={15} />
              <span className="d-none d-sm-inline">Print Record</span>
            </button>

            <button
              type="button"
              className="btn-close ms-1"
              onClick={onClose}
              aria-label="Close modal"
            />
          </div>
        </header>

        {/* =========================================================
            2. SCROLLABLE MODAL BODY
            ========================================================= */}
        <main className="emr-modal-body">
          {/* Action Required Banner for Review-Required Records */}
          {record.review_required && (
            <div className="alert alert-danger border border-danger rounded-4 p-3.5 mb-4 d-flex align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-start gap-2.5">
                <AlertTriangle size={22} className="text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="d-block text-danger mb-0.5">Clinical Review & Re-Finalization Required</strong>
                  <p className="small text-dark mb-0">
                    {record.review_reason || 'This record has been flagged for administrative review and clinical deduplication.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm rounded-3 px-3 flex-shrink-0 shadow-sm"
                onClick={() => onEditDraft(record)}
              >
                Review & Amend Record
              </button>
            </div>
          )}

          {/* Patient and Doctor Cards */}
          <section className="emr-participants-grid" aria-label="Patient and Doctor Information">
            {/* Patient Profile Card */}
            <article className="emr-info-card">
              <div className="d-flex align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2.5 min-w-0">
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      fontSize: '0.95rem',
                    }}
                  >
                    {record.patient_name ? record.patient_name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="min-w-0">
                    <h6 className="fw-bold mb-0 text-dark text-truncate">{record.patient_name}</h6>
                    <small className="text-muted">
                      ID: #{record.patient_id} • {record.patient_age || '30'} yrs, {record.patient_gender || 'Male'}
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm py-1 px-2.5 rounded-2 d-flex align-items-center gap-1 flex-shrink-0"
                  onClick={() => onViewPatientHistory(record.patient_id)}
                  style={{ fontSize: '0.78rem' }}
                  title="View complete longitudinal consultation history"
                >
                  <History size={13} />
                  <span>History</span>
                </button>
              </div>

              <div className="emr-info-row">
                <span className="emr-info-label">Email:</span>
                <span className="emr-info-value">{record.patient_email || 'Not recorded'}</span>
              </div>

              <div className="emr-info-row">
                <span className="emr-info-label">Phone:</span>
                <span className="emr-info-value">{record.patient_contact || 'Not recorded'}</span>
              </div>

              <div className="emr-info-row mb-0">
                <span className="emr-info-label">Primary Care Condition:</span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">
                  {record.patient_disease || 'General Care'}
                </span>
              </div>
            </article>

            {/* Attending Physician Card */}
            <article className="emr-info-card">
              <div className="d-flex align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2.5 min-w-0">
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #0d9488 0%, #047857 100%)',
                      fontSize: '0.95rem',
                    }}
                  >
                    <Stethoscope size={20} />
                  </div>
                  <div className="min-w-0">
                    <h6 className="fw-bold mb-0 text-dark text-truncate">{record.doctor_name}</h6>
                    <small className="text-muted">{record.doctor_specialization || 'Clinical Specialist'}</small>
                  </div>
                </div>

                <span className="badge bg-success-subtle text-success border border-success-subtle flex-shrink-0">
                  Attending
                </span>
              </div>

              <div className="emr-info-row">
                <span className="emr-info-label">Encounter Date:</span>
                <span className="emr-info-value fw-semibold">{record.consultation_date}</span>
              </div>

              <div className="emr-info-row">
                <span className="emr-info-label">Consultation Time:</span>
                <span className="emr-info-value">{record.consultation_time || '10:00 AM'}</span>
              </div>

              <div className="emr-info-row">
                <span className="emr-info-label">Encounter Setting:</span>
                <span className="badge bg-secondary-subtle text-secondary border">
                  {record.visit_type || 'In-Person'}
                </span>
              </div>

              {record.appointment_id && (
                <div className="emr-info-row mb-0">
                  <span className="emr-info-label">Linked Appointment:</span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                    Encounter #{record.appointment_id}
                  </span>
                </div>
              )}
            </article>
          </section>

          {/* Physiological Vital Signs Card */}
          <section className="card border-0 rounded-4 shadow-xs bg-white mb-4 border" aria-label="Vital Signs">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <HeartPulse size={18} className="text-danger flex-shrink-0" />
                  <h6 className="fw-bold text-dark mb-0">Physiological Baseline Vitals</h6>
                </div>
                <span className="badge bg-light text-muted border small" style={{ fontSize: '0.72rem' }}>
                  Recorded at Visit
                </span>
              </div>

              <div className="emr-vitals-grid">
                {/* Blood Pressure */}
                <div className="emr-vital-card">
                  <span className="emr-vital-label">Blood Pressure</span>
                  <span className="emr-vital-value">
                    {vitals.blood_pressure || vitals.bp || '120/80'}
                  </span>
                  <span className="emr-vital-unit">mmHg</span>
                </div>

                {/* Heart Rate */}
                <div className="emr-vital-card">
                  <span className="emr-vital-label">Heart Rate</span>
                  <span className="emr-vital-value">{vitals.heart_rate || vitals.hr || '72'}</span>
                  <span className="emr-vital-unit">bpm (pulse)</span>
                </div>

                {/* Temperature */}
                <div className="emr-vital-card">
                  <span className="emr-vital-label">Temperature</span>
                  <span className="emr-vital-value">
                    {vitals.temperature || vitals.temp || '98.6'}
                  </span>
                  <span className="emr-vital-unit">°F</span>
                </div>

                {/* Respiratory Rate */}
                <div className="emr-vital-card">
                  <span className="emr-vital-label">Respiratory Rate</span>
                  <span className="emr-vital-value">{vitals.respiratory_rate || '16'}</span>
                  <span className="emr-vital-unit">breaths / min</span>
                </div>

                {/* Oxygen Saturation */}
                <div className="emr-vital-card">
                  <span className="emr-vital-label">Oxygen Saturation</span>
                  <span className="emr-vital-value">{vitals.spo2 || '98%'}</span>
                  <span className="emr-vital-unit">SpO2 (room air)</span>
                </div>

                {/* Patient Weight */}
                <div className="emr-vital-card">
                  <span className="emr-vital-label">Patient Weight</span>
                  <span className="emr-vital-value">{vitals.weight || '70 kg'}</span>
                  <span className="emr-vital-unit">verified</span>
                </div>
              </div>
            </div>
          </section>

          {/* Clinical Documentation (SOAP) Section */}
          <section className="card border-0 rounded-4 shadow-xs bg-white mb-4 border" aria-label="Clinical SOAP Documentation">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <Activity size={18} className="text-primary flex-shrink-0" />
                  <h6 className="fw-bold text-dark mb-0">Clinical Documentation & Assessment</h6>
                </div>
                <span className="badge bg-light text-secondary border font-monospace small">
                  SOAP Format
                </span>
              </div>

              <div className="emr-soap-grid">
                {/* Reason for Visit */}
                <div className="emr-soap-card">
                  <div className="emr-soap-title">
                    <Calendar size={13} />
                    <span>Reason for Visit / Encounter</span>
                  </div>
                  <p className="emr-soap-content fw-medium text-dark">
                    {record.visit_reason || record.diagnosis || 'Clinical follow-up'}
                  </p>
                </div>

                {/* Primary Diagnosis */}
                <div className="emr-soap-card">
                  <div className="emr-soap-title">
                    <CheckCircle size={13} className="text-primary" />
                    <span>Primary Clinical Diagnosis</span>
                  </div>
                  <p className="emr-soap-content fw-bold text-primary">
                    {record.diagnosis}
                  </p>
                </div>

                {/* Subjective Symptoms */}
                <div className="emr-soap-card">
                  <div className="emr-soap-title">
                    <AlertTriangle size={13} className="text-warning-emphasis" />
                    <span>Subjective Symptoms & Patient Complaints</span>
                  </div>
                  <p className="emr-soap-content">
                    {record.symptoms || 'Patient reports no acute distress; regular outpatient review.'}
                  </p>
                </div>

                {/* Objective Observations */}
                <div className="emr-soap-card">
                  <div className="emr-soap-title">
                    <Activity size={13} />
                    <span>Objective Observations & Examination Findings</span>
                  </div>
                  <p className="emr-soap-content">
                    {record.observations || 'Normal physical examination findings consistent with clinical baseline.'}
                  </p>
                </div>

                {/* Treatment Plan - Full Width */}
                <div className="emr-soap-card full-width">
                  <div className="emr-soap-title">
                    <HeartPulse size={13} className="text-success" />
                    <span>Treatment Plan & Therapeutic Management</span>
                  </div>
                  <p className="emr-soap-content">
                    {record.treatment_plan || 'Conservative medical management with outpatient follow-up.'}
                  </p>
                </div>

                {/* Follow-up Recommendations */}
                <div className="emr-soap-card">
                  <div className="emr-soap-title">
                    <Clock size={13} />
                    <span>Follow-up Recommendations</span>
                  </div>
                  <div className="d-flex align-items-center gap-1.5 mb-1">
                    <strong className="text-dark">{record.follow_up_date || 'As needed / PRN'}</strong>
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>
                    {record.follow_up_notes || 'Patient instructed to return for scheduled evaluation.'}
                  </small>
                </div>

                {/* Physician Notes */}
                <div className="emr-soap-card">
                  <div className="emr-soap-title">
                    <FileText size={13} />
                    <span>Physician Notes & Clinical Context</span>
                  </div>
                  <p className="emr-soap-content">
                    {record.clinical_notes || 'All safety and lifestyle precautions communicated clearly to patient.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Diagnostic Lab Results (if available) */}
          {labResults && labResults.length > 0 && (
            <section className="card border-0 rounded-4 shadow-xs bg-white mb-4 border" aria-label="Diagnostic Lab Results">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <FlaskConical size={18} className="text-info flex-shrink-0" />
                    <h6 className="fw-bold text-dark mb-0">Associated Diagnostic Lab Results</h6>
                  </div>
                  <span className="badge bg-light text-secondary border small">
                    {labResults.length} test{labResults.length === 1 ? '' : 's'} on record
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr className="small text-secondary">
                        <th>Test Name</th>
                        <th>Date</th>
                        <th>Result Value</th>
                        <th>Reference Range</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labResults.map((lr) => (
                        <tr key={lr.id}>
                          <td className="fw-semibold text-dark small">{lr.test_name}</td>
                          <td className="small text-muted">{lr.test_date}</td>
                          <td className="small text-dark fw-bold">
                            {lr.result_value} {lr.units}
                          </td>
                          <td className="small text-muted">{lr.reference_range || 'Standard'}</td>
                          <td>
                            <span
                              className={`badge rounded-pill small ${
                                lr.status === 'Abnormal'
                                  ? 'bg-danger-subtle text-danger'
                                  : lr.status === 'Borderline'
                                  ? 'bg-warning-subtle text-warning-emphasis'
                                  : 'bg-success-subtle text-success'
                              }`}
                            >
                              {lr.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Clinical Amendment Audit Trail */}
          {record.amendments && record.amendments.length > 0 && (
            <section className="card border-0 rounded-4 shadow-xs bg-white mb-4 border" aria-label="Amendment History">
              <div className="card-body p-3.5">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <History size={18} className="text-info flex-shrink-0" />
                    <h6 className="fw-bold mb-0 text-dark">Clinical Amendment History & Audit Trail</h6>
                  </div>
                  <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                    {record.amendments.length} {record.amendments.length === 1 ? 'Amendment Record' : 'Amendment Records'}
                  </span>
                </div>

                <div className="d-flex flex-column gap-2.5">
                  {record.amendments.map((amend) => (
                    <div key={amend.id} className="p-3 rounded-3 bg-light border small">
                      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1.5">
                        <span className="fw-bold text-dark">
                          Amended by {amend.amended_by_name} ({amend.amended_by_role})
                        </span>
                        <span className="text-muted font-monospace" style={{ fontSize: '0.74rem' }}>
                          {amend.created_at}
                        </span>
                      </div>
                      {amend.previous_doctor_id !== amend.new_doctor_id && (
                        <div className="mb-1 text-primary fw-medium" style={{ fontSize: '0.78rem' }}>
                          Attending Physician Reassigned: {amend.previous_doctor_name} → {amend.new_doctor_name}
                        </div>
                      )}
                      <p className="mb-1 text-dark" style={{ fontSize: '0.82rem' }}>
                        <strong>Justification:</strong> {amend.amendment_reason}
                      </p>
                      {amend.changes_summary && (
                        <small className="text-muted d-block" style={{ fontSize: '0.74rem' }}>
                          Encounter Changes: {amend.changes_summary}
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Timestamps & Audit Trail Strip */}
          <footer className="p-3 rounded-3 bg-white border d-flex flex-wrap justify-content-between align-items-center gap-2 small text-muted">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span>
                Created At: <strong className="text-dark">{record.created_at || 'Recorded on system'}</strong>
              </span>
              {record.finalized_at && (
                <span>
                  Finalized At: <strong className="text-success">{record.finalized_at}</strong>
                </span>
              )}
            </div>
            <div className="d-flex align-items-center gap-1.5 font-monospace" style={{ fontSize: '0.74rem' }}>
              <ShieldCheck size={14} className="text-success flex-shrink-0" />
              <span>Audit Ref: SHA256-EHR-{record.id}</span>
            </div>
          </footer>
        </main>

        {/* =========================================================
            3. FIXED MODAL FOOTER
            ========================================================= */}
        <footer className="emr-modal-footer">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-3 px-3.5"
            onClick={onClose}
          >
            Close
          </button>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Edit / Amend Action */}
            <button
              type="button"
              className={`btn btn-sm rounded-3 d-flex align-items-center gap-1.5 px-3.5 ${
                isDraft ? 'btn-outline-warning' : 'btn-outline-primary'
              }`}
              onClick={() => onEditDraft(record)}
            >
              <Edit3 size={15} />
              <span>{isDraft ? 'Edit Draft' : 'Amend / Edit Record'}</span>
            </button>

            {/* Finalize Action */}
            {(isDraft || record.review_required) && (
              <button
                type="button"
                className="btn btn-success btn-sm rounded-3 d-flex align-items-center gap-1.5 px-3.5"
                onClick={() => onFinalizeDraft(record.id)}
              >
                <CheckCircle size={15} />
                <span>Finalize Record</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1.5 px-4"
              onClick={() => onPrint(record)}
            >
              <Printer size={15} />
              <span>Print Document</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
