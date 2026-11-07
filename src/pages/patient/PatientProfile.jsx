import { useState, useEffect } from 'react'
import { patientService } from '../../services/patientService.js'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Stethoscope,
  ShieldCheck,
  Building,
} from 'lucide-react'

export default function PatientProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Form Fields
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [bloodGroup, setBloodGroup] = useState('O+')
  const [weight, setWeight] = useState('')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await patientService.getProfile()
      setProfile(data)
      setPhone(data.phone || '')
      setAddress(data.address || '')
      setEmergencyName(data.emergency_contact_name || '')
      setEmergencyPhone(data.emergency_contact_phone || '')
      setBloodGroup(data.blood_group || 'O+')
      setWeight(data.weight || '')
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError('Unable to load patient profile details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await patientService.updateProfile({
        phone: phone.trim(),
        address: address.trim(),
        emergency_contact_name: emergencyName.trim(),
        emergency_contact_phone: emergencyPhone.trim(),
        blood_group: bloodGroup,
        weight: weight.trim(),
      })
      setProfile(res.patient)
      showToast('Personal health profile updated successfully!')
    } catch (err) {
      console.error('Profile update failed:', err)
      showToast(err.response?.data?.error || 'Failed to update profile.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-2" role="status">
          <span className="visually-hidden">Loading patient profile...</span>
        </div>
        <p className="text-muted small">Loading personal health record...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger rounded-4 p-4 shadow-sm d-flex align-items-center gap-3">
        <AlertCircle size={24} className="text-danger flex-shrink-0" />
        <div className="flex-grow-1">
          <div className="fw-semibold">{error}</div>
          <button onClick={loadProfile} className="btn btn-outline-danger btn-sm rounded-3 mt-2">
            <RefreshCw size={13} className="me-1" /> Retry
          </button>
        </div>
      </div>
    )
  }

  const doctor = profile?.doctor || {}

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
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">My Health Profile & Demographics</h4>
        <p className="text-muted small mb-0">
          Manage your personal contact details, residential address, emergency contacts, and demographic parameters.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Profile Card & Primary Physician */}
        <div className="col-lg-4">
          {/* Identity Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-4">
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-3"
              style={{
                width: '74px',
                height: '74px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                fontSize: '1.8rem',
              }}
            >
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <h5 className="fw-bold text-dark mb-1">{profile?.name}</h5>
            <div className="text-muted small mb-2">{profile?.email}</div>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <span className="badge bg-success-subtle text-success small">Verified Patient</span>
              <span className="badge bg-light text-secondary border small">ID #{profile?.id}</span>
            </div>

            <div className="p-3 bg-light rounded-3 text-start small space-y-2 border">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Gender:</span>
                <span className="fw-semibold text-dark">{profile?.gender || 'Male'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Age:</span>
                <span className="fw-semibold text-dark">{profile?.age || '30'} yrs</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Date of Birth:</span>
                <span className="fw-semibold text-dark">{profile?.date_of_birth || '1992-06-15'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Blood Type:</span>
                <span className="badge bg-danger text-white">{profile?.blood_group || 'O+'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Primary Condition:</span>
                <span className="fw-semibold text-dark">{profile?.disease || 'General Care'}</span>
              </div>
            </div>
          </div>

          {/* Attending Primary Doctor Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex align-items-center gap-2.5 mb-3">
              <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                <Stethoscope size={18} />
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-0">Primary Care Provider</h6>
                <div className="text-muted small" style={{ fontSize: '0.74rem' }}>Assigned Hospital Clinician</div>
              </div>
            </div>

            <div className="p-3 bg-light rounded-3 mb-2 small space-y-1.5">
              <div className="fw-bold text-dark">Dr. {doctor.name || 'Satya Deep'}</div>
              <div className="text-primary fw-medium">{doctor.specialization || 'Cardiology & General Care'}</div>
              <div className="text-muted">HealthPulse Department of Medicine</div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Contact & Emergency Form */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white">
            <div className="card-header bg-white border-bottom p-4">
              <h5 className="fw-bold text-dark mb-0">Contact & Emergency Information</h5>
              <p className="text-muted small mb-0">
                Ensure your hospital contact details are always current for notifications and emergency services.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="card-body p-4 space-y-4">
                {/* Contact Information */}
                <div>
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <Phone size={16} className="text-primary" />
                    <span>Direct Patient Contact</span>
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder="+1 (555) 234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-secondary">Blood Group</label>
                      <select
                        className="form-select bg-light"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-secondary">Weight (kg)</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder="70"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Home Residential Address</label>
                      <textarea
                        className="form-control bg-light"
                        rows="2"
                        placeholder="Street address, City, State, ZIP code..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Emergency Contact */}
                <div>
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <Heart size={16} className="text-danger" />
                    <span>Emergency Contact Person</span>
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Emergency Contact Name</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder="e.g. Sarah Jenkins (Spouse / Guardian)"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Emergency Contact Phone</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder="+1 (555) 987-6543"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3 text-muted small d-flex align-items-center gap-2">
                  <ShieldCheck size={16} className="text-success flex-shrink-0" />
                  <span>
                    Clinical diagnoses and physician assignments can only be updated directly by your healthcare provider during official consultations.
                  </span>
                </div>
              </div>

              <div className="card-footer bg-light border-top p-3 text-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary rounded-3 px-4 py-2 small fw-medium shadow-xs d-inline-flex align-items-center gap-2"
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
