// API Configuration
// Points to the local Python Flask API server by default, or an environment variable override
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default API_BASE_URL
