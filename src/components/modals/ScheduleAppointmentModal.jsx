import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'
import { Calendar, User, Stethoscope, Clock, FileText, Loader2, AlertCircle } from 'lucide-react'

export default function ScheduleAppointmentModal({
  isOpen,
  onClose,
  onAppointmentScheduled,
  patients = [],
  doctors = [],
}) {
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:00 AM',
    reason: 'Routine Medical Consultation',
  })
  const [availablePatients, setAvailablePatients] = useState(patients)
  const [availableDoctors, setAvailableDoctors] = useState(doctors)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      if (patients.length === 0) {
        axios.get(`${API_BASE_URL}/patients`).then((res) => {
          setAvailablePatients(Array.isArray(res.data) ? res.data : [])
        })
      } else {
        setAvailablePatients(patients)
      }

      if (doctors.length === 0) {
        axios.get(`${API_BASE_URL}/api/doctors`).then((res) => {
          setAvailableDoctors(Array.isArray(res.data) ? res.data : [])
        })
      } else {
        setAvailableDoctors(doctors)
      }
    }
  }, [isOpen, patients, doctors])

  useEffect(() => {
    if (availablePatients.length > 0 && !formData.patient_id) {
      setFormData((prev) => ({ ...prev, patient_id: availablePatients[0].id }))
    }
    if (availableDoctors.length > 0 && !formData.doctor_id) {
      setFormData((prev) => ({ ...prev, doctor_id: availableDoctors[0].id }))
    }
  }, [availablePatients, availableDoctors])

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const payload = {
        patient_id: Number(formData.patient_id),
        doctor_id: Number(formData.doctor_id),
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        reason: formData.reason,
      }
      const res = await axios.post(`${API_BASE_URL}/api/appointments`, payload)
      if (onAppointmentScheduled) {
        onAppointmentScheduled(res.data)
      }
      onClose()
    } catch (err) {
      console.error('Failed to schedule appointment:', err)
      setError(err.response?.data?.error || 'Failed to schedule appointment.')
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
              <div className="p-2 rounded-3 bg-purple bg-opacity-25 text-white" style={{ backgroundColor: '#8b5cf6' }}>
                <Calendar size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white">Schedule Appointment</h5>
                <small className="text-white-50">Book a medical consultation session</small>
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

              {/* Patient Selection */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Select Patient</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <User size={16} />
                  </span>
                  <select
                    name="patient_id"
                    required
                    className="form-select"
                    value={formData.patient_id}
                    onChange={handleChange}
                  >
                    {availablePatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.disease || 'General'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor Selection */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Attending Physician</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Stethoscope size={16} />
                  </span>
                  <select
                    name="doctor_id"
                    required
                    className="form-select"
                    value={formData.doctor_id}
                    onChange={handleChange}
                  >
                    {availableDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Date</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <Calendar size={16} />
                    </span>
                    <input
                      type="date"
                      name="appointment_date"
                      required
                      className="form-control"
                      value={formData.appointment_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Time Slot</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <Clock size={16} />
                    </span>
                    <select
                      name="appointment_time"
                      className="form-select"
                      value={formData.appointment_time}
                      onChange={handleChange}
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary">Clinical Reason</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <FileText size={16} />
                  </span>
                  <input
                    type="text"
                    name="reason"
                    className="form-control"
                    placeholder="e.g. Follow-up consultation, ECG Review"
                    value={formData.reason}
                    onChange={handleChange}
                  />
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
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    <span>Confirm Booking</span>
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
