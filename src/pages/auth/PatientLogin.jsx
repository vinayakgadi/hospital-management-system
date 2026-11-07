import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  UserCheck,
  UserPlus,
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
  User,
  Activity,
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

export default function PatientLogin() {
  const [activeTab, setActiveTab] = useState('login') // 'login' or 'register'

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Registration form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regAge, setRegAge] = useState('32')
  const [regGender, setRegGender] = useState('Male')
  const [regWeight, setRegWeight] = useState('72')
  const [regDisease, setRegDisease] = useState('Routine Checkup')
  const [regSuccess, setRegSuccess] = useState(null)
  const [regError, setRegError] = useState(null)
  const [regLoading, setRegLoading] = useState(false)

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState(null)
  const [resetError, setResetError] = useState(null)

  const { login, loginWithGoogle, registerPatient, resetPassword, loading } = useAuth()
  const navigate = useNavigate()

  // Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both your patient account email and password.')
      return
    }

    const res = await login(email, password, 'patient')
    if (res.success) {
      navigate('/patient/dashboard', { replace: true })
    } else {
      setFormError(res.error || 'Authentication failed. Please check patient credentials.')
    }
  }

  // Google Sign-in Handler
  const handleGoogleSignIn = async () => {
    setFormError(null)
    setGoogleLoading(true)
    const res = await loginWithGoogle('patient')
    setGoogleLoading(false)

    if (res.success) {
      navigate('/patient/dashboard', { replace: true })
    } else {
      setFormError(res.error || 'Google patient authentication failed.')
    }
  }

  // Patient Registration Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegError(null)
    setRegSuccess(null)

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Full Name, Email Address, and Password are required.')
      return
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.')
      return
    }

    setRegLoading(true)
    const res = await registerPatient(regName, regEmail, regPassword, {
      age: regAge,
      gender: regGender,
      weight: regWeight,
      disease: regDisease,
    })
    setRegLoading(false)

    if (res.success) {
      setRegSuccess('Account created successfully! Redirecting to your personal health dashboard...')
      setTimeout(() => {
        navigate('/patient/dashboard', { replace: true })
      }, 1200)
    } else {
      setRegError(res.error || 'Failed to create patient account. Please try again.')
    }
  }

  // Password reset request
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResetError(null)
    setResetMessage(null)

    if (!resetEmail.trim()) {
      setResetError('Please enter your patient email address.')
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
      <div className="w-100" style={{ maxWidth: '480px' }}>
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

        {/* Login / Register Card */}
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          {/* Top Navigation Tabs */}
          <div className="d-flex border-bottom bg-light">
            <button
              type="button"
              className={`btn flex-fill py-3 fw-semibold border-0 rounded-0 d-flex align-items-center justify-content-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-white text-success border-bottom border-success border-3'
                  : 'text-muted'
              }`}
              onClick={() => {
                setActiveTab('login')
                setFormError(null)
              }}
            >
              <UserCheck size={18} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`btn flex-fill py-3 fw-semibold border-0 rounded-0 d-flex align-items-center justify-content-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-white text-success border-bottom border-success border-3'
                  : 'text-muted'
              }`}
              onClick={() => {
                setActiveTab('register')
                setRegError(null)
              }}
            >
              <UserPlus size={18} />
              <span>Create Account</span>
            </button>
          </div>

          <div className="card-body p-4 p-sm-5">
            {activeTab === 'login' ? (
              /* TAB 1: SIGN IN */
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h4 className="fw-bold text-dark mb-0">Patient Sign In</h4>
                  <span className="badge bg-success-subtle text-success small">Personal Health</span>
                </div>
                <p className="text-muted small mb-4">
                  Sign in with your registered email or Google account to access your medical records and appointments.
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

                <form onSubmit={handleLoginSubmit}>
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

                  {/* Forgot password link */}
                  <div className="text-end mb-4">
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-success text-decoration-none p-0 small fw-medium"
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
                    className="btn btn-success w-100 py-2 rounded-pill fw-semibold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3"
                    disabled={loading || googleLoading}
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
            ) : (
              /* TAB 2: REGISTER NEW PATIENT */
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h4 className="fw-bold text-dark mb-0">Create Patient Profile</h4>
                  <span className="badge bg-emerald-100 text-success small">Self Service</span>
                </div>
                <p className="text-muted small mb-3">
                  Register for instant access to your clinical records, test results, and attending doctor scheduling.
                </p>

                {regSuccess && (
                  <div className="alert alert-success d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-3">
                    <CheckCircle2 size={18} className="flex-shrink-0 text-success mt-1" />
                    <div>{regSuccess}</div>
                  </div>
                )}

                {regError && (
                  <div className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-3">
                    <AlertCircle size={18} className="flex-shrink-0 mt-1" />
                    <div>{regError}</div>
                  </div>
                )}

                {/* Google Sign-up Shortcut */}
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 py-2 mb-3 rounded-pill fw-medium d-flex align-items-center justify-content-center gap-2 border bg-white text-dark shadow-sm hover-shadow"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading || regLoading}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-muted" />
                      <span>Creating with Google...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span>Sign up with Google</span>
                    </>
                  )}
                </button>

                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1 my-0 text-muted opacity-25" />
                  <span className="px-3 text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                    or enter patient details
                  </span>
                  <hr className="flex-grow-1 my-0 text-muted opacity-25" />
                </div>

                <form onSubmit={handleRegisterSubmit}>
                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Full Legal Name
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-start-0"
                        placeholder="e.g. Eleanor Vance"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        className="form-control bg-light border-start-0"
                        placeholder="eleanor@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Create Password (min. 6 characters)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        className="form-control bg-light border-start-0"
                        placeholder="Choose a secure password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Clinical Vitals Row */}
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-secondary">Age</label>
                      <input
                        type="number"
                        className="form-control bg-light"
                        placeholder="Age"
                        value={regAge}
                        onChange={(e) => setRegAge(e.target.value)}
                        min="1"
                        max="120"
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-secondary">Gender</label>
                      <select
                        className="form-select bg-light"
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-secondary">Weight (kg)</label>
                      <input
                        type="number"
                        className="form-control bg-light"
                        placeholder="kg"
                        value={regWeight}
                        onChange={(e) => setRegWeight(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Primary Medical Condition or Reason */}
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary">
                      Primary Medical Concern / Reason
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Activity size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-start-0"
                        placeholder="e.g. Hypertension, Annual Wellness"
                        value={regDisease}
                        onChange={(e) => setRegDisease(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Register Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-success w-100 py-2 rounded-pill fw-semibold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-2"
                    disabled={regLoading || loading}
                  >
                    {regLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Registering Patient Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-4">
          <small className="text-white-50 d-inline-flex align-items-center gap-1">
            <HeartPulse size={14} className="text-success" />
            <span>Firebase &bull; PostgreSQL Encrypted Auth &bull; Encrypted Health Records &amp; Privacy</span>
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
                  <div className="p-2 bg-success bg-opacity-10 text-success rounded-3">
                    <KeyRound size={20} />
                  </div>
                  <h5 className="modal-title fw-bold">Reset Patient Password</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForgotModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-3">
                  Enter your registered patient email address. We will dispatch a secure password reset link to your inbox.
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
                      Patient Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="patient@healthpulse.com"
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
                      className="btn btn-success rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-1"
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
