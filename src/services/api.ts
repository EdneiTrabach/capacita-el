import axios from 'axios'
import { supabase } from '../config/supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const session = await supabase.auth.getSession()
  if (session?.data?.session?.access_token) {
    config.headers.Authorization = `Bearer ${session.data.session.access_token}`
  }
  return config
})

// API endpoints
const endpoints = {
  certificados: {
    getAll: () => api.get('/certificados'),
    getById: (id: string) => api.get(`/certificados/${id}`),
    create: (data: any) => api.post('/certificados', data),
    update: (id: string, data: any) => api.put(`/certificados/${id}`, data),
    delete: (id: string) => api.delete(`/certificados/${id}`),
    emitir: (id: string) => api.put(`/certificados/${id}/emitir`),
    download: (id: string) => api.get(`/certificados/${id}/pdf`, { responseType: 'blob' })
  }
}

export default {
  ...endpoints,
  instance: api
}