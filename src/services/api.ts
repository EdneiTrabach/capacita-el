import axios from 'axios'
import { API_URL } from '../config/api'

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Create api object with Axios methods
const api = {
  // Generic CRUD operations
  get: async (endpoint: string) => {
    const response = await axiosInstance.get(`/${endpoint}`)
    return { data: response.data }
  },

  getById: async (endpoint: string, id: string) => {
    const response = await axiosInstance.get(`/${endpoint}/${id}`)
    return { data: response.data }
  },

  post: async (endpoint: string, payload: any) => {
    const response = await axiosInstance.post(`/${endpoint}`, payload)
    return { data: response.data }
  },

  put: async (endpoint: string, id: string, payload: any) => {
    const response = await axiosInstance.put(`/${endpoint}/${id}`, payload)
    return { data: response.data }
  },

  delete: async (endpoint: string, id: string) => {
    await axiosInstance.delete(`/${endpoint}/${id}`)
    return { success: true }
  },

  // Specific endpoints
  certificados: {
    getAll: () => api.get('certificados'),
    getById: (id: string) => api.getById('certificados', id),
    create: (data: any) => api.post('certificados', data),
    update: (id: string, data: any) => api.put('certificados', id, data),
    delete: (id: string) => api.delete('certificados', id),
    emitir: async (id: string) => {
      const response = await axiosInstance.put(`/certificados/${id}/emitir`, {
        status: 'emitido',
        data_emissao: new Date().toISOString()
      })
      return { data: response.data }
    }
  }
}

// Add response interceptor for consistent error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export { api }
export default api