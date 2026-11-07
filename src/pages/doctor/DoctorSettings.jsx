import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ShieldCheck,
  Key,
  Bell,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function DoctorSettings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submittingPassword, setSubmittingPassword] = useState(false)
  const [toast, setToast] = useState(null)

  // Notification Preferences
  const [preferences, setPreferences] = useState({
    appointment_alerts: true,
    patient_assignment: true,
    prescription_confirmations: true,
    email_summaries: false,
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!passwordForm.current_password || !passwordForm.new_password) {
      showToast('All password fields are required.', 'danger')
      return
    }
    if (passwordForm.new_password.length < 6) {
      showToast('New password must be at least 6 characters.', 'danger')
      return
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('New password and confirmation do not match.', 'danger')
      return
    }

    try {
      setSubmittingPassword(true)
      await axios.post(`${API_BASE_URL}/api/doctor/change-password`, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      showToast('Password updated successfully! Please use your new password next time.')
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (err) {
      console.error('Failed to change password:', err)
      showToast(err.response?.data?.error || 'Failed to update password.', 'danger')
    } finally {
      setSubmittingPassword(false)
    }
  }

  const handleTogglePref = (key) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      showToast(`Notification setting updated: ${key.replace('_', ' ')}`)
      return next
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
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
      <div className="mb-4">
        <h1 className="h4 fw-bold text-dark mb-1">Account & Security Settings</h1>
        <p className="text-muted small mb-0">
          Manage your physician account authentication, password credentials, and system notification preferences.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Change Password */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 rounded-4 shadow-xs bg-white mb-4">
            <div className="card-header bg-white border-bottom p-4 d-flex align-items-center gap-2">
              <Key size={18} className="text-primary" />
              <h6 className="fw-bold text-dark mb-0">Change Account Password</h6>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Current Password *</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter existing password"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, current_password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">New Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new_password: e.target.value })
                    }
                    required
                  />
                  <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                    Password must be at least 6 characters and include letters & numbers.
                  </small>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-dark">Confirm New Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Re-type new password"
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-4 rounded-3 d-flex align-items-center gap-1.5"
                  disabled={submittingPassword}
                >
                  <Lock size={15} />
                  <span>{submittingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-header bg-white border-bottom p-4 d-flex align-items-center gap-2">
              <Bell size={18} className="text-primary" />
              <h6 className="fw-bold text-dark mb-0">Clinical Notification Preferences</h6>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border">
                  <div>
                    <strong className="d-block small text-dark">Appointment Alerts</strong>
                    <small className="text-muted">Receive alerts when appointments are booked or cancelled</small>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={preferences.appointment_alerts}
                      onChange={() => handleTogglePref('appointment_alerts')}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border">
                  <div>
                    <strong className="d-block small text-dark">Patient Assignment Notifications</strong>
                    <small className="text-muted">Get notified when a new patient is assigned to your care</small>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={preferences.patient_assignment}
                      onChange={() => handleTogglePref('patient_assignment')}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border">
                  <div>
                    <strong className="d-block small text-dark">Prescription Dispatches</strong>
                    <small className="text-muted">Confirmations when pharmacy receives authorized prescriptions</small>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={preferences.prescription_confirmations}
                      onChange={() => handleTogglePref('prescription_confirmations')}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border">
                  <div>
                    <strong className="d-block small text-dark">Weekly Activity Digest</strong>
                    <small className="text-muted">Send weekly summary of patient consults and appointments to email</small>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={preferences.email_summaries}
                      onChange={() => handleTogglePref('email_summaries')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Session & Security Info */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 rounded-4 shadow-xs bg-white mb-4">
            <div className="card-header bg-white border-bottom p-4 d-flex align-items-center gap-2">
              <ShieldCheck size={18} className="text-success" />
              <h6 className="fw-bold text-dark mb-0">Active Session Security</h6>
            </div>
            <div className="card-body p-4">
              <div className="list-group list-group-flush mb-4 small">
                <div className="list-group-item d-flex justify-content-between px-0 py-2.5">
                  <span className="text-muted">Authenticated User:</span>
                  <strong className="text-dark">{user?.name || 'Dr. Satya Deep'}</strong>
                </div>
                <div className="list-group-item d-flex justify-content-between px-0 py-2.5">
                  <span className="text-muted">System Role:</span>
                  <span className="badge bg-primary-subtle text-primary">doctor</span>
                </div>
                <div className="list-group-item d-flex justify-content-between px-0 py-2.5">
                  <span className="text-muted">Access Control:</span>
                  <span className="text-success fw-medium">Role-Based Access (RBAC)</span>
                </div>
                <div className="list-group-item d-flex justify-content-between px-0 py-2.5">
                  <span className="text-muted">Session Token:</span>
                  <span className="font-monospace text-muted">Bearer ••••••••</span>
                </div>
                <div className="list-group-item d-flex justify-content-between px-0 py-2.5">
                  <span className="text-muted">Status:</span>
                  <span className="badge bg-success-subtle text-success">Active & Verified</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign Out of Doctor Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
