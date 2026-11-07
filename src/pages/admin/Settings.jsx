import { useState, useEffect, useCallback } from 'react'
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Users,
  Sliders,
  Database,
  FileSpreadsheet,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  LogOut,
  Server,
  Activity,
  HardDrive,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { settingsService } from '../../services/settingsService.js'

export default function Settings() {
  const { user: authUser } = useAuth()

  // Tab State
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  // 1. Profile State
  const [profileName, setProfileName] = useState(authUser?.name || 'Administrator')
  const [profileEmail, setProfileEmail] = useState(authUser?.email || 'admin@healthpulse.com')
  const [savingProfile, setSavingProfile] = useState(false)

  // 2. Security / Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [revokingSessions, setRevokingSessions] = useState(false)

  // 3. System Preferences & Policies State
  const [settings, setSettings] = useState({
    hospital_name: 'HealthPulse Hospital & Health Systems',
    hospital_tagline: 'Precision Care & Electronic Medical Records',
    hospital_email: 'contact@healthpulse.org',
    hospital_phone: '+1 (555) 234-5678',
    default_timezone: 'UTC',
    date_format: 'YYYY-MM-DD',
    session_timeout_minutes: '60',
    max_login_attempts: '5',
    require_strong_passwords: 'true',
    audit_logging_enabled: 'true',
    email_notifications_enabled: 'true',
    auto_archive_records_days: '365',
  })
  const [savingSettings, setSavingSettings] = useState(false)

  // 4. System & Database Health State
  const [systemInfo, setSystemInfo] = useState(null)
  const [loadingHealth, setLoadingHealth] = useState(false)

  // 5. User Management State
  const [usersList, setUsersList] = useState([])
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userStatusFilter, setUserStatusFilter] = useState('all')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [togglingUserId, setTogglingUserId] = useState(null)

  // 6. Audit Logs State
  const [auditLogs, setAuditLogs] = useState([])
  const [auditPage, setAuditPage] = useState(1)
  const [auditTotalPages, setAuditTotalPages] = useState(1)
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditSearch, setAuditSearch] = useState('')
  const [auditEventType, setAuditEventType] = useState('ALL')
  const [loadingAudit, setLoadingAudit] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load Settings and System metadata
  const loadSettingsAndHealth = useCallback(async () => {
    try {
      const data = await settingsService.getSettings()
      if (data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }))
      }
      if (data.system) {
        setSystemInfo(data.system)
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }, [])

  // Load User Directory
  const loadUsers = useCallback(async () => {
    try {
      const params = {}
      if (userRoleFilter !== 'all') params.role = userRoleFilter
      if (userStatusFilter !== 'all') params.status = userStatusFilter
      const data = await settingsService.getUsers(params)
      setUsersList(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load user directory:', err)
    }
  }, [userRoleFilter, userStatusFilter])

  // Load Audit Logs
  const loadAuditLogs = useCallback(async () => {
    setLoadingAudit(true)
    try {
      const params = {
        page: auditPage,
        per_page: 15,
        search: auditSearch,
        eventType: auditEventType,
      }
      const data = await settingsService.getAuditLogs(params)
      setAuditLogs(data.logs || [])
      setAuditTotal(data.total || 0)
      setAuditTotalPages(data.total_pages || 1)
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    } finally {
      setLoadingAudit(false)
    }
  }, [auditPage, auditSearch, auditEventType])

  // Refresh System Health telemetry
  const refreshHealth = async () => {
    setLoadingHealth(true)
    try {
      const data = await settingsService.getSystemHealth()
      setSystemInfo(data)
      showToast('System and database telemetry refreshed.')
    } catch (err) {
      console.error('Failed to refresh health:', err)
    } finally {
      setLoadingHealth(false)
    }
  }

  useEffect(() => {
    loadSettingsAndHealth()
  }, [loadSettingsAndHealth])

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
    } else if (activeTab === 'audit') {
      loadAuditLogs()
    }
  }, [activeTab, loadUsers, loadAuditLogs])

  // Profile Form Submit
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setErrorMessage(null)
    try {
      await settingsService.updateProfile(profileName, profileEmail)
      showToast('Profile information updated successfully.')
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  // Password Change Submit
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.')
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.')
      return
    }

    setChangingPassword(true)
    try {
      await settingsService.changePassword(currentPassword, newPassword)
      showToast('Administrator password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to change password. Verify your current password.')
    } finally {
      setChangingPassword(false)
    }
  }

  // Revoke All Other Sessions
  const handleRevokeSessions = async () => {
    if (!window.confirm('Are you sure you want to invalidate all other active sessions? All other users and devices will be logged out.')) {
      return
    }
    setRevokingSessions(true)
    try {
      const res = await settingsService.revokeAllSessions()
      showToast(res.message || 'All other active sessions revoked.')
      loadSettingsAndHealth()
    } catch (err) {
      setErrorMessage('Failed to revoke active sessions.')
    } finally {
      setRevokingSessions(false)
    }
  }

  // Save Application Settings & Policies
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    setErrorMessage(null)
    try {
      await settingsService.updateSettings(settings)
      showToast('Hospital configuration and policies saved successfully.')
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to save settings.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Toggle User Active Status
  const handleToggleUserStatus = async (targetUser) => {
    if (authUser && targetUser.id === authUser.id) {
      alert('You cannot deactivate your own currently active administrator account.')
      return
    }

    const actionText = targetUser.is_active ? 'deactivate' : 'activate'
    if (!window.confirm(`Are you sure you want to ${actionText} user "${targetUser.name}"?`)) {
      return
    }

    setTogglingUserId(targetUser.id)
    try {
      await settingsService.toggleUserStatus(targetUser.id, !targetUser.is_active)
      showToast(`User ${targetUser.name} has been ${actionText}d.`)
      loadUsers()
    } catch (err) {
      setErrorMessage(err.response?.data?.error || `Failed to ${actionText} user.`)
    } finally {
      setTogglingUserId(null)
    }
  }

  // Filtered users for search input
  const filteredUsers = usersList.filter((u) => {
    if (!userSearchTerm) return true
    const term = userSearchTerm.toLowerCase()
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="settings-container pb-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1060, marginTop: '70px' }}
        >
          <div className="toast show align-items-center text-bg-success border-0 shadow-lg" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <CheckCircle2 size={18} />
                <span>{toastMessage}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div
              className="p-2 rounded-3 text-white d-flex align-items-center justify-content-center"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
            >
              <SettingsIcon size={22} />
            </div>
            <h1 className="h3 fw-bold text-slate-900 mb-0">Settings & Security</h1>
          </div>
          <p className="text-muted mb-0 small">
            Configure hospital parameters, administrative access credentials, user directory, policies, and audit logs.
          </p>
        </div>

        {/* Database Engine Status Pill */}
        {systemInfo && (
          <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded-3 border shadow-sm small">
            <Database size={16} className="text-primary" />
            <span className="text-muted">Engine:</span>
            <span className="fw-bold text-slate-800 text-capitalize">
              {systemInfo.active_database_engine || systemInfo.engine}
            </span>
            <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle ms-1">
              Connected
            </span>
          </div>
        )}
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3 shadow-sm mb-4">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={20} className="text-danger flex-shrink-0" />
            <span className="small">{errorMessage}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setErrorMessage(null)} />
        </div>
      )}

      {/* Main Settings Card with Nav Tabs */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="card-header bg-white border-bottom p-0">
          <ul className="nav nav-tabs border-0 px-3 pt-2 gap-1 flex-nowrap overflow-x-auto">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 border-bottom border-3 py-3 px-3 d-flex align-items-center gap-2 fw-semibold small ${
                  activeTab === 'profile'
                    ? 'border-primary text-primary active bg-transparent'
                    : 'border-transparent text-muted'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={16} />
                <span>Admin Profile</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 border-bottom border-3 py-3 px-3 d-flex align-items-center gap-2 fw-semibold small ${
                  activeTab === 'security'
                    ? 'border-primary text-primary active bg-transparent'
                    : 'border-transparent text-muted'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Shield size={16} />
                <span>Account Security</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 border-bottom border-3 py-3 px-3 d-flex align-items-center gap-2 fw-semibold small ${
                  activeTab === 'users'
                    ? 'border-primary text-primary active bg-transparent'
                    : 'border-transparent text-muted'
                }`}
                onClick={() => setActiveTab('users')}
              >
                <Users size={16} />
                <span>User Directory</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 border-bottom border-3 py-3 px-3 d-flex align-items-center gap-2 fw-semibold small ${
                  activeTab === 'preferences'
                    ? 'border-primary text-primary active bg-transparent'
                    : 'border-transparent text-muted'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                <Sliders size={16} />
                <span>Preferences</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 border-bottom border-3 py-3 px-3 d-flex align-items-center gap-2 fw-semibold small ${
                  activeTab === 'policies'
                    ? 'border-primary text-primary active bg-transparent'
                    : 'border-transparent text-muted'
                }`}
                onClick={() => setActiveTab('policies')}
              >
                <Lock size={16} />
                <span>Security Policies</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 border-bottom border-3 py-3 px-3 d-flex align-items-center gap-2 fw-semibold small ${
                  activeTab === 'system'
                    ? 'border-primary text-primary active bg-transparent'
                    : 'border-transparent text-muted'
                }`}
                onClick={() => setActiveTab('system')}
              >
                <Database size={16} />
                <span>Database Health</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 border-bottom border-3 py-3 px-3 d-flex align-items-center gap-2 fw-semibold small ${
                  activeTab === 'audit'
                    ? 'border-primary text-primary active bg-transparent'
                    : 'border-transparent text-muted'
                }`}
                onClick={() => setActiveTab('audit')}
              >
                <FileSpreadsheet size={16} />
                <span>Audit Logs</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content Body */}
        <div className="card-body p-4">
          {/* TAB 1: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '640px' }}>
              <div className="mb-4">
                <h5 className="fw-bold text-slate-800 mb-1">Administrator Profile</h5>
                <p className="text-muted small">Update your administrative identification and registered email address.</p>
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-slate-700">Display Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-slate-700">Official Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    required
                  />
                  <div className="form-text small">Used for administrative communications and system alerts.</div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-slate-700">Access Level</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value="Master System Administrator (Full Privileges)"
                    disabled
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                  disabled={savingProfile}
                >
                  <Save size={16} />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ACCOUNT SECURITY */}
          {activeTab === 'security' && (
            <div style={{ maxWidth: '640px' }}>
              <div className="mb-4">
                <h5 className="fw-bold text-slate-800 mb-1">Account Password & Credentials</h5>
                <p className="text-muted small">Update your administrative password using standard PBKDF2/scrypt encryption.</p>
              </div>

              <form onSubmit={handleChangePassword} className="mb-5">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-slate-700">Current Password</label>
                  <div className="input-group">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-slate-700">New Password</label>
                  <div className="input-group">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowNewPw(!showNewPw)}
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                  disabled={changingPassword}
                >
                  <KeyRound size={16} />
                  <span>{changingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>

              <hr className="my-4" />

              {/* Active Session Management */}
              <div className="rounded-3 border border-danger-subtle bg-danger bg-opacity-10 p-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded-2 bg-danger text-white flex-shrink-0">
                    <LogOut size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold text-danger mb-1">Revoke All Active Sessions</h6>
                    <p className="text-muted small mb-3">
                      Immediately invalidates all existing authentication tokens across all browsers, clinics, and devices except your current session.
                    </p>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm px-3 shadow-sm"
                      onClick={handleRevokeSessions}
                      disabled={revokingSessions}
                    >
                      {revokingSessions ? 'Revoking...' : 'Terminate All Other Sessions'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER DIRECTORY & ACCESS CONTROL */}
          {activeTab === 'users' && (
            <div>
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
                <div>
                  <h5 className="fw-bold text-slate-800 mb-1">Central User Directory</h5>
                  <p className="text-muted small mb-0">
                    Unified accounts directory for Admins, Clinicians, and Patients in the system.
                  </p>
                </div>

                {/* Filters */}
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <div className="input-group input-group-sm" style={{ width: '220px' }}>
                    <span className="input-group-text bg-white border-end-0">
                      <Search size={14} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search name or email..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Role filter */}
                  <select
                    className="form-select form-select-sm"
                    style={{ width: '130px' }}
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="doctor">Doctors</option>
                    <option value="patient">Patients</option>
                  </select>

                  {/* Status filter */}
                  <select
                    className="form-select form-select-sm"
                    style={{ width: '130px' }}
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={loadUsers}
                    title="Refresh user directory"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="table-responsive rounded-3 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="small text-muted text-uppercase">
                      <th className="ps-3">User ID</th>
                      <th>Account Name</th>
                      <th>Email Address</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Registered On</th>
                      <th className="text-end pe-3">Account Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => {
                        const isSelf = authUser && u.id === authUser.id
                        return (
                          <tr key={u.id}>
                            <td className="ps-3 fw-semibold text-muted">#{u.id}</td>
                            <td>
                              <span className="fw-semibold text-slate-800">{u.name}</span>
                              {isSelf && (
                                <span className="badge bg-primary bg-opacity-10 text-primary ms-2" style={{ fontSize: '0.65rem' }}>
                                  You
                                </span>
                              )}
                            </td>
                            <td className="text-muted">{u.email}</td>
                            <td>
                              <span
                                className={`badge text-capitalize ${
                                  u.role === 'admin'
                                    ? 'bg-danger bg-opacity-10 text-danger border border-danger-subtle'
                                    : u.role === 'doctor'
                                    ? 'bg-info bg-opacity-10 text-info border border-info-subtle'
                                    : 'bg-primary bg-opacity-10 text-primary border border-primary-subtle'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  u.is_active
                                    ? 'bg-success bg-opacity-10 text-success border border-success-subtle'
                                    : 'bg-secondary bg-opacity-10 text-secondary border'
                                }`}
                              >
                                {u.is_active ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="text-muted small">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="text-end pe-3">
                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  u.is_active ? 'btn-outline-danger' : 'btn-outline-success'
                                } px-3`}
                                onClick={() => handleToggleUserStatus(u)}
                                disabled={isSelf || togglingUserId === u.id}
                                title={isSelf ? 'Cannot deactivate currently active session' : ''}
                              >
                                {togglingUserId === u.id
                                  ? 'Updating...'
                                  : u.is_active
                                  ? 'Deactivate'
                                  : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted small">
                          No users found matching current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM PREFERENCES */}
          {activeTab === 'preferences' && (
            <div style={{ maxWidth: '720px' }}>
              <div className="mb-4">
                <h5 className="fw-bold text-slate-800 mb-1">Hospital Facility Preferences</h5>
                <p className="text-muted small">Configure institutional identity, contact headers, and clinical date formatting.</p>
              </div>

              <form onSubmit={handleSaveSettings}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-slate-700">Hospital / Facility Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.hospital_name || ''}
                      onChange={(e) => setSettings({ ...settings, hospital_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-slate-700">Facility Tagline</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.hospital_tagline || ''}
                      onChange={(e) => setSettings({ ...settings, hospital_tagline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-slate-700">Primary Contact Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={settings.hospital_email || ''}
                      onChange={(e) => setSettings({ ...settings, hospital_email: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-slate-700">Hospital Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.hospital_phone || ''}
                      onChange={(e) => setSettings({ ...settings, hospital_phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-slate-700">Default Timezone</label>
                    <select
                      className="form-select"
                      value={settings.default_timezone || 'UTC'}
                      onChange={(e) => setSettings({ ...settings, default_timezone: e.target.value })}
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">Eastern Time (US & Canada)</option>
                      <option value="America/Chicago">Central Time (US & Canada)</option>
                      <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-slate-700">Date Display Format</label>
                    <select
                      className="form-select"
                      value={settings.date_format || 'YYYY-MM-DD'}
                      onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (UK/EU)</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-slate-700">Auto-Archive Threshold (Days)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.auto_archive_records_days || '365'}
                      onChange={(e) => setSettings({ ...settings, auto_archive_records_days: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                  disabled={savingSettings}
                >
                  <Save size={16} />
                  <span>{savingSettings ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: SECURITY POLICIES */}
          {activeTab === 'policies' && (
            <div style={{ maxWidth: '720px' }}>
              <div className="mb-4">
                <h5 className="fw-bold text-slate-800 mb-1">Security & Governance Policies</h5>
                <p className="text-muted small">Configure session expiration rules, authentication brute-force protections, and audit logging.</p>
              </div>

              <form onSubmit={handleSaveSettings}>
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-slate-700">Session Inactivity Timeout (Minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.session_timeout_minutes || '60'}
                      onChange={(e) => setSettings({ ...settings, session_timeout_minutes: e.target.value })}
                      min="5"
                      max="1440"
                    />
                    <div className="form-text small">Automatically expires user authorization after idle period.</div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-slate-700">Max Failed Login Attempts</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.max_login_attempts || '5'}
                      onChange={(e) => setSettings({ ...settings, max_login_attempts: e.target.value })}
                      min="3"
                      max="20"
                    />
                    <div className="form-text small">Lockout threshold before temporary authentication cooldown.</div>
                  </div>
                </div>

                <div className="card bg-light border-0 p-3 rounded-3 mb-4">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="policyStrongPasswords"
                      checked={settings.require_strong_passwords === 'true'}
                      onChange={(e) =>
                        setSettings({ ...settings, require_strong_passwords: e.target.checked ? 'true' : 'false' })
                      }
                    />
                    <label className="form-check-label fw-semibold small" htmlFor="policyStrongPasswords">
                      Enforce Strong Password Complexity (Minimum 8 chars with mixed characters)
                    </label>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="policyAuditLogging"
                      checked={settings.audit_logging_enabled === 'true'}
                      onChange={(e) =>
                        setSettings({ ...settings, audit_logging_enabled: e.target.checked ? 'true' : 'false' })
                      }
                    />
                    <label className="form-check-label fw-semibold small" htmlFor="policyAuditLogging">
                      Enable Immutable Activity & Security Audit Logging
                    </label>
                  </div>

                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="policyEmailNotifs"
                      checked={settings.email_notifications_enabled === 'true'}
                      onChange={(e) =>
                        setSettings({ ...settings, email_notifications_enabled: e.target.checked ? 'true' : 'false' })
                      }
                    />
                    <label className="form-check-label fw-semibold small" htmlFor="policyEmailNotifs">
                      Enable System Event Dispatch & Security Notifications
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                  disabled={savingSettings}
                >
                  <Save size={16} />
                  <span>{savingSettings ? 'Saving...' : 'Save Security Policies'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: DATABASE & SYSTEM HEALTH */}
          {activeTab === 'system' && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h5 className="fw-bold text-slate-800 mb-1">Database & Infrastructure Telemetry</h5>
                  <p className="text-muted small mb-0">Live connectivity, database engine specs, active sessions, and data safety backups.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                  onClick={refreshHealth}
                  disabled={loadingHealth}
                >
                  <RefreshCw size={14} className={loadingHealth ? 'spin-animation' : ''} />
                  <span>Test Connection</span>
                </button>
              </div>

              {systemInfo ? (
                <div className="row g-4">
                  {/* Active Database Card */}
                  <div className="col-12 col-md-6">
                    <div className="card border rounded-3 p-3 h-100 bg-white">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="p-2 rounded-2 bg-primary bg-opacity-10 text-primary">
                          <Database size={20} />
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">Active Database Engine</h6>
                          <small className="text-muted">Primary operational data store</small>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                        <span className="text-muted small">Engine Type</span>
                        <span className="fw-bold text-slate-800 text-capitalize">
                          {systemInfo.active_database_engine || systemInfo.engine}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                        <span className="text-muted small">Connection Status</span>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle">
                          Connected & Healthy
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                        <span className="text-muted small">Server Version</span>
                        <span className="small text-slate-700">
                          {systemInfo.database_details?.version ? systemInfo.database_details.version.slice(0, 30) : 'PostgreSQL 18.x'}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between py-2">
                        <span className="text-muted small">Query Latency</span>
                        <span className="badge bg-light text-dark border">
                          {systemInfo.database_details?.latency_ms !== undefined
                            ? `${systemInfo.database_details.latency_ms} ms`
                            : 'Normal (< 80ms)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Safety Backup & Sessions Card */}
                  <div className="col-12 col-md-6">
                    <div className="card border rounded-3 p-3 h-100 bg-white">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="p-2 rounded-2 bg-success bg-opacity-10 text-success">
                          <HardDrive size={20} />
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">Backup & Session Telemetry</h6>
                          <small className="text-muted">Local data preservation & token status</small>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                        <span className="text-muted small">Active User Sessions</span>
                        <span className="fw-bold text-primary">
                          {systemInfo.active_sessions_count || 1} active session(s)
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                        <span className="text-muted small">Local Safety Backup (SQLite)</span>
                        <span className="badge bg-success bg-opacity-10 text-success">
                          {systemInfo.backup_info?.exists ? 'Verified on Disk' : 'Preserved'}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                        <span className="text-muted small">Last Local Snapshot</span>
                        <span className="small text-slate-700">
                          {systemInfo.backup_info?.last_backup || 'Preserved at migration'}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between py-2">
                        <span className="text-muted small">Server UTC Timestamp</span>
                        <span className="small text-slate-700 font-monospace">
                          {systemInfo.server_time || new Date().toISOString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted small">
                  Connecting to database telemetry...
                </div>
              )}
            </div>
          )}

          {/* TAB 7: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div>
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
                <div>
                  <h5 className="fw-bold text-slate-800 mb-1">System Audit & Compliance Log</h5>
                  <p className="text-muted small mb-0">
                    Comprehensive audit trail recording logins, EMR updates, prescription creations, and configuration changes.
                  </p>
                </div>

                {/* Filters */}
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <div className="input-group input-group-sm" style={{ width: '220px' }}>
                    <span className="input-group-text bg-white border-end-0">
                      <Search size={14} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search description..."
                      value={auditSearch}
                      onChange={(e) => {
                        setAuditSearch(e.target.value)
                        setAuditPage(1)
                      }}
                    />
                  </div>

                  <select
                    className="form-select form-select-sm"
                    style={{ width: '160px' }}
                    value={auditEventType}
                    onChange={(e) => {
                      setAuditEventType(e.target.value)
                      setAuditPage(1)
                    }}
                  >
                    <option value="ALL">All Event Types</option>
                    <option value="USER_LOGIN">User Logins</option>
                    <option value="USER_LOGOUT">User Logouts</option>
                    <option value="PATIENT_CREATED">Patient Created</option>
                    <option value="DOCTOR_CREATED">Doctor Created</option>
                    <option value="PRESCRIPTION_CREATED">Prescription Created</option>
                    <option value="RECORD_FINALIZED">Record Finalized</option>
                    <option value="SETTINGS_UPDATED">Settings Updated</option>
                    <option value="PASSWORD_CHANGED">Password Changed</option>
                  </select>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={loadAuditLogs}
                    title="Refresh logs"
                  >
                    <RefreshCw size={14} className={loadingAudit ? 'spin-animation' : ''} />
                  </button>
                </div>
              </div>

              {/* Audit Table */}
              <div className="table-responsive rounded-3 border mb-3">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="small text-muted text-uppercase">
                      <th className="ps-3">Timestamp</th>
                      <th>Event Type</th>
                      <th>Description</th>
                      <th>Actor</th>
                      <th>Role</th>
                      <th className="pe-3">Entity Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="ps-3 text-muted small font-monospace">
                            {log.created_at ? log.created_at.replace('T', ' ').slice(0, 19) : 'N/A'}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border font-monospace" style={{ fontSize: '0.72rem' }}>
                              {log.event_type}
                            </span>
                          </td>
                          <td className="small text-slate-800" style={{ maxWidth: '300px' }}>
                            {log.description}
                          </td>
                          <td className="fw-semibold text-slate-700 small">{log.actor_name || 'System'}</td>
                          <td>
                            <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '0.7rem' }}>
                              {log.actor_role || 'System'}
                            </span>
                          </td>
                          <td className="pe-3 small text-muted">
                            {log.entity_type ? `${log.entity_type} #${log.entity_id || ''}` : 'System'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted small">
                          {loadingAudit ? 'Loading audit records...' : 'No activity logs found matching the filter.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {auditTotalPages > 1 && (
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-muted small">
                    Showing page {auditPage} of {auditTotalPages} ({auditTotal} total events)
                  </span>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                      disabled={auditPage <= 1}
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setAuditPage((p) => Math.min(auditTotalPages, p + 1))}
                      disabled={auditPage >= auditTotalPages}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
