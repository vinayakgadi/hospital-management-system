import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Loader2,
  HeartPulse,
} from 'lucide-react'

export default function DoctorLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState(null)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both your clinical email and password.')
      return
    }

    const res = await login(email, password, 'doctor')
    if (res.success) {
      navigate('/doctor/dashboard', { replace: true })
    } else {
      setFormError(res.error || 'Authentication failed. Please verify doctor credentials.')
    }
  }

  const handleFillDemo = () => {
    setEmail('dr.satyadeep@healthpulse.com')
    setPassword('doctor123')
    setFormError(null)
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3"
      style={{
        background: 'radial-gradient(circle at top, #0c4a6e 0%, #082f49 100%)',
      }}
    >
      <div className="w-100" style={{ maxWidth: '440px' }}>
        {/* Back Link to Hub */}
        <div className="mb-4">
          <Link
            to="/login"
            className="text-white-50 text-decoration-none small d-inline-flex align-items-center gap-1 hover:text-white"
          >
            <ArrowLeft size={16} />
            <span>Back to Portal Selection</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-4 text-info mb-2 shadow-sm">
            <Stethoscope size={36} />
          </div>
          <h2 className="fw-bold text-white mb-1 tracking-tight">HealthPulse</h2>
          <div className="d-inline-flex align-items-center gap-1 badge bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-1 rounded-pill">
            <Lock size={12} />
            <span>Attending Physician Portal</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          <div className="card-body p-4 p-sm-5">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="fw-bold text-dark mb-0">Doctor Sign In</h4>
              <span className="badge bg-primary-subtle text-primary small">Clinical Care</span>
            </div>
            <p className="text-muted small mb-4">
              Authorized medical practitioners can sign in to view daily schedules and manage patient care.
            </p>

            {formError && (
              <div
                className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-4"
                role="alert"
              >
                <AlertCircle size={18} className="flex-shrink-0 mt-1" />
                <div>{formError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Doctor Email
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light border-start-0"
                    placeholder="doctor@healthpulse.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-secondary mb-0">
                    Password
                  </label>
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-decoration-none text-muted p-0 small"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control bg-light border-start-0 border-end-0"
                    placeholder="Enter doctor password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light text-muted border-start-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-pill fw-semibold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying Clinical Access...</span>
                  </>
                ) : (
                  <>
                    <Stethoscope size={18} />
                    <span>Sign In to Doctor Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="border-top pt-3 mt-4 text-center">
              <small className="text-muted d-block mb-2">Attending Doctor Demo Account:</small>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary rounded-pill py-1 px-3 small d-inline-flex align-items-center gap-1"
                onClick={handleFillDemo}
              >
                <Sparkles size={14} className="text-warning" />
                <span>Fill Dr. Satya Deep (dr.satyadeep@healthpulse.com)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-4">
          <small className="text-white-50 d-inline-flex align-items-center gap-1">
            <HeartPulse size={14} className="text-info" />
            <span>Firebase Authentication &bull; Encrypted Clinical Records</span>
          </small>
        </div>
      </div>
    </div>
  )
}
