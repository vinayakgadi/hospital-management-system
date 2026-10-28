import { useState } from 'react'
import axios from 'axios'
import {
  X,
  Pill,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'

export default function EditPrescriptionModal({ prescription, onClose, onSuccess }) {
  const [status, setStatus] = useState(prescription.status || 'Active')
  const [medicationName, setMedicationName] = useState(prescription.medication_name || '')
  const [dosage, setDosage] = useState(prescription.dosage || '')
  const [route, setRoute] = useState(prescription.route || 'Oral')
  const [frequency, setFrequency] = useState(prescription.frequency || 'Once daily (QD)')
  const [duration, setDuration] = useState(prescription.duration || '30 days')
  const [instructions, setInstructions] = useState(prescription.instructions || '')
  const [amendmentReason, setAmendmentReason] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Check if clinical details have been modified from original
  const hasClinicalChanged =
    medicationName.trim() !== (prescription.medication_name || '').trim() ||
    dosage.trim() !== (prescription.dosage || '').trim() ||
    route.trim() !== (prescription.route || 'Oral').trim() ||
    frequency.trim() !== (prescription.frequency || '').trim() ||
    duration.trim() !== (prescription.duration || '').trim() ||
    instructions.trim() !== (prescription.instructions || '').trim()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!medicationName.trim() || !dosage.trim()) {
      setError('Medication name and dosage are required.')
      return
    }

    if (hasClinicalChanged && !amendmentReason.trim()) {
      setError('A clinical amendment reason is required when modifying medication details.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        status,
        medication_name: medicationName.trim(),
        dosage: dosage.trim(),
        route,
        frequency,
        duration,
        instructions: instructions.trim(),
        amendment_reason: amendmentReason.trim(),
      }

      await axios.put(`${API_BASE_URL}/api/prescriptions/${prescription.id}`, payload)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Failed to update prescription:', err)
      setError(err.response?.data?.error || 'Failed to update prescription.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1055 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div
            className="modal-header text-white px-4 py-3 d-flex align-items-center justify-content-between"
            style={{ backgroundColor: '#0f172a' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="p-2 rounded-3 text-white d-flex align-items-center justify-content-center"
                style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' }}
              >
                <Pill size={18} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white fs-6">
                  Update Prescription #{prescription.id}
                </h5>
                <span className="text-white-50" style={{ fontSize: '0.75rem' }}>
                  Patient: {prescription.patient_name} • Dr: {prescription.doctor_name}
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 fs-7" role="alert">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <div>{error}</div>
                </div>
              )}

              {/* Status Selector */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Order Status
                </label>
                <select
                  className="form-select form-select-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active (Ongoing dispensing)</option>
                  <option value="Completed">Completed (Full course finished)</option>
                  <option value="Discontinued">Discontinued (Clinically stopped)</option>
                  <option value="Cancelled">Cancelled (Order rescinded)</option>
                </select>
              </div>

              {/* Medication Details */}
              <div className="p-3 border rounded-3 bg-light mb-3">
                <div className="row g-2 mb-2">
                  <div className="col-md-7">
                    <label className="form-label small text-muted mb-1">
                      Medication Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-white"
                      value={medicationName}
                      onChange={(e) => setMedicationName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label small text-muted mb-1">
                      Dosage <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-white"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1">Frequency</label>
                    <select
                      className="form-select form-select-sm bg-white"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
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
                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1">Duration</label>
                    <select
                      className="form-select form-select-sm bg-white"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
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

                <div className="mb-2">
                  <label className="form-label small text-muted mb-1">Route</label>
                  <select
                    className="form-select form-select-sm bg-white"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                  >
                    <option value="Oral">Oral</option>
                    <option value="Intravenous (IV)">Intravenous (IV)</option>
                    <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Topical">Topical</option>
                  </select>
                </div>

                <div>
                  <label className="form-label small text-muted mb-1">Instructions / Sig</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-white"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>
              </div>

              {/* Amendment Reason Box (Required if clinical details modified) */}
              {hasClinicalChanged && (
                <div className="p-3 border border-warning-subtle rounded-3 bg-warning-subtle bg-opacity-25 mb-2">
                  <div className="d-flex align-items-center gap-1 text-warning-emphasis fw-bold small mb-1">
                    <AlertTriangle size={15} />
                    <span>Clinical Modification Detected</span>
                  </div>
                  <p className="text-muted small mb-2">
                    To maintain clinical compliance and prevent silent modifications, please state the clinical justification for altering this order.
                  </p>
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Amendment Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    placeholder="e.g. Dose adjusted following renal panel review, patient reported mild nausea"
                    value={amendmentReason}
                    onChange={(e) => setAmendmentReason(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer bg-light px-4 py-2 d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4 d-flex align-items-center gap-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
