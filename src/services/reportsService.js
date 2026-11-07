import axios from 'axios'
import { API_BASE_URL } from '../config.js'

export const reportsService = {
  // Get overview administrative report metrics
  getOverview: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/reports/overview`)
    return res.data
  },

  // Get patient analytics with optional date filter
  getPatientAnalytics: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/reports/patients`, { params })
    return res.data
  },

  // Get appointment analytics with optional date filter
  getAppointmentAnalytics: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/reports/appointments`, { params })
    return res.data
  },

  // Get doctor workload and analytics
  getDoctorAnalytics: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/reports/doctors`)
    return res.data
  },

  // Get medical records analytics
  getMedicalRecordsAnalytics: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/reports/medical-records`)
    return res.data
  },

  // Download real CSV export file
  downloadExport: async (type = 'patients') => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/reports/export`, {
      params: { type },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `healthpulse_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
