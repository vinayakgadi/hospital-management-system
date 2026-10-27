import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  User,
  Mail,
  Phone,
  Award,
  Stethoscope,
  Briefcase,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function DoctorProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualifications: '',
    experience_years: 10,
    biography: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_BASE_URL}/api/doctor/profile`)
      const doc = res.data.doctor || res.data || {}
      if (doc && doc.name) {
        setProfile({
          name: doc.name || '',
          email: doc.email || '',
          phone: doc.phone || '',
          specialization: doc.specialization || '',
          qualifications: doc.qualifications || '',
          experience_years: doc.experience_years || 10,
          biography: doc.biography || '',
        })
      }
    } catch (err) {
      console.error('Failed to load doctor profile:', err)
      setError(err.response?.data?.error || 'Failed to load doctor profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await axios.put(`${API_BASE_URL}/api/doctor/profile`, profile)
      showToast('Doctor credentials & clinical profile updated successfully!')
      fetchProfile()
    } catch (err) {
      console.error('Failed to save profile:', err)
      showToast(err.response?.data?.error || 'Failed to save profile updates.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-fluid p-0">
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
            <div>
              <strong className="d-block small">{toast.type === 'danger' ? 'Error' : 'Success'}</strong>
              <small>{toast.message}</small>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Physician Profile & Credentials</h1>
          <p className="text-muted small mb-0">
            Manage your clinical credentials, contact numbers, medical specialties, and public patient biography.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={fetchProfile}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 d-flex align-items-center gap-2 p-3 mb-4" role="alert">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-3" role="status">
            <span className="visually-hidden">Loading profile...</span>
          </div>
          <p className="text-muted small mb-0">Retrieving credentials...</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Profile Edit Form */}
          <div className="col-12 col-xl-8">
            <div className="card border-0 rounded-4 shadow-xs bg-white">
              <div className="card-header bg-white border-bottom p-4">
                <h6 className="fw-bold text-dark mb-1">Clinical Credentials & Information</h6>
                <small className="text-muted">Fields marked with * are required for medical registry</small>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Full Physician Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Medical Specialty *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.specialization}
                        onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Primary Email (Registered)</label>
                      <input
                        type="email"
                        className="form-control bg-light"
                        value={profile.email}
                        disabled
                      />
                      <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                        Linked to HealthPulse system user account.
                      </small>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Office / Mobile Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 555-0101"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-dark">Qualifications & Certifications</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. MD, FACC - Harvard Medical School"
                        value={profile.qualifications}
                        onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Experience (Years)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        className="form-control"
                        value={profile.experience_years}
                        onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Professional Biography</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Brief overview of clinical expertise, specialized treatments, and clinical background..."
                        value={profile.biography}
                        onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-light p-3 px-4 d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 rounded-3 d-flex align-items-center gap-1.5"
                    disabled={saving}
                  >
                    <Save size={15} />
                    <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Profile Preview Card */}
          <div className="col-12 col-xl-4">
            <div className="card border-0 rounded-4 shadow-xs bg-white text-center p-4">
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-3"
                style={{
                  width: '84px',
                  height: '84px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  fontSize: '2rem',
                }}
              >
                <Stethoscope size={40} />
              </div>

              <h5 className="fw-bold text-dark mb-1">{profile.name || 'Dr. Satya Deep'}</h5>
              <div className="badge bg-primary-subtle text-primary mb-3">
                {profile.specialization || 'Clinical Specialist'}
              </div>

              <div className="border-top border-bottom py-3 text-start small mb-3">
                <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                  <Mail size={15} className="text-primary flex-shrink-0" />
                  <span className="text-truncate">{profile.email}</span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                  <Phone size={15} className="text-primary flex-shrink-0" />
                  <span>{profile.phone || 'Not listed'}</span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                  <Award size={15} className="text-primary flex-shrink-0" />
                  <span>{profile.qualifications || 'Board Certified'}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <Briefcase size={15} className="text-primary flex-shrink-0" />
                  <span>{profile.experience_years} Years Experience</span>
                </div>
              </div>

              <p className="text-muted small text-start mb-0">
                {profile.biography || 'Senior clinical specialist in patient diagnosis and comprehensive care.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
