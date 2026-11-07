import { useState, useEffect } from 'react'
import { patientService } from '../../services/patientService.js'
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Calendar,
  Clock,
  Printer,
  Edit3,
  X,
  Heart,
  Activity,
  Send,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react'

export default function PatientMedicalRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [toast, setToast] = useState(null)

  // Correction Request Modal State
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionTarget, setCorrectionTarget] = useState(null)
  const [correctionReason, setCorrectionReason] = useState('')
  const [correctionDetails, setCorrectionDetails] = useState('')
  const [submittingCorrection, setSubmittingCorrection] = useState(false)
  const [correctionError, setCorrectionError] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await patientService.getMedicalRecords({ search: searchTerm })
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load patient medical records:', err)
      setError('Unable to retrieve finalized clinical consultation records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [searchTerm])

  const handleOpenCorrection = (record) => {
    setCorrectionTarget(record)
    setCorrectionReason('')
    setCorrectionDetails('')
    setCorrectionError(null)
    setShowCorrectionModal(true)
  }

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault()
    if (!correctionReason.trim() || !correctionDetails.trim()) {
      setCorrectionError('Both a reason and detailed explanation are required.')
      return
    }

    setSubmittingCorrection(true)
    setCorrectionError(null)
    try {
      await patientService.requestCorrection(correctionTarget.id, {
        reason: correctionReason.trim(),
        details: correctionDetails.trim(),
      })
      showToast('Correction request submitted to the attending physician for clinical review.')
      setShowCorrectionModal(false)
    } catch (err) {
      console.error('Failed to submit correction request:', err)
      setCorrectionError(err.response?.data?.error || 'Failed to submit correction request.')
    } finally {
      setSubmittingCorrection(false)
    }
  }

  const handlePrintRecord = () => {
    window.print()
  }

  return (
    <div>
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
            <span className="small fw-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Electronic Medical Records (EMR)</h4>
          <p className="text-muted small mb-0">
            Official, physician-signed clinical encounter summaries, diagnoses, and treatment plans.
          </p>
        </div>
        <div className="d-inline-flex align-items-center gap-2 badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-3 small">
          <ShieldCheck size={16} />
          <span>Finalized & Certified Records</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="position-relative">
            <Search
              size={18}
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
            />
            <input
              type="text"
              className="form-control bg-light border-0 ps-5 rounded-3 py-2 text-secondary small"
              placeholder="Search records by diagnosis, symptoms, or attending physician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Medical Records List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Loading records...</span>
          </div>
          <p className="text-muted small">Loading clinical consultations...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 p-4 shadow-sm d-flex align-items-center gap-3">
          <AlertCircle size={24} className="text-danger flex-shrink-0" />
          <div className="flex-grow-1">
            <div className="fw-semibold">{error}</div>
            <button onClick={loadRecords} className="btn btn-outline-danger btn-sm rounded-3 mt-2">
              <RefreshCw size={13} className="me-1" /> Retry
            </button>
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <FileText size={44} className="text-muted opacity-50 mx-auto mb-3" />
          <h6 className="fw-bold text-dark mb-1">No medical records found</h6>
          <p className="text-muted small mb-0">
            {searchTerm
              ? `No records matching "${searchTerm}".`
              : 'You do not have any finalized medical records in the system yet. Once your physician conducts a consultation and finalizes the chart, it will be securely displayed here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => (
            <div key={rec.id} className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-3">
              <div className="row align-items-center">
                <div className="col-lg-7 mb-3 mb-lg-0">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-success-subtle text-success small">
                      {rec.status}
                    </span>
                    <span className="text-muted small">• Encounter #{rec.id}</span>
                    {rec.is_amended && (
                      <span className="badge bg-warning-subtle text-warning small">
                        Amended
                      </span>
                    )}
                  </div>
                  <h5 className="fw-bold text-dark mb-1">{rec.diagnosis || 'Clinical Consultation'}</h5>
                  <p className="text-secondary small mb-2 line-clamp-2">
                    {rec.treatment_plan || rec.clinical_notes || rec.symptoms || 'General clinical consultation.'}
                  </p>
                  <div className="d-flex flex-wrap align-items-center gap-3 text-muted small" style={{ fontSize: '0.8rem' }}>
                    <span className="d-flex align-items-center gap-1.5">
                      <Stethoscope size={14} className="text-primary" />
                      <span>Dr. {rec.doctor_name} ({rec.doctor_specialization})</span>
                    </span>
                    <span className="d-flex align-items-center gap-1.5">
                      <Calendar size={14} className="text-primary" />
                      <span>{rec.consultation_date}</span>
                    </span>
                  </div>
                </div>

                <div className="col-lg-5 text-lg-end d-flex flex-wrap justify-content-lg-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenCorrection(rec)}
                    className="btn btn-outline-secondary btn-sm rounded-3 px-3 py-2 small d-inline-flex align-items-center gap-1.5"
                  >
                    <Edit3 size={14} />
                    <span>Request Correction</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(rec)}
                    className="btn btn-primary btn-sm rounded-3 px-3.5 py-2 small fw-medium shadow-xs d-inline-flex align-items-center gap-1.5"
                    style={{ background: '#0284c7', borderColor: '#0284c7' }}
                  >
                    <FileText size={14} />
                    <span>View Full Record</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom p-4 bg-light">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 bg-primary bg-opacity-10 text-primary rounded-3">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Electronic Medical Record</h5>
                    <div className="d-flex align-items-center gap-2 small text-muted">
                      <span>Encounter #{selectedRecord.id}</span>
                      <span>•</span>
                      <span>{selectedRecord.consultation_date}</span>
                      <span className="badge bg-success-subtle text-success ms-1">Finalized</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRecord(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body p-4 space-y-4">
                {/* Physician & Visit Information */}
                <div className="p-3 bg-light rounded-3 d-flex flex-wrap justify-content-between gap-3">
                  <div>
                    <div className="text-muted small fw-medium">Attending Physician</div>
                    <div className="fw-bold text-dark">Dr. {selectedRecord.doctor_name}</div>
                    <div className="text-secondary small">{selectedRecord.doctor_specialization}</div>
                  </div>
                  <div>
                    <div className="text-muted small fw-medium">Visit Type</div>
                    <div className="fw-semibold text-dark">{selectedRecord.visit_type || 'Consultation'}</div>
                    <div className="text-secondary small">{selectedRecord.consultation_time || '10:00 AM'}</div>
                  </div>
                </div>

                {/* Vital Signs Grid */}
                {selectedRecord.vital_signs && (
                  <div>
                    <h6 className="fw-bold text-dark mb-2.5 d-flex align-items-center gap-1.5">
                      <Activity size={16} className="text-danger" />
                      <span>Recorded Vital Signs</span>
                    </h6>
                    <div className="row g-2 text-center">
                      <div className="col-4 col-sm">
                        <div className="p-2.5 rounded-3 bg-light border">
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Blood Pressure</div>
                          <div className="fw-bold text-dark small">{selectedRecord.vital_signs?.bp || selectedRecord.vital_signs?.blood_pressure || '120/80'}</div>
                        </div>
                      </div>
                      <div className="col-4 col-sm">
                        <div className="p-2.5 rounded-3 bg-light border">
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Heart Rate</div>
                          <div className="fw-bold text-dark small">{selectedRecord.vital_signs?.heart_rate || selectedRecord.vital_signs?.pulse || '72 bpm'}</div>
                        </div>
                      </div>
                      <div className="col-4 col-sm">
                        <div className="p-2.5 rounded-3 bg-light border">
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Oxygen (SpO2)</div>
                          <div className="fw-bold text-dark small">{selectedRecord.vital_signs?.spo2 || selectedRecord.vital_signs?.oxygen_saturation || '98%'}</div>
                        </div>
                      </div>
                      <div className="col-6 col-sm">
                        <div className="p-2.5 rounded-3 bg-light border">
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Temperature</div>
                          <div className="fw-bold text-dark small">{selectedRecord.vital_signs?.temp || selectedRecord.vital_signs?.temperature || '98.6 °F'}</div>
                        </div>
                      </div>
                      <div className="col-6 col-sm">
                        <div className="p-2.5 rounded-3 bg-light border">
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Resp. Rate</div>
                          <div className="fw-bold text-dark small">{selectedRecord.vital_signs?.respiratory_rate || '16 /min'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Diagnosis */}
                <div>
                  <h6 className="fw-bold text-dark mb-1">Clinical Diagnosis</h6>
                  <div className="p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3">
                    <span className="fw-bold text-primary fs-6">{selectedRecord.diagnosis || 'Unspecified Condition'}</span>
                  </div>
                </div>

                {/* Symptoms / Reported Issues */}
                {selectedRecord.symptoms && (
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Reported Symptoms & Complaints</h6>
                    <p className="text-secondary small bg-light p-3 rounded-3 mb-0">
                      {selectedRecord.symptoms}
                    </p>
                  </div>
                )}

                {/* Treatment Plan */}
                <div>
                  <h6 className="fw-bold text-dark mb-1">Treatment Plan & Clinical Orders</h6>
                  <p className="text-secondary small bg-light p-3 rounded-3 mb-0">
                    {selectedRecord.treatment_plan || 'Continue current health regimen as recommended by physician.'}
                  </p>
                </div>

                {/* Clinical Notes */}
                {selectedRecord.clinical_notes && (
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Clinical Notes & Observations</h6>
                    <p className="text-secondary small bg-light p-3 rounded-3 mb-0">
                      {selectedRecord.clinical_notes}
                    </p>
                  </div>
                )}

                {/* Follow-up */}
                {selectedRecord.follow_up_date && (
                  <div className="p-3 bg-warning-subtle border border-warning-subtle rounded-3 small text-warning-emphasis">
                    <span className="fw-bold">Scheduled Follow-up: </span>
                    <span>{selectedRecord.follow_up_date}</span>
                    {selectedRecord.follow_up_notes && <span> — {selectedRecord.follow_up_notes}</span>}
                  </div>
                )}
              </div>

              <div className="modal-footer border-top p-3 bg-light d-flex justify-content-between">
                <button
                  type="button"
                  onClick={() => {
                    const r = selectedRecord
                    setSelectedRecord(null)
                    handleOpenCorrection(r)
                  }}
                  className="btn btn-outline-secondary btn-sm rounded-3 px-3 d-inline-flex align-items-center gap-1.5"
                >
                  <Edit3 size={14} />
                  <span>Request Record Correction</span>
                </button>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintRecord}
                    className="btn btn-outline-primary btn-sm rounded-3 px-3 d-inline-flex align-items-center gap-1.5"
                  >
                    <Printer size={14} />
                    <span>Print Summary</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm rounded-3 px-3"
                    onClick={() => setSelectedRecord(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Correction Request Modal */}
      {showCorrectionModal && correctionTarget && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom p-4 bg-light">
                <div className="d-flex align-items-center gap-2.5">
                  <div className="p-2 bg-warning bg-opacity-10 text-warning rounded-3">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Request Chart Amendment</h5>
                    <p className="text-muted small mb-0">Record #{correctionTarget.id} — {correctionTarget.consultation_date}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCorrectionModal(false)}
                  aria-label="Close"
                />
              </div>

              <form onSubmit={handleCorrectionSubmit}>
                <div className="modal-body p-4 space-y-3">
                  <div className="p-3 bg-info-subtle border border-info-subtle rounded-3 text-info-emphasis small d-flex align-items-start gap-2 mb-3">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>
                      Under patient health rights (HIPAA § 164.526), patients may request an amendment to their medical record if they believe clinical or demographic entries are inaccurate.
                    </span>
                  </div>

                  {correctionError && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 small rounded-3 p-3 mb-3">
                      <AlertCircle size={18} className="text-danger flex-shrink-0" />
                      <div>{correctionError}</div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Reason for Correction <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      placeholder="e.g. Dosage clarification, incorrect symptom description, allergy entry..."
                      value={correctionReason}
                      onChange={(e) => setCorrectionReason(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Specific Details / Corrections Needed <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control bg-light"
                      rows="4"
                      placeholder="Explain what specific item is inaccurate and provide the accurate information for your physician's review..."
                      value={correctionDetails}
                      onChange={(e) => setCorrectionDetails(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-top p-3 bg-light">
                  <button
                    type="button"
                    className="btn btn-light rounded-3 px-3 py-2 small"
                    onClick={() => setShowCorrectionModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCorrection}
                    className="btn btn-warning rounded-3 px-4 py-2 small fw-medium shadow-xs d-inline-flex align-items-center gap-1.5 text-dark"
                  >
                    <Send size={15} />
                    <span>{submittingCorrection ? 'Submitting...' : 'Submit Request'}</span>
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
