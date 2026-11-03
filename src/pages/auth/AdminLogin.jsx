import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  HeartPulse,
  KeyRound,
  X,
} from 'lucide-react'

// Official Google Logo SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
)

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState(null)
  const [resetError, setResetError] = useState(null)

  const { login, loginWithGoogle, resetPassword, loading } = useAuth()
  const navigate = useNavigate()

  // Standard Email/Password login
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both your administrator email and password.')
      return
    }

    const res = await login(email, password, 'admin')
    if (res.success) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setFormError(res.error || 'Authentication failed. Please verify admin credentials.')
    }
  }

  // Google sign-in
  const handleGoogleSignIn = async () => {
    setFormError(null)
    setGoogleLoading(true)
    const res = await loginWithGoogle('admin')
    setGoogleLoading(false)

    if (res.success) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setFormError(res.error || 'Google administrator authentication failed.')
    }
  }

  // Password reset request
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResetError(null)
    setResetMessage(null)

    if (!resetEmail.trim()) {
      setResetError('Please enter your administrator email address.')
      return
    }

    setResetLoading(true)
    const res = await resetPassword(resetEmail)
    setResetLoading(false)

    if (res.success) {
      setResetMessage(res.message || `Password reset link sent to ${resetEmail}. Check your inbox.`)
    } else {
      setResetError(res.error || 'Failed to dispatch password reset email.')
    }
  }

  const handleFillDemo = () => {
    setEmail('admin@healthpulse.com')
    setPassword('admin123')
    setFormError(null)
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3"
      style={{
        background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)',
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
          <div className="d-inline-flex p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-4 text-danger mb-2 shadow-sm">
            <ShieldAlert size={36} />
          </div>
          <h2 className="fw-bold text-white mb-1 tracking-tight">HealthPulse</h2>
          <div className="d-inline-flex align-items-center gap-1 badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 rounded-pill">
            <Lock size={12} />
            <span>Administrator Access Portal</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          <div className="card-body p-4 p-sm-5">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="fw-bold text-dark mb-0">Admin Sign In</h4>
              <span className="badge bg-secondary-subtle text-secondary small">Restricted</span>
            </div>
            <p className="text-muted small mb-4">
              Authorized clinical administrators must authenticate to access the administration dashboard.
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

            {/* Google Authentication Button */}
            <button
              type="button"
              className="btn btn-outline-secondary w-100 py-2 mb-3 rounded-pill fw-medium d-flex align-items-center justify-content-center gap-2 border bg-white text-dark shadow-sm hover-shadow"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-muted" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1 my-0 text-muted opacity-25" />
              <span className="px-3 text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                or sign in with email
              </span>
              <hr className="flex-grow-1 my-0 text-muted opacity-25" />
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Admin Email
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light border-start-0"
                    placeholder="admin@healthpulse.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
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
                    placeholder="Enter admin password"
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

              {/* Forgot password link */}
              <div className="text-end mb-4">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-danger text-decoration-none p-0 small fw-medium"
                  onClick={() => {
                    setResetEmail(email || '')
                    setResetMessage(null)
                    setResetError(null)
                    setShowForgotModal(true)
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-danger w-100 py-2 rounded-pill fw-semibold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={18} />
                    <span>Sign In to Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="border-top pt-3 mt-4 text-center">
              <small className="text-muted d-block mb-2">Authorized Demo Credentials:</small>
              <button
                type="button"
                className="btn btn-sm btn-outline-dark rounded-pill py-1 px-3 small d-inline-flex align-items-center gap-1"
                onClick={handleFillDemo}
              >
                <Sparkles size={14} className="text-warning" />
                <span>Fill Demo Admin (admin@healthpulse.com)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-4">
          <small className="text-white-50 d-inline-flex align-items-center gap-1">
            <HeartPulse size={14} className="text-danger" />
            <span>Firebase &bull; PostgreSQL Encrypted Auth &bull; HIPAA-Compliant RBAC Active</span>
          </small>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-danger bg-opacity-10 text-danger rounded-3">
                    <KeyRound size={20} />
                  </div>
                  <h5 className="modal-title fw-bold">Reset Admin Password</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForgotModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-3">
                  Enter your registered administrator email address. We will dispatch a secure password reset link to your inbox.
                </p>

                {resetMessage && (
                  <div className="alert alert-success d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-3">
                    <CheckCircle2 size={18} className="flex-shrink-0 text-success mt-1" />
                    <div>{resetMessage}</div>
                  </div>
                )}

                {resetError && (
                  <div className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-3">
                    <AlertCircle size={18} className="flex-shrink-0 mt-1" />
                    <div>{resetError}</div>
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Administrator Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="admin@healthpulse.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2 pt-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-3"
                      onClick={() => setShowForgotModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-danger rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-1"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
