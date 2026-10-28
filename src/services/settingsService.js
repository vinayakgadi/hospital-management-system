import axios from 'axios'
import { API_BASE_URL } from '../config.js'

export const settingsService = {
  // Get all app settings and system metadata
  getSettings: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/settings`)
    return res.data
  },

  // Update application settings
  updateSettings: async (settings) => {
    const res = await axios.put(`${API_BASE_URL}/api/admin/settings`, { settings })
    return res.data
  },

  // Get user directory with role and status filtering
  getUsers: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/users`, { params })
    return res.data
  },

  // Toggle user active status
  toggleUserStatus: async (userId, isActive) => {
    const res = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/status`, { is_active: isActive })
    return res.data
  },

  // Change administrator password
  changePassword: async (currentPassword, newPassword) => {
    const res = await axios.post(`${API_BASE_URL}/api/admin/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return res.data
  },

  // Update administrator profile details
  updateProfile: async (name, email) => {
    const res = await axios.put(`${API_BASE_URL}/api/admin/profile`, { name, email })
    return res.data
  },

  // Get administrative audit logs with pagination and filters
  getAuditLogs: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/audit-logs`, { params })
    return res.data
  },

  // Revoke all other active user sessions
  revokeAllSessions: async () => {
    const res = await axios.post(`${API_BASE_URL}/api/admin/sessions/revoke-all`)
    return res.data
  },

  // Get real-time system and database health
  getSystemHealth: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/system/health`)
    return res.data
  },
}
