import axios from 'axios'
import { API_BASE_URL } from '../config.js'

export const medicalRecordsService = {
  // Fetch summary cards metrics from SQLite
  getStats: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/medical-records/stats`)
    return res.data
  },

  // Fetch paginated, filtered, sorted medical records
  getRecords: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/medical-records`, { params })
    return res.data
  },

  // Fetch full details of a specific record
  getRecordById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/api/medical-records/${id}`)
    return res.data
  },

  // Create a new medical record (Draft or Finalized)
  createRecord: async (recordData) => {
    const res = await axios.post(`${API_BASE_URL}/api/medical-records`, recordData)
    return res.data
  },

  // Update an existing record (or draft)
  updateRecord: async (id, recordData) => {
    const res = await axios.put(`${API_BASE_URL}/api/medical-records/${id}`, recordData)
    return res.data
  },

  // Finalize a draft record
  finalizeRecord: async (id) => {
    const res = await axios.put(`${API_BASE_URL}/api/medical-records/${id}/finalize`)
    return res.data
  },

  // Fetch complete medical history for a patient
  getPatientHistory: async (patientId) => {
    const res = await axios.get(`${API_BASE_URL}/api/patients/${patientId}/medical-records`)
    return res.data
  },

  // Fetch diagnostic lab results for a patient
  getPatientLabs: async (patientId) => {
    const res = await axios.get(`${API_BASE_URL}/api/patients/${patientId}/lab-results`)
    return res.data
  },

  // Add a diagnostic lab result
  addLabResult: async (labData) => {
    const res = await axios.post(`${API_BASE_URL}/api/lab-results`, labData)
    return res.data
  },

  // Fetch doctors list for selection
  getDoctors: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/doctors`)
    return res.data
  },

  // Fetch patients list for selection
  getPatients: async () => {
    const res = await axios.get(`${API_BASE_URL}/patients`)
    return res.data
  },
}

export default medicalRecordsService
