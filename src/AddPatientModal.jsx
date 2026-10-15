import { useState } from 'react'
import axios from 'axios'

function AddPatientModal({ isOpen, onClose, onPatientAdded }) {
  const initialForm = {
    name: '',
    email: '',
    age: '',
    weight: '',
    gender: 'Male',
    disease: '',
    doctorName: '',
    doctorSpecialization: '',
  }

  const [formData, setFormData] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.disease.trim() ||
      !formData.doctorName.trim()
    ) {
      setFormError('Please fill in all required fields (*).')
      return
    }

    const newPatient = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      age: formData.age ? String(formData.age) : '25',
      weight: formData.weight ? String(formData.weight) : '70',
      gender: formData.gender,
      disease: formData.disease.trim(),
      doctor: {
        name: formData.doctorName.trim(),
        specialization: formData.doctorSpecialization.trim() || 'General Care',
      },
      id: Date.now(), // fallback ID for client keying
    }

    setSubmitting(true)
    try {
      await axios.post('https://doc-back.onrender.com/patients', newPatient)
      onPatientAdded(newPatient)
      setFormData(initialForm)
      onClose()
    } catch (err) {
      console.error('Failed to save patient:', err)
      // Add locally anyway so the user gets instant feedback even if API acts up
      onPatientAdded(newPatient)
      setFormData(initialForm)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1055 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          {/* Modal Header */}
          <div className="modal-header bg-dark text-white p-4" style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
            <div className="d-flex align-items-center gap-2">
              <span className="p-2 bg-primary bg-opacity-25 rounded-3 d-inline-flex text-info fs-5">
                <i className="bi bi-person-plus-fill text-info"></i>
              </span>
              <div>
                <h5 className="modal-title fw-bold mb-0">Register New Patient</h5>
                <small className="text-white-50">Create and link a new patient health record</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {formError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-4" role="alert">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span className="small">{formError}</span>
                </div>
              )}

              {/* Patient Basic Info */}
              <h6 className="fw-bold text-secondary text-uppercase small tracking-wide mb-3">
                <i className="bi bi-person-vcard me-2"></i>Patient Information
              </h6>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="form-control"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="form-control"
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label small fw-semibold text-dark">
                    Age (yrs) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="120"
                    required
                    className="form-control"
                    placeholder="e.g. 32"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label small fw-semibold text-dark">
                    Weight (kg) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    step="0.5"
                    min="1"
                    max="300"
                    required
                    className="form-control"
                    placeholder="e.g. 72"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-dark">Gender</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Medical & Doctor Info */}
              <h6 className="fw-bold text-secondary text-uppercase small tracking-wide mb-3">
                <i className="bi bi-heart-pulse me-2"></i>Medical & Care Assignment
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-dark">
                    Condition / Disease <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="disease"
                    required
                    className="form-control"
                    placeholder="e.g. Cardiology, Bones, Migraine"
                    value={formData.disease}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-dark">
                    Doctor Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    required
                    className="form-control"
                    placeholder="e.g. Dr. Sarah Connor"
                    value={formData.doctorName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-dark">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="doctorSpecialization"
                    className="form-control"
                    placeholder="e.g. Orthopedics, Neurology"
                    value={formData.doctorSpecialization}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer bg-light px-4 py-3" style={{ borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
              <button
                type="button"
                className="btn btn-outline-secondary px-4 rounded-pill"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 rounded-pill d-flex align-items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Saving Record...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Create Patient Card</span>
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

export default AddPatientModal
