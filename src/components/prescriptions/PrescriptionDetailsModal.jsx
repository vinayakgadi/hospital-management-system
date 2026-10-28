import { useState } from 'react'
import {
  X,
  Printer,
  Pill,
  User,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  History,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react'

export default function PrescriptionDetailsModal({
  prescription,
  onClose,
  onEdit,
  onViewMedicalRecord,
}) {
  const [activeTab, setActiveTab] = useState('details') // 'details' | 'amendments' | 'print'

  if (!prescription) return null

  const getStatusBadge = (status) => {
    const s = (status || 'Active').toLowerCase()
    if (s === 'active') {
      return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Active</span>
    }
    if (s === 'completed') {
      return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">Completed</span>
    }
    if (s === 'discontinued' || s === 'cancelled' || s === 'canceled') {
      return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">{status}</span>
    }
    return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">{status}</span>
  }

  const handlePrint = () => {
    window.print()
  }

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
                style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' }}
              >
                <Pill size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white fs-6">
                  Prescription Details #{prescription.id}
                </h5>
                <span className="text-white-50" style={{ fontSize: '0.75rem' }}>
                  Electronic Medication Order • HealthPulse Medical Center
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 py-1 px-2"
                onClick={handlePrint}
                title="Print Official Prescription"
              >
                <Printer size={15} />
                <span className="d-none d-sm-inline">Print Rx</span>
              </button>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-light px-4 border-bottom d-flex gap-3">
            <button
              className={`btn btn-link text-decoration-none py-2 px-1 border-0 rounded-0 fw-semibold fs-7 ${
                activeTab === 'details'
                  ? 'text-primary border-bottom border-primary border-2'
                  : 'text-muted'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Order Details
            </button>
            <button
              className={`btn btn-link text-decoration-none py-2 px-1 border-0 rounded-0 fw-semibold fs-7 position-relative ${
                activeTab === 'amendments'
                  ? 'text-primary border-bottom border-primary border-2'
                  : 'text-muted'
              }`}
              onClick={() => setActiveTab('amendments')}
            >
              Amendment History
              {prescription.amendments?.length > 0 && (
                <span className="badge bg-warning text-dark ms-1 py-0 px-1" style={{ fontSize: '0.65rem' }}>
                  {prescription.amendments.length}
                </span>
              )}
            </button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {activeTab === 'details' && (
              <div className="d-flex flex-column gap-3">
                {/* Header status bar */}
                <div className="p-3 bg-light rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border">
                  <div>
                    <span className="text-muted small d-block">Status</span>
                    {getStatusBadge(prescription.status)}
                  </div>
                  <div>
                    <span className="text-muted small d-block">Prescription Date</span>
                    <span className="fw-semibold text-dark fs-7">
                      {prescription.prescription_date || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted small d-block">Issued At</span>
                    <span className="fw-semibold text-dark fs-7">
                      {prescription.created_at ? prescription.created_at.slice(0, 16) : 'N/A'}
                    </span>
                  </div>
                  {prescription.updated_at && (
                    <div>
                      <span className="text-muted small d-block">Last Modified</span>
                      <span className="fw-semibold text-dark fs-7">
                        {prescription.updated_at.slice(0, 16)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Patient & Doctor Cards */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 border rounded-3 h-100 bg-white">
                      <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-semibold fs-7">
                        <User size={16} />
                        <span>Patient Information</span>
                      </div>
                      <h6 className="fw-bold mb-1 text-dark">{prescription.patient_name}</h6>
                      <div className="text-muted small">ID: #{prescription.patient_id}</div>
                      <div className="text-muted small">
                        {prescription.patient_gender} • {prescription.patient_age} yrs
                      </div>
                      {prescription.patient_disease && (
                        <div className="mt-2 text-muted small">
                          <span className="fw-medium text-dark">Condition: </span>
                          {prescription.patient_disease}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 border rounded-3 h-100 bg-white">
                      <div className="d-flex align-items-center gap-2 mb-2 text-teal fw-semibold fs-7" style={{ color: '#0d9488' }}>
                        <Stethoscope size={16} />
                        <span>Prescribing Clinician</span>
                      </div>
                      <h6 className="fw-bold mb-1 text-dark">{prescription.doctor_name}</h6>
                      <div className="text-muted small">
                        Specialization: {prescription.doctor_specialization || 'Clinical Care'}
                      </div>
                      {prescription.doctor_email && (
                        <div className="text-muted small">{prescription.doctor_email}</div>
                      )}
                      {prescription.doctor_phone && (
                        <div className="text-muted small">Tel: {prescription.doctor_phone}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clinical Order Block */}
                <div className="p-3 border rounded-3 bg-white">
                  <div className="d-flex align-items-center gap-2 mb-3 text-dark fw-bold fs-6">
                    <Pill size={18} className="text-primary" />
                    <span>Medication Order</span>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <span className="text-muted small d-block">Medication Name</span>
                      <span className="fw-bold text-dark fs-6">{prescription.medication_name}</span>
                    </div>
                    <div className="col-md-3">
                      <span className="text-muted small d-block">Dosage</span>
                      <span className="fw-semibold text-dark">{prescription.dosage}</span>
                    </div>
                    <div className="col-md-3">
                      <span className="text-muted small d-block">Route</span>
                      <span className="badge bg-light text-dark border">{prescription.route || 'Oral'}</span>
                    </div>
                    <div className="col-md-6">
                      <span className="text-muted small d-block">Frequency</span>
                      <span className="fw-semibold text-dark">{prescription.frequency}</span>
                    </div>
                    <div className="col-md-6">
                      <span className="text-muted small d-block">Duration / Supply</span>
                      <span className="fw-semibold text-dark">{prescription.duration}</span>
                    </div>
                    <div className="col-12">
                      <span className="text-muted small d-block">Special Clinical Instructions</span>
                      <div className="p-2 bg-light rounded border text-dark fs-7 mt-1">
                        {prescription.instructions || 'Standard dosage instructions apply. Take as prescribed.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linked Medical Record / Consultation */}
                {prescription.medical_record_id ? (
                  <div className="p-3 border border-primary-subtle rounded-3 bg-primary-subtle bg-opacity-10 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-2 text-primary fw-semibold small">
                        <FileText size={16} />
                        <span>Linked Electronic Medical Record (EMR #{prescription.medical_record_id})</span>
                      </div>
                      <div className="text-muted small mt-1">
                        Diagnosis: {prescription.medical_record_diagnosis || 'Clinical Consultation'} • Consultation Date: {prescription.medical_record_date || 'Recorded'}
                      </div>
                    </div>
                    {onViewMedicalRecord && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onViewMedicalRecord(prescription.medical_record_id)}
                      >
                        View Record
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-2 px-3 border rounded-3 bg-light text-muted small d-flex align-items-center gap-2">
                    <FileText size={14} />
                    <span>Independent Prescription Order (No direct medical record linked)</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'amendments' && (
              <div>
                {prescription.amendments && prescription.amendments.length > 0 ? (
                  <div className="timeline d-flex flex-column gap-3">
                    {prescription.amendments.map((amend, index) => {
                      let prev = {}
                      try {
                        prev = JSON.parse(amend.previous_data)
                      } catch (e) {
                        prev = { raw: amend.previous_data }
                      }

                      return (
                        <div key={amend.id || index} className="p-3 border rounded-3 bg-white shadow-xs">
                          <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-warning text-dark">Amendment #{prescription.amendments.length - index}</span>
                              <span className="fw-semibold text-dark small">{amend.amended_by_name}</span>
                              <span className="text-muted small">({amend.amended_by_role})</span>
                            </div>
                            <span className="text-muted small">{amend.created_at ? amend.created_at.slice(0, 16) : ''}</span>
                          </div>

                          <div className="mb-2">
                            <span className="text-muted small d-block fw-medium">Clinical Reason for Amendment:</span>
                            <p className="mb-0 text-dark small fst-italic bg-light p-2 rounded">
                              "{amend.amendment_reason}"
                            </p>
                          </div>

                          <div className="small text-muted">
                            <span className="fw-medium text-dark d-block mb-1">Previous Values Snapshot:</span>
                            <div className="row g-2 bg-light p-2 rounded border">
                              <div className="col-md-6">
                                <strong>Medication:</strong> {prev.medication_name || 'N/A'}
                              </div>
                              <div className="col-md-3">
                                <strong>Dosage:</strong> {prev.dosage || 'N/A'}
                              </div>
                              <div className="col-md-3">
                                <strong>Status:</strong> {prev.status || 'N/A'}
                              </div>
                              <div className="col-md-6">
                                <strong>Frequency:</strong> {prev.frequency || 'N/A'}
                              </div>
                              <div className="col-md-6">
                                <strong>Duration:</strong> {prev.duration || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <ShieldCheck size={36} className="text-success mb-2" />
                    <p className="mb-0 fw-medium">Original Order Unmodified</p>
                    <small>No clinical amendments have been made to this prescription.</small>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Printable Section (hidden in regular screen, visible on print) */}
          <div className="d-none d-print-block p-4">
            <div className="text-center pb-3 border-bottom mb-4">
              <h3 className="fw-bold mb-1">HealthPulse Medical Center</h3>
              <p className="text-muted small mb-0">Department of Clinical Pharmacy & Therapeutics</p>
              <p className="text-muted small">100 HealthPulse Blvd, Medical District • Tel: (555) 019-2834</p>
            </div>

            <div className="row mb-4">
              <div className="col-6">
                <strong>Patient:</strong> {prescription.patient_name} (ID: #{prescription.patient_id})<br />
                <strong>Age/Gender:</strong> {prescription.patient_age} yrs / {prescription.patient_gender}<br />
                <strong>Date:</strong> {prescription.prescription_date}
              </div>
              <div className="col-6 text-end">
                <strong>Prescriber:</strong> {prescription.doctor_name}<br />
                <strong>Specialization:</strong> {prescription.doctor_specialization}<br />
                <strong>Rx Order ID:</strong> #{prescription.id}
              </div>
            </div>

            <div className="p-4 border border-2 rounded mb-4" style={{ minHeight: '180px' }}>
              <div className="fs-3 fw-bold text-dark mb-2">Rx</div>
              <h4><strong>{prescription.medication_name}</strong> {prescription.dosage}</h4>
              <p className="mb-1"><strong>Route:</strong> {prescription.route || 'Oral'} | <strong>Frequency:</strong> {prescription.frequency}</p>
              <p className="mb-1"><strong>Duration:</strong> {prescription.duration}</p>
              <p className="mb-0"><strong>Sig:</strong> {prescription.instructions}</p>
            </div>

            <div className="row mt-5 pt-4">
              <div className="col-6">
                <small className="text-muted">Security Code: HP-{prescription.id}-{prescription.prescription_date}</small>
              </div>
              <div className="col-6 text-end">
                <div style={{ borderTop: '1px solid #333', width: '200px', display: 'inline-block', paddingTop: '5px' }}>
                  <strong>{prescription.doctor_name}</strong><br />
                  <small className="text-muted">Physician Signature</small>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light px-4 py-2 d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Close
            </button>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                onClick={handlePrint}
              >
                <Printer size={15} />
                <span>Print Document</span>
              </button>
              {onEdit && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-3"
                  onClick={() => onEdit(prescription)}
                >
                  Edit / Update Status
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
