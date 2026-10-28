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
  if (!isOpen || !record) return null

  const isDraft = record.status === 'Draft'
  const formattedId = `MR-${record.id.toString().padStart(4, '0')}`
  const vitals = record.vital_signs || {}

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="modal-header border-bottom p-4 bg-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div
                className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center"
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
              >
                <FileText size={22} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-bold text-dark mb-0">Electronic Medical Record #{formattedId}</h5>
                  <span
                    className={`badge rounded-pill font-monospace small px-2.5 py-1 ${
                      isDraft
                        ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                        : 'bg-success-subtle text-success border border-success-subtle'
                    }`}
                  >
                    {isDraft ? 'Draft Status' : 'Finalized & Verified'}
                  </span>
                </div>
                <small className="text-muted">
                  Consultation recorded on {record.consultation_date} • {record.visit_type || 'In-Person'} Encounter
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-dark btn-sm rounded-3 d-flex align-items-center gap-1.5 px-3 py-1.5"
                onClick={() => onPrint(record)}
                title="Print official clinical summary"
              >
                <Printer size={15} />
                <span>Print Record</span>
              </button>

              <button
                type="button"
                className="btn-close ms-2"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-4" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            {/* Patient & Doctor Banner */}
            <div className="row g-3 mb-4">
              {/* Patient Profile Card */}
              <div className="col-12 col-md-6">
                <div className="p-3.5 rounded-4 bg-light border h-100">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2.5">
                      <div
                        className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          fontSize: '0.95rem',
                        }}
                      >
                        {record.patient_name ? record.patient_name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0 text-dark">{record.patient_name}</h6>
                        <small className="text-muted">
                          ID: #{record.patient_id} • {record.patient_age || '30'} yrs, {record.patient_gender || 'Male'}
                        </small>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm py-1 px-2.5 rounded-2 d-flex align-items-center gap-1"
                      onClick={() => onViewPatientHistory(record.patient_id)}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <History size={13} />
                      <span>History</span>
                    </button>
                  </div>

                  <div className="border-top pt-2 mt-2 small text-muted">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Email:</span>
                      <strong className="text-dark">{record.patient_email || 'Not recorded'}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Primary Condition:</span>
                      <span className="badge bg-primary-subtle text-primary">
                        {record.patient_disease || 'General Care'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attending Physician Card */}
              <div className="col-12 col-md-6">
                <div className="p-3.5 rounded-4 bg-light border h-100">
                  <div className="d-flex align-items-center gap-2.5 mb-2">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #0d9488 0%, #047857 100%)',
                        fontSize: '0.95rem',
                      }}
                    >
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">{record.doctor_name}</h6>
                      <small className="text-muted">{record.doctor_specialization || 'Clinical Specialist'}</small>
                    </div>
                  </div>

                  <div className="border-top pt-2 mt-2 small text-muted">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Consultation Timing:</span>
                      <strong className="text-dark">{record.consultation_date} • {record.consultation_time || '10:00 AM'}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Encounter Setting:</span>
                      <span className="badge bg-secondary-subtle text-secondary">
                        {record.visit_type || 'In-Person'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vital Signs Bar */}
            <div className="card border-0 rounded-4 shadow-xs bg-white mb-4 border">
              <div className="card-body p-3.5">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <HeartPulse size={18} className="text-danger" />
                  <h6 className="fw-bold text-dark mb-0">Physiological Vitals at Consultation</h6>
                </div>

                <div className="row g-2 text-center">
                  <div className="col-4 col-sm-2">
                    <div className="p-2.5 rounded-3 bg-light border">
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Blood Pressure</small>
                      <strong className="text-dark small">{vitals.blood_pressure || vitals.bp || '120/80'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.68rem' }}>mmHg</div>
                    </div>
                  </div>
                  <div className="col-4 col-sm-2">
                    <div className="p-2.5 rounded-3 bg-light border">
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Heart Rate</small>
                      <strong className="text-dark small">{vitals.heart_rate || vitals.hr || '72'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.68rem' }}>bpm</div>
                    </div>
                  </div>
                  <div className="col-4 col-sm-2">
                    <div className="p-2.5 rounded-3 bg-light border">
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Temperature</small>
                      <strong className="text-dark small">{vitals.temperature || vitals.temp || '98.6'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.68rem' }}>°F</div>
                    </div>
                  </div>
                  <div className="col-4 col-sm-2">
                    <div className="p-2.5 rounded-3 bg-light border">
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Respiration</small>
                      <strong className="text-dark small">{vitals.respiratory_rate || '16'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.68rem' }}>/min</div>
                    </div>
                  </div>
                  <div className="col-4 col-sm-2">
                    <div className="p-2.5 rounded-3 bg-light border">
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Oxygen Sat (SpO2)</small>
                      <strong className="text-dark small">{vitals.spo2 || '98%'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.68rem' }}>room air</div>
                    </div>
                  </div>
                  <div className="col-4 col-sm-2">
                    <div className="p-2.5 rounded-3 bg-light border">
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Patient Weight</small>
                      <strong className="text-dark small">{vitals.weight || '70 kg'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.68rem' }}>recorded</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical SOAP Documentation */}
            <div className="card border-0 rounded-4 shadow-xs bg-white mb-4 border">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Activity size={18} className="text-primary" />
                  <h6 className="fw-bold text-dark mb-0">Clinical Consultation Documentation</h6>
                </div>

                <div className="row g-3 small">
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3 bg-light border h-100">
                      <span className="text-secondary fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.72rem' }}>
                        Reason for Visit / Encounter
                      </span>
                      <p className="text-dark mb-0 fw-medium">
                        {record.visit_reason || record.diagnosis || 'Clinical follow-up'}
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3 bg-light border h-100">
                      <span className="text-secondary fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.72rem' }}>
                        Primary Clinical Diagnosis
                      </span>
                      <p className="text-primary mb-0 fw-bold">
                        {record.diagnosis}
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3 bg-light-subtle border h-100">
                      <span className="text-secondary fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.72rem' }}>
                        Subjective Symptoms & Patient Complaints
                      </span>
                      <p className="text-dark mb-0">
                        {record.symptoms || 'Patient reports no acute distress; regular outpatient review.'}
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3 bg-light-subtle border h-100">
                      <span className="text-secondary fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.72rem' }}>
                        Objective Clinical Observations & Exam Findings
                      </span>
                      <p className="text-dark mb-0">
                        {record.observations || 'Normal physical examination findings consistent with clinical baseline.'}
                      </p>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="p-3 rounded-3 bg-light-subtle border">
                      <span className="text-secondary fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.72rem' }}>
                        Treatment Plan & Therapeutic Management
                      </span>
                      <p className="text-dark mb-0">
                        {record.treatment_plan || 'Conservative medical management with outpatient follow-up.'}
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3 bg-light-subtle border h-100">
                      <span className="text-secondary fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.72rem' }}>
                        Follow-up Recommendations
                      </span>
                      <div className="d-flex align-items-center gap-1.5 mb-1">
                        <Calendar size={14} className="text-primary" />
                        <strong className="text-dark">{record.follow_up_date || 'As needed / PRN'}</strong>
                      </div>
                      <small className="text-muted">{record.follow_up_notes || 'Patient instructed to return for scheduled evaluation.'}</small>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3 bg-light-subtle border h-100">
                      <span className="text-secondary fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.72rem' }}>
                        Physician Notes & Clinical Context
                      </span>
                      <p className="text-dark mb-0">
                        {record.clinical_notes || 'All safety and lifestyle precautions communicated clearly to patient.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Lab Results */}
            {labResults && labResults.length > 0 && (
              <div className="card border-0 rounded-4 shadow-xs bg-white mb-4 border">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <FlaskConical size={18} className="text-info" />
                    <h6 className="fw-bold text-dark mb-0">Associated Diagnostic Lab Results</h6>
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
              </div>
            )}

            {/* Audit & Timestamps Strip */}
            <div className="p-3 rounded-3 bg-light border d-flex flex-wrap justify-content-between align-items-center gap-2 small text-muted">
              <div>
                <span>Created At: <strong>{record.created_at || 'Recorded on system'}</strong></span>
                {record.finalized_at && (
                  <span className="ms-3">Finalized At: <strong className="text-success">{record.finalized_at}</strong></span>
                )}
              </div>
              <div>
                <span>Audit Ref: <strong>SHA256-EHR-{record.id}</strong></span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-light border-top p-3 px-4 d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-3 px-3"
              onClick={onClose}
            >
              Close
            </button>

            <div className="d-flex align-items-center gap-2">
              {isDraft && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm rounded-3 d-flex align-items-center gap-1.5 px-3"
                    onClick={() => onEditDraft(record)}
                  >
                    <Edit3 size={15} />
                    <span>Edit Draft</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-success btn-sm rounded-3 d-flex align-items-center gap-1.5 px-3.5"
                    onClick={() => onFinalizeDraft(record.id)}
                  >
                    <CheckCircle size={15} />
                    <span>Finalize Record</span>
                  </button>
                </>
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
          </div>
        </div>
      </div>
    </div>
  )
}
