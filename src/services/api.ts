import axios from 'axios'
import { supabase } from '../config/supabase' // Add this import
import { API_URL, API_CONFIG } from '../config/api'

const api = axios.create(API_CONFIG)

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const session = await supabase.auth.getSession()
  if (session?.data?.session?.access_token) {
    config.headers.Authorization = `Bearer ${session.data.session.access_token}`
  }
  return config
})

// API endpoints
export const certificadosService = {
  getAll: () => api.get('/certificados'),
  getById: (id: string) => api.get(`/certificados/${id}`),
  create: (data: any) => api.post('/certificados', data),
  update: (id: string, data: any) => api.put(`/certificados/${id}`, data),
  delete: (id: string) => api.delete(`/certificados/${id}`),
  download: (id: string) => api.get(`/certificados/${id}/pdf`, { responseType: 'blob' }),
  emitir: (id: string) => api.put(`/certificados/${id}/emitir`)
}

export { api }
export default api