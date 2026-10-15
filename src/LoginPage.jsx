import { useState } from 'react'
import axios from 'axios'

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.')
      return
    }

    setLoading(true)

    // Demo admin bypass
    if (email.toLowerCase() === 'admin@healthpulse.com' && password === 'admin123') {
      const adminUser = {
        name: 'Clinical Administrator',
        email: 'admin@healthpulse.com',
        role: 'Admin',
      }
      localStorage.setItem('healthpulse_user', JSON.stringify(adminUser))
      onLoginSuccess(adminUser)
      setLoading(false)
      return
    }

    try {
      const res = await axios.post('https://doc-back.onrender.com/login', {
        email: email.trim(),
        password: password.trim(),
      })

      if (res.data && res.data.message === 'Login successful') {
        const user = {
          name: res.data.patient?.name || email.split('@')[0],
          email: res.data.patient?.email || email,
          role: 'Authorized User',
          patientData: res.data.patient,
        }
        localStorage.setItem('healthpulse_user', JSON.stringify(user))
        onLoginSuccess(user)
      } else {
        setErrorMessage('Invalid email or password.')
      }
    } catch (err) {
      console.error('Login error:', err)
      if (err.response && err.response.status === 401) {
        setErrorMessage('Invalid email or password. Please verify your credentials.')
      } else {
        setErrorMessage('Network error or invalid credentials. You can use the Quick Demo Login below.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setErrorMessage(null)
  }

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="w-100" style={{ maxWidth: '440px' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 bg-primary bg-opacity-25 rounded-4 text-info fs-1 mb-2 shadow-sm">
            <i className="bi bi-heart-pulse-fill text-danger"></i>
          </div>
          <h2 className="fw-bold text-white mb-1 tracking-tight">HealthPulse</h2>
          <p className="text-white-50 small mb-0">Secure Patient & Clinical Care Portal</p>
        </div>

        {/* Login Card */}
        <div className="card border-0 shadow-lg" style={{ borderRadius: '22px' }}>
          <div className="card-body p-4 p-sm-5">
            <h4 className="fw-bold text-dark mb-1">Sign In</h4>
            <p className="text-muted small mb-4">Enter your credentials to access patient records</p>

            {errorMessage && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light border-start-0"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small fw-semibold text-secondary">Password</label>
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
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control bg-light border-start-0 border-end-0"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light text-muted border-start-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
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
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Access Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins Helper */}
            <div className="border-top pt-3 mt-4 text-center">
              <small className="text-muted d-block mb-2 fw-semibold">Quick Demo Credentials:</small>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill py-1 px-3 small"
                  onClick={() => handleQuickLogin('shravan@gmail.com', 'shravan')}
                >
                  Patient: Shravan
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill py-1 px-3 small"
                  onClick={() => handleQuickLogin('admin@healthpulse.com', 'admin123')}
                >
                  Admin Portal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="text-center mt-4">
          <small className="text-white-50 d-inline-flex align-items-center gap-1">
            <i className="bi bi-shield-check text-success"></i>
            <span>256-Bit SSL Encrypted Healthcare Portal</span>
          </small>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
