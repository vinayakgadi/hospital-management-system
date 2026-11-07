import axios from 'axios'
import { API_BASE_URL } from '../config.js'

export const prescriptionsService = {
  // Get summary card counts from backend
  getStats: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/prescriptions/stats`)
    return res.data
  },

  // Get paginated, filtered, sorted prescriptions
  getPrescriptions: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/prescriptions`, { params })
    return res.data
  },

  // Get single prescription details with amendments
  getPrescriptionById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/api/prescriptions/${id}`)
    return res.data
  },

  // Create new prescription(s)
  createPrescription: async (data) => {
    const res = await axios.post(`${API_BASE_URL}/api/prescriptions`, data)
    return res.data
  },

  // Update prescription (status or clinical details with amendment reason)
  updatePrescription: async (id, data) => {
    const res = await axios.put(`${API_BASE_URL}/api/prescriptions/${id}`, data)
    return res.data
  },

  // Get amendment history for a prescription
  getAmendments: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/api/prescriptions/${id}`)
    return res.data.amendments || []
  },
}
