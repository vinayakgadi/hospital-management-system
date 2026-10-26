// API Configuration
// When set to '' (empty string), requests use Vite's internal development proxy (/patients -> http://127.0.0.1:5000)
// This avoids CORS restrictions and allows seamless local communication.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : ''

export default API_BASE_URL
