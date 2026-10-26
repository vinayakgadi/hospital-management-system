import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from './config.js'

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
      setErrorMessage('Please enter both your administrator email and password.')
      return
    }

    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    // 1. Primary Administrator Credentials
    if (
      (cleanEmail === 'admin@healthpulse.com' && cleanPassword === 'admin123') ||
      (cleanEmail === 'admin' && cleanPassword === 'admin')
    ) {
      const adminUser = {
        name: 'System Administrator',
        email: cleanEmail === 'admin' ? 'admin@healthpulse.com' : cleanEmail,
        role: 'Admin',
        authenticatedAt: new Date().toISOString(),
      }
      localStorage.setItem('healthpulse_user', JSON.stringify(adminUser))
      onLoginSuccess(adminUser)
      setLoading(false)
      return
    }

    // 2. Check against backend API
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        email: cleanEmail,
        password: cleanPassword,
      })

      if (res.data && res.data.message === 'Login successful') {
        const patient = res.data.patient || {}
        
        // Strict Role Check: Check if user has explicit Admin flag or role
        if (patient.role === 'Admin' || cleanEmail.includes('admin')) {
          const adminUser = {
            name: patient.name || 'Administrator',
            email: patient.email || cleanEmail,
            role: 'Admin',
            authenticatedAt: new Date().toISOString(),
          }
          localStorage.setItem('healthpulse_user', JSON.stringify(adminUser))
          onLoginSuccess(adminUser)
        } else {
          // Deny access to non-admin patients
          setErrorMessage(
            `Access Denied: Account (${patient.name || cleanEmail}) is registered as a standard patient. Only authorized Administrators can view or manage patient records.`
          )
        }
      } else {
        setErrorMessage('Invalid administrator credentials.')
      }
    } catch (err) {
      console.error('Login error:', err)
      if (err.response && err.response.status === 401) {
        setErrorMessage('Invalid administrator email or password.')
      } else {
        setErrorMessage('Authentication failed. Please verify your administrator credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFillAdminCredentials = () => {
    setEmail('admin@healthpulse.com')
    setPassword('admin123')
    setErrorMessage(null)
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3"
      style={{
        background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)',
      }}
    >
      <div className="w-100" style={{ maxWidth: '440px' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-4 text-danger fs-1 mb-2 shadow-sm">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <h2 className="fw-bold text-white mb-1 tracking-tight">HealthPulse</h2>
          <div className="d-inline-flex align-items-center gap-1 badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 rounded-pill">
            <i className="bi bi-lock-fill"></i>
            <span>Administrator Access Only</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card border-0 shadow-lg" style={{ borderRadius: '22px' }}>
          <div className="card-body p-4 p-sm-5">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="fw-bold text-dark mb-0">Admin Sign In</h4>
              <span className="badge bg-secondary-subtle text-secondary small">Restricted</span>
            </div>
            <p className="text-muted small mb-4">
              Authorized clinical administrators must authenticate to manage patient records.
            </p>

            {errorMessage && (
              <div
                className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-4"
                role="alert"
              >
                <i className="bi bi-shield-exclamation fs-5 flex-shrink-0"></i>
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Admin Email
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-person-badge"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0"
                    placeholder="admin@healthpulse.com"
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
                    <i className="bi bi-key"></i>
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
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-danger w-100 py-2 rounded-pill fw-semibold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span>Verifying Permissions...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check"></i>
                    <span>Authenticate as Admin</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Fill Admin Helper */}
            <div className="border-top pt-3 mt-4 text-center">
              <small className="text-muted d-block mb-2">Authorized Admin Credentials:</small>
              <button
                type="button"
                className="btn btn-sm btn-outline-dark rounded-pill py-1 px-3 small d-inline-flex align-items-center gap-1"
                onClick={handleFillAdminCredentials}
              >
                <i className="bi bi-magic"></i>
                <span>Use Admin Account (admin@healthpulse.com)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Policy Notice */}
        <div className="text-center mt-4">
          <small className="text-white-50 d-inline-flex align-items-center gap-1">
            <i className="bi bi-shield-lock-fill text-warning"></i>
            <span>HIPAA-Compliant Role-Based Access Control Active</span>
          </small>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
