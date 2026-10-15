function DeleteConfirmModal({ patient, isOpen, onClose, onConfirm, isDeleting }) {
  if (!isOpen || !patient) return null

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-body p-4 text-center">
            <div className="mb-3">
              <span className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex fs-1">
                <i className="bi bi-trash3-fill"></i>
              </span>
            </div>
            <h5 className="fw-bold text-dark mb-2">Delete Patient Record</h5>
            <p className="text-muted small mb-3">
              Are you sure you want to permanently delete the health record for{' '}
              <strong className="text-dark">"{patient.name}"</strong>? This action cannot be undone.
            </p>

            <div className="p-3 bg-light rounded-3 text-start small mb-4 border">
              <div><strong>Condition:</strong> {patient.disease || 'General'}</div>
              <div><strong>Doctor:</strong> Dr. {patient.doctor?.name || 'Unassigned'}</div>
              <div><strong>Email:</strong> {patient.email}</div>
            </div>

            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 rounded-pill"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 rounded-pill d-flex align-items-center gap-2"
                onClick={() => onConfirm(patient)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3"></i>
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
