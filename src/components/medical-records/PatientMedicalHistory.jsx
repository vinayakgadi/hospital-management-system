import { useState } from 'react'
import {
  History,
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  HeartPulse,
  Search,
  Eye,
  FileText,
  AlertTriangle,
} from 'lucide-react'

export default function PatientMedicalHistory({
  isOpen,
  onClose,
  patient,
  records = [],
  loading = false,
  onViewRecord,
}) {
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen) return null

  const filtered = records.filter((r) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      (r.diagnosis || '').toLowerCase().includes(q) ||
      (r.doctor_name || '').toLowerCase().includes(q) ||
      (r.symptoms || '').toLowerCase().includes(q) ||
      (r.consultation_date || '').includes(q)
    )
  })

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
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center"
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
              >
                <History size={22} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">
                  Patient Medical History & Longitudinal Timeline
                </h5>
                <small className="text-muted">
                  Chronological Electronic Health Record for {patient?.name || 'Patient'}
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Body */}
          <div className="modal-body p-4" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            {/* Patient Header Banner */}
            {patient && (
              <div className="card border-0 rounded-4 shadow-xs bg-white mb-4 border p-3.5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{
                        width: '46px',
                        height: '46px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        fontSize: '1.1rem',
                      }}
                    >
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h5 className="fw-bold text-dark mb-0">{patient.name}</h5>
                        <span className="badge bg-primary-subtle text-primary">
                          {patient.disease || 'General Care'}
                        </span>
                      </div>
                      <small className="text-muted">
                        ID: #{patient.id} • {patient.age || '30'} yrs • {patient.gender || 'Male'} • {patient.email}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-light text-secondary border px-3 py-2 small">
                      Total Documented Consultations: <strong className="text-dark">{records.length}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Search Filter */}
            <div className="mb-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted ps-3">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 py-2"
                  placeholder="Filter patient encounters by diagnosis, symptoms, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Timeline / Records List */}
            {loading ? (
              <div className="p-5 text-center">
                <div className="spinner-border text-primary mb-2" role="status" />
                <div className="small text-muted">Retrieving patient longitudinal history...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-5 text-center text-muted card border rounded-4 bg-light">
                <FileText size={40} className="text-muted mx-auto mb-2" />
                <h6 className="fw-bold text-dark mb-1">No Consultation Encounters Found</h6>
                <small>No prior records match the current search term.</small>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filtered.map((rec, index) => {
                  const isDraft = rec.status === 'Draft'
                  return (
                    <div
                      key={rec.id}
                      className="card border rounded-4 shadow-xs bg-white overflow-hidden"
                    >
                      <div className="card-header bg-light border-bottom p-3 px-4 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge font-monospace bg-white text-primary border">
                            #MR-{rec.id.toString().padStart(4, '0')}
                          </span>
                          <span className="fw-bold text-dark small">{rec.consultation_date}</span>
                          <span className="text-muted small">({rec.consultation_time || '10:00 AM'})</span>
                          <span
                            className={`badge rounded-pill small ${
                              isDraft
                                ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                                : 'bg-success-subtle text-success border border-success-subtle'
                            }`}
                          >
                            {isDraft ? 'Draft' : 'Finalized'}
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <span className="small text-muted d-flex align-items-center gap-1">
                            <Stethoscope size={13} className="text-primary" />
                            <strong>{rec.doctor_name}</strong>
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm py-1 px-2.5 rounded-2 d-flex align-items-center gap-1"
                            onClick={() => {
                              onClose()
                              onViewRecord(rec.id)
                            }}
                            style={{ fontSize: '0.78rem' }}
                          >
                            <Eye size={13} />
                            <span>View Full Record</span>
                          </button>
                        </div>
                      </div>

                      <div className="card-body p-3.5">
                        <div className="mb-2">
                          <span className="text-secondary small fw-bold">Primary Diagnosis: </span>
                          <span className="text-dark fw-bold">{rec.diagnosis}</span>
                        </div>

                        <div className="row g-2 small text-muted">
                          <div className="col-12 col-md-6">
                            <strong className="text-secondary d-block">Symptoms Reported:</strong>
                            <p className="text-dark mb-0">{rec.symptoms || 'None recorded'}</p>
                          </div>
                          <div className="col-12 col-md-6">
                            <strong className="text-secondary d-block">Clinical Observations:</strong>
                            <p className="text-dark mb-0">{rec.observations || 'Unremarkable'}</p>
                          </div>
                          <div className="col-12">
                            <strong className="text-secondary d-block">Treatment Plan:</strong>
                            <p className="text-dark mb-0">{rec.treatment_plan || 'Symptomatic / Routine'}</p>
                          </div>
                        </div>

                        {rec.follow_up_date && (
                          <div className="mt-2.5 pt-2 border-top small text-muted d-flex align-items-center gap-1">
                            <Clock size={12} className="text-primary" />
                            <span>Follow-up scheduled: <strong className="text-dark">{rec.follow_up_date}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-top p-3 px-4">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-3 px-4"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
