import { X, User, HeartPulse, Stethoscope, Mail, Calendar, Weight, Activity } from 'lucide-react'

export default function PatientDetailsModal({ patient, isOpen, onClose, onEdit }) {
  if (!isOpen || !patient) return null

  const isFemale = (patient.gender || '').toLowerCase() === 'female'

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div
            className="modal-header text-white p-4"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 text-white fw-bold d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  background: isFemale
                    ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
                    : 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                  fontSize: '1.2rem',
                }}
              >
                {(patient.name || 'P').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white">{patient.name}</h5>
                <span className="badge bg-light text-dark small mt-1">Patient #{patient.id}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body p-4">
            {/* Condition Banner */}
            <div className="p-3 bg-light rounded-3 mb-4 d-flex align-items-center justify-content-between border">
              <div className="d-flex align-items-center gap-2">
                <Activity size={20} className="text-primary" />
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                    Primary Medical Condition
                  </small>
                  <strong className="text-dark">{patient.disease || 'General Evaluation'}</strong>
                </div>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill">
                Active Chart
              </span>
            </div>

            {/* Vitals Grid */}
            <div className="row g-3 mb-4">
              <div className="col-4">
                <div className="p-3 bg-light rounded-3 text-center border">
                  <small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Age</small>
                  <strong className="fs-5 text-dark">{patient.age || '—'} yrs</strong>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3 bg-light rounded-3 text-center border">
                  <small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Weight</small>
                  <strong className="fs-5 text-dark">{patient.weight || '—'} kg</strong>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3 bg-light rounded-3 text-center border">
                  <small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Gender</small>
                  <strong className="fs-5 text-dark text-capitalize">{patient.gender || '—'}</strong>
                </div>
              </div>
            </div>

            {/* Contact & Registration info */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                Contact & Account
              </h6>
              <div className="d-flex align-items-center gap-2 text-secondary small mb-2">
                <Mail size={16} className="text-muted" />
                <span>{patient.email}</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary small">
                <Calendar size={16} className="text-muted" />
                <span>
                  Registered on:{' '}
                  {patient.created_at
                    ? new Date(patient.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Standard system record'}
                </span>
              </div>
            </div>

            {/* Attending Doctor */}
            <div className="p-3 rounded-3 border" style={{ backgroundColor: '#f8fafc' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-circle bg-sky-100 text-sky-700" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                  <Stethoscope size={22} />
                </div>
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                    Attending Physician
                  </small>
                  <span className="fw-bold text-dark">
                    Dr. {patient.doctor?.name || patient.doctor_name || 'Unassigned'}
                  </span>
                  <span className="text-muted small d-block">
                    {patient.doctor?.specialization || patient.doctor_specialization || 'General Care'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light px-4 py-3">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                className="btn btn-primary rounded-pill px-4"
                onClick={() => {
                  onClose()
                  onEdit(patient)
                }}
              >
                Edit Patient Record
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
