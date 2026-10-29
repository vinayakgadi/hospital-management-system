import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { patientService } from '../../services/patientService.js'
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Bell,
  Smartphone,
  FileCheck,
  Info,
} from 'lucide-react'

export default function PatientSettings() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [formError, setFormError] = useState(null)

  // Notification Preferences (local state)
  const [prefAppts, setPrefAppts] = useState(true)
  const [prefLabs, setPrefLabs] = useState(true)
  const [prefPresc, setPrefPresc] = useState(true)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (newPassword.length < 6) {
      setFormError('New password must contain at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setFormError('The new passwords entered do not match.')
      return
    }

    setLoading(true)
    try {
      await patientService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      showToast('Account password successfully updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Password change error:', err)
      setFormError(err.response?.data?.error || 'Failed to change password. Please verify current password.')
    } finally {
      setLoading(false)
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
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Privacy, Security & Account Settings</h4>
        <p className="text-muted small mb-0">
          Manage your portal credentials, session authentication, and notification preferences.
        </p>
      </div>

      <div className="row g-4">
        {/* Change Password Card */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
            <div className="card-header bg-white border-bottom p-4">
              <div className="d-flex align-items-center gap-2.5">
                <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0">Change Account Password</h5>
                  <p className="text-muted small mb-0">Update your patient login credentials</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="card-body p-4 space-y-3">
                {formError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 small rounded-3 p-3 mb-3">
                    <AlertCircle size={18} className="text-danger flex-shrink-0" />
                    <div>{formError}</div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Current Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-control bg-light border-start-0"
                      placeholder="Enter existing password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-control bg-light border-start-0"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Confirm New Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-control bg-light border-start-0"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showPassToggle"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                  />
                  <label className="form-check-label small text-secondary" htmlFor="showPassToggle">
                    Show passwords in plain text
                  </label>
                </div>
              </div>

              <div className="card-footer bg-light border-top p-3 text-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary rounded-3 px-4 py-2 small fw-medium shadow-xs"
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="card border-0 shadow-sm rounded-4 bg-white">
            <div className="card-header bg-white border-bottom p-4">
              <div className="d-flex align-items-center gap-2.5">
                <div className="p-2 bg-success bg-opacity-10 text-success rounded-3">
                  <Bell size={20} />
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0">Notification Preferences</h5>
                  <p className="text-muted small mb-0">Control patient communication channels</p>
                </div>
              </div>
            </div>

            <div className="card-body p-4 space-y-3">
              <div className="form-check form-switch d-flex align-items-center justify-content-between p-0 mb-3">
                <div>
                  <div className="fw-semibold text-dark small">Appointment Reminders</div>
                  <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
                    Receive notification updates prior to scheduled physician visits
                  </div>
                </div>
                <input
                  className="form-check-input ms-0"
                  type="checkbox"
                  checked={prefAppts}
                  onChange={(e) => setPrefAppts(e.target.checked)}
                />
              </div>

              <div className="form-check form-switch d-flex align-items-center justify-content-between p-0 mb-3">
                <div>
                  <div className="fw-semibold text-dark small">Diagnostic Lab Results</div>
                  <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
                    Alert me immediately when pathology results are verified and published
                  </div>
                </div>
                <input
                  className="form-check-input ms-0"
                  type="checkbox"
                  checked={prefLabs}
                  onChange={(e) => setPrefLabs(e.target.checked)}
                />
              </div>

              <div className="form-check form-switch d-flex align-items-center justify-content-between p-0">
                <div>
                  <div className="fw-semibold text-dark small">Prescription & Medication Updates</div>
                  <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
                    Notify me when a physician creates or updates my prescription regimen
                  </div>
                </div>
                <input
                  className="form-check-input ms-0"
                  type="checkbox"
                  checked={prefPresc}
                  onChange={(e) => setPrefPresc(e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security Information & Privacy Notice */}
        <div className="col-lg-5">
          {/* Active Session & Auth Security */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <div className="d-flex align-items-center gap-2.5 mb-3">
              <div className="p-2 bg-info bg-opacity-10 text-info rounded-3">
                <ShieldCheck size={20} />
              </div>
              <h6 className="fw-bold text-dark mb-0">Security & Portal Authentication</h6>
            </div>

            <div className="p-3 bg-light rounded-3 small space-y-2 mb-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Account Type:</span>
                <span className="fw-semibold text-dark">Verified Patient</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Authentication Protocol:</span>
                <span className="fw-semibold text-dark">Bearer Token (JWT/Session)</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Database Engine:</span>
                <span className="badge bg-primary-subtle text-primary">PostgreSQL Neon Active</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">IDOR Protection:</span>
                <span className="badge bg-success-subtle text-success">Server-Side Enforced</span>
              </div>
            </div>
            <p className="text-muted small mb-0" style={{ fontSize: '0.76rem' }}>
              Your session identity is cryptographically linked to your verified record. Patient endpoints reject unauthorized access attempts.
            </p>
          </div>

          {/* HIPAA & Patient Privacy Rights */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex align-items-center gap-2.5 mb-3">
              <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                <FileCheck size={20} />
              </div>
              <h6 className="fw-bold text-dark mb-0">Health Information Privacy (HIPAA)</h6>
            </div>

            <div className="small text-secondary space-y-2 mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
              <p className="mb-2">
                Under the Health Insurance Portability and Accountability Act (HIPAA) and patient privacy regulations:
              </p>
              <ul className="ps-3 mb-2 space-y-1">
                <li>You have the right to inspect and obtain copies of your finalized medical records.</li>
                <li>You may request formal amendments to inaccurate clinical information via the Medical Records module.</li>
                <li>Your health information is encrypted and accessible solely to authorized care personnel.</li>
              </ul>
              <div className="p-2.5 bg-light rounded-3 text-muted" style={{ fontSize: '0.74rem' }}>
                HealthPulse Medical Compliance Officer • compliance@healthpulse.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
