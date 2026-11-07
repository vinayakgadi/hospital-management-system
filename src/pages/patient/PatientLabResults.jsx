import { useState, useEffect } from 'react'
import { patientService } from '../../services/patientService.js'
import {
  Activity,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Printer,
  ShieldCheck,
  RefreshCw,
  Clock,
  Stethoscope,
  Info,
} from 'lucide-react'

export default function PatientLabResults() {
  const [labResults, setLabResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResult, setSelectedResult] = useState(null)

  const loadLabResults = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await patientService.getLabResults({ search: searchTerm })
      setLabResults(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load lab results:', err)
      setError('Unable to load clinical diagnostic lab results.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLabResults()
  }, [searchTerm])

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase()
    if (s === 'normal' || s === 'negative' || s === 'optimal') {
      return <span className="badge bg-success-subtle text-success px-2.5 py-1 rounded-pill">Normal</span>
    }
    if (s === 'borderline' || s === 'elevated' || s === 'high') {
      return <span className="badge bg-warning-subtle text-warning px-2.5 py-1 rounded-pill">Elevated</span>
    }
    if (s === 'low' || s === 'abnormal') {
      return <span className="badge bg-danger-subtle text-danger px-2.5 py-1 rounded-pill">Abnormal</span>
    }
    return <span className="badge bg-primary-subtle text-primary px-2.5 py-1 rounded-pill">{status || 'Completed'}</span>
  }

  const handlePrintReport = () => {
    window.print()
  }

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Diagnostic Laboratory Results</h4>
          <p className="text-muted small mb-0">
            Pathology tests, metabolic panels, and diagnostic evaluations released by the laboratory.
          </p>
        </div>
        <div className="d-inline-flex align-items-center gap-2 badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-3 small">
          <ShieldCheck size={16} />
          <span>Verified Clinical Results</span>
        </div>
      </div>

      {/* Search Bar */}
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
              placeholder="Search by test name, status, or clinician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lab Results Table / Cards */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Loading diagnostics...</span>
          </div>
          <p className="text-muted small">Loading lab test records...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 p-4 shadow-sm d-flex align-items-center gap-3">
          <AlertCircle size={24} className="text-danger flex-shrink-0" />
          <div className="flex-grow-1">
            <div className="fw-semibold">{error}</div>
            <button onClick={loadLabResults} className="btn btn-outline-danger btn-sm rounded-3 mt-2">
              <RefreshCw size={13} className="me-1" /> Retry
            </button>
          </div>
        </div>
      ) : labResults.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <Activity size={44} className="text-muted opacity-50 mx-auto mb-3" />
          <h6 className="fw-bold text-dark mb-1">No laboratory results found</h6>
          <p className="text-muted small mb-0">
            {searchTerm
              ? `No tests matching "${searchTerm}".`
              : 'You have no diagnostic test results on file at this time.'}
          </p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light text-muted small">
                <tr>
                  <th className="ps-4 py-3">Diagnostic Test</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Measured Result</th>
                  <th className="py-3">Reference Range</th>
                  <th className="py-3">Clinical Evaluation</th>
                  <th className="text-end pe-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light small">
                {labResults.map((lr) => (
                  <tr key={lr.id} className="hover:bg-light">
                    <td className="ps-4 py-3.5">
                      <div className="fw-semibold text-dark">{lr.test_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                        Supervised by Dr. {lr.doctor_name || 'Attending Physician'}
                      </div>
                    </td>
                    <td className="py-3.5 text-secondary">{lr.test_date}</td>
                    <td className="py-3.5">
                      <span className="fw-bold text-dark">{lr.result_value}</span>{' '}
                      <span className="text-muted">{lr.units}</span>
                    </td>
                    <td className="py-3.5 text-secondary">
                      {lr.reference_range ? `${lr.reference_range} ${lr.units}` : 'Standard Norms'}
                    </td>
                    <td className="py-3.5">{getStatusBadge(lr.status)}</td>
                    <td className="text-end pe-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedResult(lr)}
                        className="btn btn-outline-primary btn-sm rounded-3 px-3 py-1 text-primary small"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lab Result Details Modal */}
      {selectedResult && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom p-4 bg-light">
                <div className="d-flex align-items-center gap-2.5">
                  <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">{selectedResult.test_name}</h5>
                    <p className="text-muted small mb-0">Diagnostic Laboratory Report</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedResult(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body p-4 space-y-4">
                {/* Result Highlights */}
                <div className="row g-3">
                  <div className="col-sm-4">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <div className="text-muted small mb-1">Measured Value</div>
                      <div className="fs-4 fw-bold text-dark">
                        {selectedResult.result_value} <span className="fs-6 text-muted">{selectedResult.units}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <div className="text-muted small mb-1">Reference Range</div>
                      <div className="fs-5 fw-bold text-secondary">
                        {selectedResult.reference_range ? `${selectedResult.reference_range} ${selectedResult.units}` : 'Normal Range'}
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <div className="text-muted small mb-1">Evaluation</div>
                      <div>{getStatusBadge(selectedResult.status)}</div>
                    </div>
                  </div>
                </div>

                {/* Test Meta Info */}
                <div className="p-3 bg-light rounded-3 small space-y-2">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Collection / Specimen Date:</span>
                    <span className="fw-semibold text-dark">{selectedResult.test_date}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Ordering Physician:</span>
                    <span className="fw-semibold text-dark">Dr. {selectedResult.doctor_name || 'Attending Physician'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Diagnostic Laboratory:</span>
                    <span className="fw-semibold text-dark">HealthPulse Central Pathology Wing</span>
                  </div>
                </div>

                {/* Clinical Notes */}
                {selectedResult.notes && (
                  <div>
                    <h6 className="fw-bold text-dark mb-2">Pathologist / Clinician Interpretation</h6>
                    <p className="text-secondary small bg-light p-3 rounded-3 mb-0">
                      {selectedResult.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top p-3 bg-light d-flex justify-content-between">
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="btn btn-outline-primary btn-sm rounded-3 px-3 d-inline-flex align-items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Report</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-3 px-3"
                  onClick={() => setSelectedResult(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
