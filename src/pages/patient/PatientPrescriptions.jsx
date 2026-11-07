import { useState, useEffect } from 'react'
import { patientService } from '../../services/patientService.js'
import {
  Pill,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Printer,
  FileText,
  Stethoscope,
  Info,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react'

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRx, setSelectedRx] = useState(null)

  const loadPrescriptions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await patientService.getPrescriptions({
        status: statusFilter,
        search: searchTerm,
      })
      setPrescriptions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load prescriptions:', err)
      setError('Unable to retrieve prescription records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrescriptions()
  }, [statusFilter, searchTerm])

  const handlePrintSlip = () => {
    window.print()
  }

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">My Prescriptions & Medications</h4>
          <p className="text-muted small mb-0">
            Current medication regimen, dosage directions, and historical pharmacy orders.
          </p>
        </div>
        <div className="d-inline-flex align-items-center gap-2 badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-3 small">
          <ShieldCheck size={16} />
          <span>Physician Authorized Rx</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            {/* Filter Tabs */}
            <div className="nav nav-pills gap-1">
              <button
                type="button"
                className={`nav-link rounded-3 px-3.5 py-1.5 small fw-medium ${
                  statusFilter === 'all' ? 'active bg-primary' : 'text-secondary bg-light'
                }`}
                onClick={() => setStatusFilter('all')}
              >
                All Prescriptions
              </button>
              <button
                type="button"
                className={`nav-link rounded-3 px-3.5 py-1.5 small fw-medium ${
                  statusFilter === 'active' ? 'active bg-primary' : 'text-secondary bg-light'
                }`}
                onClick={() => setStatusFilter('active')}
              >
                Active Regimens
              </button>
              <button
                type="button"
                className={`nav-link rounded-3 px-3.5 py-1.5 small fw-medium ${
                  statusFilter === 'completed' ? 'active bg-primary' : 'text-secondary bg-light'
                }`}
                onClick={() => setStatusFilter('completed')}
              >
                Completed / Past
              </button>
            </div>

            {/* Search Input */}
            <div className="position-relative" style={{ minWidth: '280px' }}>
              <Search
                size={16}
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              />
              <input
                type="text"
                className="form-control bg-light border-0 ps-5 rounded-3 text-secondary small py-2"
                placeholder="Search medication or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Loading prescriptions...</span>
          </div>
          <p className="text-muted small">Accessing pharmacy records...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 p-4 shadow-sm d-flex align-items-center gap-3">
          <AlertCircle size={24} className="text-danger flex-shrink-0" />
          <div className="flex-grow-1">
            <div className="fw-semibold">{error}</div>
            <button onClick={loadPrescriptions} className="btn btn-outline-danger btn-sm rounded-3 mt-2">
              <RefreshCw size={13} className="me-1" /> Retry
            </button>
          </div>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <Pill size={44} className="text-muted opacity-50 mx-auto mb-3" />
          <h6 className="fw-bold text-dark mb-1">No prescriptions found</h6>
          <p className="text-muted small mb-0">
            {searchTerm
              ? `No medications matching "${searchTerm}".`
              : 'You do not have any prescriptions recorded in this category.'}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {prescriptions.map((rx) => {
            const isActive = rx.status?.toLowerCase() === 'active' || !rx.status
            return (
              <div key={rx.id} className="col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="p-2 rounded-3 text-white d-flex align-items-center justify-content-center"
                          style={{
                            background: isActive
                              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                              : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                          }}
                        >
                          <Pill size={20} />
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark mb-0">{rx.medication_name}</h6>
                          <span className="badge bg-light text-secondary border small mt-0.5">
                            {rx.route || 'Oral'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`badge rounded-pill px-2.5 py-1 ${
                          isActive
                            ? 'bg-success-subtle text-success'
                            : 'bg-secondary-subtle text-secondary'
                        }`}
                      >
                        {rx.status || 'Active'}
                      </span>
                    </div>

                    {/* Regimen Dosage Details */}
                    <div className="p-3 bg-light rounded-3 my-3">
                      <div className="row g-2 text-center text-sm-start">
                        <div className="col-sm-4">
                          <div className="text-muted small" style={{ fontSize: '0.74rem' }}>Dosage</div>
                          <div className="fw-bold text-dark small">{rx.dosage}</div>
                        </div>
                        <div className="col-sm-4">
                          <div className="text-muted small" style={{ fontSize: '0.74rem' }}>Frequency</div>
                          <div className="fw-bold text-dark small">{rx.frequency}</div>
                        </div>
                        <div className="col-sm-4">
                          <div className="text-muted small" style={{ fontSize: '0.74rem' }}>Duration</div>
                          <div className="fw-bold text-dark small">{rx.duration}</div>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    {rx.instructions && (
                      <div className="mb-3">
                        <div className="text-muted small fw-medium mb-1">Directions for Use:</div>
                        <p className="text-secondary small bg-light p-2.5 rounded-3 mb-0" style={{ fontSize: '0.82rem' }}>
                          {rx.instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Doctor Info & Print Slip Action */}
                  <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                    <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                      <span className="d-block fw-semibold text-dark">Dr. {rx.doctor_name}</span>
                      <span>Prescribed on {rx.prescription_date}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRx(rx)}
                      className="btn btn-outline-primary btn-sm rounded-3 px-3 py-1.5 small d-inline-flex align-items-center gap-1.5"
                    >
                      <Printer size={14} />
                      <span>Print Slip</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Official Prescription Slip Modal */}
      {selectedRx && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom p-4 bg-light">
                <div className="d-flex align-items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  <h5 className="modal-title fw-bold text-dark mb-0">Official Prescription Slip (Rx)</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRx(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body p-4 p-md-5 bg-white" id="printable-rx-slip">
                {/* Hospital Header */}
                <div className="d-flex align-items-center justify-content-between border-bottom pb-4 mb-4">
                  <div>
                    <h4 className="fw-bold text-primary mb-1">HealthPulse Medical Center</h4>
                    <p className="text-muted small mb-0">Clinical Department & Outpatient Pharmacology</p>
                    <p className="text-muted small mb-0">742 Healthcare Blvd, Suite 100 • Phone: (555) 019-9000</p>
                  </div>
                  <div className="text-end">
                    <div className="display-6 fw-bold text-primary font-monospace">Rx</div>
                    <div className="badge bg-light text-muted border small">Slip #{selectedRx.id}</div>
                  </div>
                </div>

                {/* Patient & Doctor Banner */}
                <div className="row g-3 p-3 bg-light rounded-3 mb-4 small">
                  <div className="col-sm-6">
                    <span className="text-muted">Patient Name: </span>
                    <span className="fw-bold text-dark">{selectedRx.patient_name}</span>
                    <br />
                    <span className="text-muted">Gender / Age: </span>
                    <span className="text-dark">{selectedRx.patient_gender} • {selectedRx.patient_age} yrs</span>
                  </div>
                  <div className="col-sm-6 text-sm-end">
                    <span className="text-muted">Prescribing Doctor: </span>
                    <span className="fw-bold text-dark">Dr. {selectedRx.doctor_name}</span>
                    <br />
                    <span className="text-muted">Date: </span>
                    <span className="text-dark">{selectedRx.prescription_date}</span>
                  </div>
                </div>

                {/* Medication Details */}
                <div className="p-4 border rounded-3 mb-4">
                  <div className="fs-5 fw-bold text-dark mb-1">{selectedRx.medication_name}</div>
                  <div className="text-secondary mb-3">
                    <span className="badge bg-primary-subtle text-primary me-2">{selectedRx.dosage}</span>
                    <span>Route: {selectedRx.route || 'Oral'}</span>
                  </div>

                  <div className="row g-2 mb-3 small">
                    <div className="col-sm-6">
                      <span className="text-muted">Frequency: </span>
                      <span className="fw-semibold text-dark">{selectedRx.frequency}</span>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted">Duration: </span>
                      <span className="fw-semibold text-dark">{selectedRx.duration}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-top">
                    <span className="fw-semibold text-dark small d-block mb-1">Clinical Instructions:</span>
                    <p className="text-secondary small mb-0">
                      {selectedRx.instructions || 'Take as directed by your physician.'}
                    </p>
                  </div>
                </div>

                {/* Signature Line */}
                <div className="row align-items-end pt-4 mt-2">
                  <div className="col-sm-6 text-muted small">
                    <div>Status: <span className="text-success fw-medium">{selectedRx.status || 'Active'}</span></div>
                    <div>HealthPulse Electronic Prescription Verification</div>
                  </div>
                  <div className="col-sm-6 text-sm-end">
                    <div className="border-bottom border-dark d-inline-block" style={{ width: '200px' }} />
                    <div className="small fw-semibold text-dark mt-1">Dr. {selectedRx.doctor_name}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Authorized Medical Practitioner Signature</div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top p-3 bg-light">
                <button
                  type="button"
                  className="btn btn-light rounded-3 px-3 py-2 small"
                  onClick={() => setSelectedRx(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="btn btn-primary rounded-3 px-4 py-2 small fw-medium shadow-xs d-inline-flex align-items-center gap-1.5"
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                >
                  <Printer size={15} />
                  <span>Print Prescription Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
