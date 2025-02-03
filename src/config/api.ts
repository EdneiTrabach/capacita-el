// src/config/api.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// You can also export other API related configurations
export const API_CONFIG = {
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}

export default API_URL