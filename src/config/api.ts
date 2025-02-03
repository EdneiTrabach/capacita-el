// src/config/api.ts

// Get the API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Export as default and named export
export { API_URL }
export default API_URL