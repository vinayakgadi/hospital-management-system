import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  UserCheck,
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

export default function PatientLogin() {
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
      setFormError('Please enter your patient account email and password.')
      return
    }

    const res = await login(email, password, 'patient')
    if (res.success) {
      navigate('/patient/dashboard', { replace: true })
    } else {
      setFormError(res.error || 'Authentication failed. Please check patient credentials.')
    }
  }

  const handleFillDemo = () => {
    setEmail('shravan@healthpulse.com')
    setPassword('patient123')
    setFormError(null)
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3"
      style={{
        background: 'radial-gradient(circle at top, #064e3b 0%, #022c22 100%)',
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
          <div className="d-inline-flex p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-4 text-success mb-2 shadow-sm">
            <UserCheck size={36} className="text-emerald-400" />
          </div>
          <h2 className="fw-bold text-white mb-1 tracking-tight">HealthPulse</h2>
          <div className="d-inline-flex align-items-center gap-1 badge bg-success-subtle text-success-emphasis border border-success-subtle px-3 py-1 rounded-pill">
            <Lock size={12} />
            <span>Patient Services Portal</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          <div className="card-body p-4 p-sm-5">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="fw-bold text-dark mb-0">Patient Sign In</h4>
              <span className="badge bg-success-subtle text-success small">Personal Health</span>
            </div>
            <p className="text-muted small mb-4">
              Sign in with your registered email to view appointments, medical conditions, and clinical records.
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
                  Patient Email
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light border-start-0"
                    placeholder="patient@healthpulse.com"
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
                    placeholder="Enter patient password"
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
                className="btn btn-success w-100 py-2 rounded-pill fw-semibold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Accessing Health Portal...</span>
                  </>
                ) : (
                  <>
                    <UserCheck size={18} />
                    <span>Sign In to Patient Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="border-top pt-3 mt-4 text-center">
              <small className="text-muted d-block mb-2">Registered Patient Demo Account:</small>
              <button
                type="button"
                className="btn btn-sm btn-outline-success rounded-pill py-1 px-3 small d-inline-flex align-items-center gap-1"
                onClick={handleFillDemo}
              >
                <Sparkles size={14} className="text-warning" />
                <span>Fill Shravan (shravan@healthpulse.com)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-4">
          <small className="text-white-50 d-inline-flex align-items-center gap-1">
            <HeartPulse size={14} className="text-success" />
            <span>PostgreSQL Encrypted Auth &bull; Encrypted Health Records &amp; Privacy</span>
          </small>
        </div>
      </div>
    </div>
  )
}
