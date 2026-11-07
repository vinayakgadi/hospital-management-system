import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'
import { X, UserPlus, Mail, Lock, Phone, Stethoscope, Loader2, AlertCircle } from 'lucide-react'

export default function RegisterDoctorModal({ isOpen, onClose, onDoctorRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'doctor123',
    specialization: 'Cardiology',
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await axios.post(`${API_BASE_URL}/api/doctors`, formData)
      if (onDoctorRegistered) {
        onDoctorRegistered(res.data)
      }
      onClose()
      setFormData({
        name: '',
        email: '',
        password: 'doctor123',
        specialization: 'Cardiology',
        phone: '',
      })
    } catch (err) {
      console.error('Failed to register doctor:', err)
      setError(err.response?.data?.error || 'Failed to register physician. Check email uniqueness.')
    } finally {
      setSubmitting(false)
    }
  }

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
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 bg-primary bg-opacity-25 text-info">
                <UserPlus size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white">Register New Doctor</h5>
                <small className="text-white-50">Add credentialed physician to medical directory</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small rounded-3 py-2 px-3 mb-3">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Physician Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <UserPlus size={16} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    className="form-control"
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Official Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="form-control"
                    placeholder="e.g. dr.rajesh@healthpulse.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Specialization */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Specialization</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Stethoscope size={16} />
                  </span>
                  <select
                    name="specialization"
                    className="form-select"
                    value={formData.specialization}
                    onChange={handleChange}
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Surgery">General Surgery</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Dermatology">Dermatology</option>
                  </select>
                </div>
              </div>

              {/* Phone & Password Row */}
              <div className="row g-2">
                <div className="col-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <Phone size={16} />
                    </span>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      placeholder="555-0199"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Default Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <Lock size={16} />
                    </span>
                    <input
                      type="text"
                      name="password"
                      required
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light px-4 py-3">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 d-inline-flex align-items-center gap-2 fw-semibold"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Register Doctor</span>
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
