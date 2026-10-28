import {
  Eye,
  Edit3,
  CheckCircle,
  FileText,
  Clock,
  Printer,
  History,
  Calendar,
  AlertCircle,
  User,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function MedicalRecordsTable({
  records,
  loading,
  page,
  totalPages,
  totalRecords,
  perPage,
  onPageChange,
  onViewRecord,
  onEditRecord,
  onFinalizeRecord,
  onViewPatientHistory,
  onPrintRecord,
}) {
  if (loading) {
    return (
      <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center my-3">
        <div className="spinner-border text-primary mx-auto mb-3" role="status">
          <span className="visually-hidden">Loading medical records...</span>
        </div>
        <h6 className="fw-semibold text-dark">Retrieving Electronic Health Records...</h6>
        <p className="text-muted small mb-0">Querying persistent SQLite clinical repository...</p>
      </div>
    )
  }

  if (!records || records.length === 0) {
    return (
      <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center my-3">
        <FileText size={48} className="text-muted mx-auto mb-3" />
        <h5 className="fw-bold text-dark">No Medical Records Found</h5>
        <p className="text-muted small mb-0">
          No records match your selected criteria. Try adjusting your search query, status, or date range filters.
        </p>
      </div>
    )
  }

  const startRecord = (page - 1) * perPage + 1
  const endRecord = Math.min(page * perPage, totalRecords)

  return (
    <div className="card border-0 rounded-4 shadow-xs bg-white overflow-hidden mb-4">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr className="text-secondary small">
              <th className="ps-4">Record ID</th>
              <th>Patient</th>
              <th>Attending Physician</th>
              <th>Consultation Date</th>
              <th>Diagnosis & Visit Reason</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th className="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => {
              const isDraft = rec.status === 'Draft'
              const formattedId = `MR-${rec.id.toString().padStart(4, '0')}`

              return (
                <tr key={rec.id}>
                  {/* Record ID */}
                  <td className="ps-4">
                    <span className="badge font-monospace bg-light text-primary border px-2.5 py-1.5 fw-semibold">
                      #{formattedId}
                    </span>
                  </td>

                  {/* Patient Info */}
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{
                          width: '34px',
                          height: '34px',
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          fontSize: '0.8rem',
                        }}
                      >
                        {rec.patient_name ? rec.patient_name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-start fw-bold text-dark text-decoration-none hover-primary d-block"
                          onClick={() => onViewPatientHistory(rec.patient_id)}
                          style={{ fontSize: '0.86rem' }}
                        >
                          {rec.patient_name}
                        </button>
                        <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                          ID: #{rec.patient_id} {rec.patient_age ? `• ${rec.patient_age} yrs, ${rec.patient_gender}` : ''}
                        </small>
                      </div>
                    </div>
                  </td>

                  {/* Attending Doctor */}
                  <td>
                    <div className="d-flex align-items-center gap-1.5">
                      <Stethoscope size={14} className="text-primary flex-shrink-0" />
                      <span className="fw-semibold text-dark small">{rec.doctor_name}</span>
                    </div>
                    <small className="text-muted d-block ps-3.5" style={{ fontSize: '0.74rem' }}>
                      {rec.doctor_specialization || 'Clinical Specialist'}
                    </small>
                  </td>

                  {/* Consultation Date */}
                  <td>
                    <div className="fw-semibold text-dark small d-flex align-items-center gap-1">
                      <Calendar size={13} className="text-secondary" />
                      <span>{rec.consultation_date}</span>
                    </div>
                    <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.74rem' }}>
                      <Clock size={11} /> {rec.consultation_time || '10:00 AM'} • {rec.visit_type || 'In-Person'}
                    </small>
                  </td>

                  {/* Diagnosis */}
                  <td style={{ maxWidth: '240px' }}>
                    <div className="fw-bold text-dark small text-truncate" title={rec.diagnosis}>
                      {rec.diagnosis}
                    </div>
                    <small className="text-muted text-truncate d-block" style={{ fontSize: '0.74rem' }} title={rec.visit_reason}>
                      {rec.visit_reason || rec.symptoms || 'General clinical review'}
                    </small>
                  </td>

                  {/* Record Status */}
                  <td>
                    <span
                      className={`badge rounded-pill px-2.5 py-1.5 font-monospace small ${
                        isDraft
                          ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                          : 'bg-success-subtle text-success border border-success-subtle'
                      }`}
                    >
                      {isDraft ? 'Draft' : 'Finalized'}
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td>
                    <span className="small text-muted" style={{ fontSize: '0.76rem' }}>
                      {rec.updated_at ? rec.updated_at.split(' ')[0] : (rec.created_at ? rec.created_at.split(' ')[0] : 'Today')}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="text-end pe-4">
                    <div className="d-flex align-items-center justify-content-end gap-1.5">
                      {/* View Details */}
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm p-1.5 rounded-2"
                        title="View Medical Record"
                        onClick={() => onViewRecord(rec.id)}
                      >
                        <Eye size={15} />
                      </button>

                      {/* Edit Draft */}
                      {isDraft && (
                        <button
                          type="button"
                          className="btn btn-outline-warning btn-sm p-1.5 rounded-2"
                          title="Edit Draft Record"
                          onClick={() => onEditRecord(rec)}
                        >
                          <Edit3 size={15} />
                        </button>
                      )}

                      {/* Finalize Draft */}
                      {isDraft && (
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm p-1.5 rounded-2"
                          title="Finalize Draft Record"
                          onClick={() => onFinalizeRecord(rec.id)}
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}

                      {/* Patient History */}
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm p-1.5 rounded-2"
                        title="View Patient Consultation History"
                        onClick={() => onViewPatientHistory(rec.patient_id)}
                      >
                        <History size={15} />
                      </button>

                      {/* Print Record */}
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-sm p-1.5 rounded-2"
                        title="Print / Export Record"
                        onClick={() => onPrintRecord(rec)}
                      >
                        <Printer size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="card-footer bg-white border-top p-3 px-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <span className="small text-muted">
          Showing <strong className="text-dark">{startRecord}</strong> to <strong className="text-dark">{endRecord}</strong> of{' '}
          <strong className="text-dark">{totalRecords}</strong> records
        </span>

        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted me-2">
            Page {page} of {totalPages}
          </span>
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className="btn btn-outline-secondary px-2.5 py-1"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary px-2.5 py-1"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
