import axios from 'axios'
import { API_BASE_URL } from '../config.js'

export const patientService = {
  // Dashboard & Metrics
  getDashboard: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/dashboard`)
    return res.data
  },

  // Patient Profile
  getProfile: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/me`)
    return res.data
  },

  updateProfile: async (profileData) => {
    const res = await axios.put(`${API_BASE_URL}/api/patient/profile`, profileData)
    return res.data
  },

  // Appointments
  getAppointments: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/appointments`, { params })
    return res.data
  },

  bookAppointment: async (appointmentData) => {
    const res = await axios.post(`${API_BASE_URL}/api/patient/appointments`, appointmentData)
    return res.data
  },

  cancelAppointment: async (appointmentId) => {
    const res = await axios.put(`${API_BASE_URL}/api/patient/appointments/${appointmentId}/cancel`)
    return res.data
  },

  // Doctors Directory
  getDoctors: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/doctors`, { params })
    return res.data
  },

  // Medical Records (Only Finalized records are retrieved for patients)
  getMedicalRecords: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/medical-records`, { params })
    return res.data
  },

  getMedicalRecordById: async (recordId) => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/medical-records/${recordId}`)
    return res.data
  },

  requestCorrection: async (recordId, data) => {
    const res = await axios.post(`${API_BASE_URL}/api/patient/medical-records/${recordId}/correction-request`, data)
    return res.data
  },

  getCorrectionRequests: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/correction-requests`)
    return res.data
  },

  // Prescriptions
  getPrescriptions: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/prescriptions`, { params })
    return res.data
  },

  getPrescriptionById: async (prescriptionId) => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/prescriptions/${prescriptionId}`)
    return res.data
  },

  // Lab Diagnostics Results
  getLabResults: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/lab-results`, { params })
    return res.data
  },

  // Notifications
  getNotifications: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/patient/notifications`, { params })
    return res.data
  },

  markNotificationRead: async (notifId) => {
    const res = await axios.put(`${API_BASE_URL}/api/patient/notifications/${notifId}/read`)
    return res.data
  },

  markAllNotificationsRead: async () => {
    const res = await axios.post(`${API_BASE_URL}/api/patient/notifications/read-all`)
    return res.data
  },

  // Account Security
  changePassword: async (passwordData) => {
    const res = await axios.post(`${API_BASE_URL}/api/patient/change-password`, passwordData)
    return res.data
  },
}
