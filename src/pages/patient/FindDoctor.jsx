import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { patientService } from '../../services/patientService.js'
import {
  Search,
  Stethoscope,
  Phone,
  Mail,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  UserCheck,
  Building,
} from 'lucide-react'

export default function FindDoctor() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')
  const [viewDoctor, setViewDoctor] = useState(null)

  const specialties = [
    'All',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'General Medicine',
    'General Care',
    'Internal Medicine',
  ]

  const loadDoctors = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await patientService.getDoctors({
        search: searchTerm,
        specialization: selectedSpecialty !== 'All' ? selectedSpecialty : '',
      })
      setDoctors(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load doctors:', err)
      setError('Unable to load doctors registry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [selectedSpecialty, searchTerm])

  const handleBookWithDoctor = (doctorId) => {
    navigate(`/patient/appointments?book=true&doctorId=${doctorId}`)
  }

  return (
    <div>
      {/* Header Bar */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Find a Doctor & Clinical Specialist</h4>
        <p className="text-muted small mb-0">
          Browse verified HealthPulse medical staff, view physician credentials, and schedule your appointment.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-body p-3 p-lg-4">
          {/* Search Bar */}
          <div className="position-relative mb-3">
            <Search
              size={18}
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
            />
            <input
              type="text"
              className="form-control bg-light border-0 ps-5 rounded-3 py-2.5 text-secondary"
              placeholder="Search by doctor name, specialty, or qualifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Specialty Pills */}
          <div className="d-flex flex-wrap gap-1.5">
            {specialties.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpecialty(spec)}
                className={`btn btn-sm rounded-pill px-3 py-1 fw-medium transition-all ${
                  selectedSpecialty === spec
                    ? 'btn-primary shadow-xs'
                    : 'btn-light text-secondary border'
                }`}
                style={{ fontSize: '0.8rem' }}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Loading doctors...</span>
          </div>
          <p className="text-muted small">Loading healthcare providers...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 p-4 shadow-sm">
          <div className="fw-semibold">{error}</div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <Stethoscope size={44} className="text-muted opacity-50 mx-auto mb-3" />
          <h6 className="fw-bold text-dark mb-1">No healthcare providers found</h6>
          <p className="text-muted small mb-0">
            Try adjusting your search criteria or selecting a different clinical specialization.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {doctors.map((doc) => (
            <div key={doc.id} className="col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{
                        width: '52px',
                        height: '52px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        fontSize: '1.1rem',
                      }}
                    >
                      <Stethoscope size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <h6 className="fw-bold text-dark mb-1 text-truncate">Dr. {doc.name}</h6>
                      <span className="badge bg-primary-subtle text-primary small mb-1">
                        {doc.specialization}
                      </span>
                      <div className="text-muted small text-truncate" style={{ fontSize: '0.78rem' }}>
                        {doc.qualifications || 'MD - Board Certified'}
                      </div>
                    </div>
                  </div>

                  <p className="text-secondary small mb-3 line-clamp-3" style={{ fontSize: '0.82rem', minHeight: '3.6rem' }}>
                    {doc.biography || 'Specialist dedicated to comprehensive clinical evaluations and personalized treatment strategies.'}
                  </p>

                  <div className="p-2.5 bg-light rounded-3 small space-y-1 mb-3" style={{ fontSize: '0.78rem' }}>
                    <div className="d-flex align-items-center gap-2 text-muted">
                      <Clock size={13} className="text-primary flex-shrink-0" />
                      <span>{doc.experience_years ? `${doc.experience_years} years clinical practice` : '10+ years experience'}</span>
                    </div>
                    {doc.phone && (
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <Phone size={13} className="text-primary flex-shrink-0" />
                        <span>{doc.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex align-items-center gap-2 pt-2 border-top">
                  <button
                    type="button"
                    onClick={() => setViewDoctor(doc)}
                    className="btn btn-outline-secondary btn-sm flex-grow-1 rounded-3 py-1.5"
                    style={{ fontSize: '0.8rem' }}
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBookWithDoctor(doc.id)}
                    className="btn btn-primary btn-sm flex-grow-1 rounded-3 py-1.5 fw-medium d-inline-flex align-items-center justify-content-center gap-1 shadow-xs"
                    style={{ fontSize: '0.8rem', background: '#0284c7', borderColor: '#0284c7' }}
                  >
                    <Calendar size={14} />
                    <span>Book Visit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Profile Modal */}
      {viewDoctor && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom p-4 bg-light">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    }}
                  >
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Dr. {viewDoctor.name}</h5>
                    <span className="badge bg-primary-subtle text-primary small">
                      {viewDoctor.specialization}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewDoctor(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body p-4 space-y-4">
                {/* Credentials & Details */}
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded-3">
                      <div className="text-muted small fw-medium mb-1">Academic Credentials</div>
                      <div className="fw-semibold text-dark small">{viewDoctor.qualifications || 'MD, Medical Board Certified'}</div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded-3">
                      <div className="text-muted small fw-medium mb-1">Clinical Practice</div>
                      <div className="fw-semibold text-dark small">{viewDoctor.experience_years || 12} Years in Service</div>
                    </div>
                  </div>
                </div>

                {/* Biography */}
                <div>
                  <h6 className="fw-bold text-dark mb-2">Physician Overview</h6>
                  <p className="text-secondary small leading-relaxed">
                    {viewDoctor.biography || 'Specialist dedicated to comprehensive patient care, proactive disease management, and evidenced-based medical treatment strategies.'}
                  </p>
                </div>

                {/* Contact Information */}
                <div>
                  <h6 className="fw-bold text-dark mb-2">Contact & Clinic Location</h6>
                  <div className="p-3 bg-light rounded-3 small space-y-2">
                    <div className="d-flex align-items-center gap-2 text-secondary">
                      <Building size={14} className="text-primary" />
                      <span>HealthPulse Medical Center • Main Clinical Wing</span>
                    </div>
                    {viewDoctor.phone && (
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <Phone size={14} className="text-primary" />
                        <span>{viewDoctor.phone}</span>
                      </div>
                    )}
                    {viewDoctor.email && (
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <Mail size={14} className="text-primary" />
                        <span>{viewDoctor.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top p-3 bg-light">
                <button
                  type="button"
                  className="btn btn-light rounded-3 px-3 py-2 small"
                  onClick={() => setViewDoctor(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = viewDoctor.id
                    setViewDoctor(null)
                    handleBookWithDoctor(id)
                  }}
                  className="btn btn-primary rounded-3 px-4 py-2 small fw-medium shadow-xs d-inline-flex align-items-center gap-1.5"
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                >
                  <Calendar size={15} />
                  <span>Book Appointment with Dr. {viewDoctor.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
