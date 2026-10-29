import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { patientService } from '../../services/patientService.js'
import {
  Calendar,
  Clock,
  User,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  Stethoscope,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react'

export default function PatientAppointments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'upcoming')
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState(null)

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState(searchParams.get('doctorId') || '')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('09:30 AM')
  const [bookingReason, setBookingReason] = useState('')
  const [submittingBooking, setSubmittingBooking] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  // Cancellation State
  const [cancellingId, setCancellingId] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await patientService.getAppointments({ tab: activeTab, search: searchTerm })
      setAppointments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load appointments:', err)
      setError('Unable to load appointments list.')
    } finally {
      setLoading(false)
    }
  }

  const loadDoctors = async () => {
    try {
      const docs = await patientService.getDoctors()
      setDoctors(Array.isArray(docs) ? docs : [])
      if (!selectedDoctorId && docs.length > 0) {
        setSelectedDoctorId(docs[0].id)
      }
    } catch (err) {
      console.warn('Failed to load doctors for booking:', err)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [activeTab, searchTerm])

  useEffect(() => {
    loadDoctors()
    // Auto-open modal if query param 'book' is present
    if (searchParams.get('book') === 'true') {
      setShowBookingModal(true)
    }
  }, [])

  const handleBookSubmit = async (e) => {
    e.preventDefault()
    setBookingError(null)

    if (!selectedDoctorId) {
      setBookingError('Please choose an attending doctor.')
      return
    }
    if (!bookingDate) {
      setBookingError('Please pick an appointment date.')
      return
    }

    setSubmittingBooking(true)
    try {
      await patientService.bookAppointment({
        doctor_id: parseInt(selectedDoctorId, 10),
        appointment_date: bookingDate,
        appointment_time: bookingTime,
        reason: bookingReason || 'General Medical Consultation',
      })
      showToast('Appointment booked successfully!')
      setShowBookingModal(false)
      setBookingReason('')
      setBookingDate('')
      loadAppointments()
    } catch (err) {
      console.error('Booking failed:', err)
      setBookingError(err.response?.data?.error || 'Failed to book appointment. Please try again.')
    } finally {
      setSubmittingBooking(false)
    }
  }

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled consultation?')) {
      return
    }

    setCancellingId(apptId)
    try {
      await patientService.cancelAppointment(apptId)
      showToast('Appointment successfully cancelled.')
      loadAppointments()
    } catch (err) {
      console.error('Cancellation failed:', err)
      showToast(err.response?.data?.error || 'Failed to cancel appointment.', 'danger')
    } finally {
      setCancellingId(null)
    }
  }

  // Calculate today's date formatted as YYYY-MM-DD for min date picker
  const todayStr = new Date().toISOString().split('T')[0]

  const timeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
  ]

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <span className="badge bg-info-subtle text-info px-2.5 py-1 rounded-pill">Confirmed</span>
      case 'completed':
        return <span className="badge bg-success-subtle text-success px-2.5 py-1 rounded-pill">Completed</span>
      case 'cancelled':
        return <span className="badge bg-danger-subtle text-danger px-2.5 py-1 rounded-pill">Cancelled</span>
      default:
        return <span className="badge bg-primary-subtle text-primary px-2.5 py-1 rounded-pill">Scheduled</span>
    }
  }

  return (
    <div>
      {/* Toast Alert */}
      {toast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1099 }}>
          <div
            className={`alert alert-${toast.type === 'danger' ? 'danger' : 'success'} shadow-lg border-0 d-flex align-items-center gap-2 rounded-4 px-4 py-3`}
            role="alert"
          >
            {toast.type === 'danger' ? (
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
            ) : (
              <CheckCircle2 size={20} className="text-success flex-shrink-0" />
            )}
            <span className="small fw-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">My Medical Appointments</h4>
          <p className="text-muted small mb-0">
            View upcoming doctor consultations, schedule new clinic appointments, and manage booking history.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setBookingError(null)
            setShowBookingModal(true)
          }}
          className="btn btn-primary d-inline-flex align-items-center gap-2 px-3.5 py-2 rounded-3 fw-medium shadow-xs"
          style={{ background: '#0284c7', borderColor: '#0284c7' }}
        >
          <PlusCircle size={18} />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            {/* Tabs */}
            <div className="nav nav-pills gap-1">
              <button
                type="button"
                className={`nav-link rounded-3 px-3.5 py-1.5 small fw-medium ${
                  activeTab === 'upcoming' ? 'active bg-primary' : 'text-secondary bg-light'
                }`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Visits
              </button>
              <button
                type="button"
                className={`nav-link rounded-3 px-3.5 py-1.5 small fw-medium ${
                  activeTab === 'past' ? 'active bg-primary' : 'text-secondary bg-light'
                }`}
                onClick={() => setActiveTab('past')}
              >
                Past Encounters
              </button>
              <button
                type="button"
                className={`nav-link rounded-3 px-3.5 py-1.5 small fw-medium ${
                  activeTab === 'all' ? 'active bg-primary' : 'text-secondary bg-light'
                }`}
                onClick={() => setActiveTab('all')}
              >
                All Records
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
                placeholder="Search by physician or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Loading appointments...</span>
          </div>
          <p className="text-muted small">Loading appointment records...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 p-4 shadow-sm d-flex align-items-center gap-3">
          <AlertCircle size={24} className="text-danger flex-shrink-0" />
          <div className="flex-grow-1">
            <div className="fw-semibold">{error}</div>
            <button onClick={loadAppointments} className="btn btn-outline-danger btn-sm rounded-3 mt-2">
              <RefreshCw size={13} className="me-1" /> Try Again
            </button>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <Calendar size={44} className="text-muted opacity-50 mx-auto mb-3" />
          <h6 className="fw-bold text-dark mb-1">No appointments found</h6>
          <p className="text-muted small mb-3">
            {searchTerm
              ? `No appointments matching "${searchTerm}".`
              : activeTab === 'upcoming'
              ? 'You do not have any upcoming visits scheduled.'
              : 'No appointments in this category.'}
          </p>
          <button
            type="button"
            onClick={() => setShowBookingModal(true)}
            className="btn btn-primary btn-sm rounded-3 px-3 mx-auto d-inline-flex align-items-center gap-1.5"
          >
            <PlusCircle size={15} />
            <span>Schedule Now</span>
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {appointments.map((appt) => {
            const isUpcoming = appt.status !== 'Cancelled' && appt.status !== 'Completed'
            return (
              <div key={appt.id} className="col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2.5">
                      <div
                        className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: '42px',
                          height: '42px',
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        }}
                      >
                        <Stethoscope size={20} />
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-0">Dr. {appt.doctor_name}</h6>
                        <span className="text-muted small">{appt.doctor_specialization}</span>
                      </div>
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>

                  {/* Visit Details */}
                  <div className="p-3 bg-light rounded-3 mb-3">
                    <div className="fw-semibold text-dark small mb-1">{appt.reason || 'General Medical Consultation'}</div>
                    <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small" style={{ fontSize: '0.8rem' }}>
                      <span className="d-flex align-items-center gap-1.5">
                        <Calendar size={14} className="text-primary" />
                        <span>{appt.appointment_date}</span>
                      </span>
                      <span className="d-flex align-items-center gap-1.5">
                        <Clock size={14} className="text-primary" />
                        <span>{appt.appointment_time}</span>
                      </span>
                    </div>
                  </div>

                  {/* Doctor Contact & Action Footer */}
                  <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                    <div className="d-flex align-items-center gap-3 text-muted small" style={{ fontSize: '0.78rem' }}>
                      {appt.doctor_phone && (
                        <span className="d-flex align-items-center gap-1">
                          <Phone size={13} />
                          <span>{appt.doctor_phone}</span>
                        </span>
                      )}
                    </div>
                    {isUpcoming && (
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(appt.id)}
                        disabled={cancellingId === appt.id}
                        className="btn btn-outline-danger btn-sm rounded-3 px-3 py-1 text-danger small"
                      >
                        {cancellingId === appt.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookingModal && (
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
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Schedule Consultation</h5>
                    <p className="text-muted small mb-0">Book an appointment with a HealthPulse specialist</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowBookingModal(false)}
                  aria-label="Close"
                />
              </div>

              <form onSubmit={handleBookSubmit}>
                <div className="modal-body p-4 space-y-3">
                  {bookingError && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 small rounded-3 p-3 mb-3">
                      <AlertCircle size={18} className="text-danger flex-shrink-0" />
                      <div>{bookingError}</div>
                    </div>
                  )}

                  {/* Doctor Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Select Healthcare Specialist <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select bg-light"
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          Dr. {doc.name} — {doc.specialization} ({doc.phone || 'General Clinic'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    {/* Date Picker */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Consultation Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control bg-light"
                        min={todayStr}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                      />
                    </div>

                    {/* Time Slot Picker */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Preferred Time Slot <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select bg-light"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        required
                      >
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Reason for Appointment */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Reason for Consultation / Symptoms
                    </label>
                    <textarea
                      className="form-control bg-light"
                      rows="3"
                      placeholder="Briefly describe what you would like to consult the physician regarding (e.g. routine checkup, persistent cough, follow-up on medication)..."
                      value={bookingReason}
                      onChange={(e) => setBookingReason(e.target.value)}
                      required
                    />
                  </div>

                  <div className="p-3 bg-light rounded-3 text-muted small d-flex align-items-center gap-2">
                    <Clock size={16} className="text-primary flex-shrink-0" />
                    <span>
                      Standard consultation duration is 30 minutes. Notifications will be delivered once the booking is registered.
                    </span>
                  </div>
                </div>

                <div className="modal-footer border-top p-3 bg-light">
                  <button
                    type="button"
                    className="btn btn-light rounded-3 px-3 py-2 small"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBooking}
                    className="btn btn-primary rounded-3 px-4 py-2 small fw-medium shadow-xs"
                    style={{ background: '#0284c7', borderColor: '#0284c7' }}
                  >
                    {submittingBooking ? 'Scheduling...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
