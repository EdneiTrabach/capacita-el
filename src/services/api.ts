import { createClient } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'

// Create api object with Supabase methods
const api = {
  // Generic CRUD operations
  get: async (table: string) => {
    const { data, error } = await supabase
      .from(table)
      .select()
    if (error) throw error
    return { data }
  },

  getById: async (table: string, id: string) => {
    const { data, error } = await supabase
      .from(table)
      .select()
      .eq('id', id)
      .single()
    if (error) throw error
    return { data }
  },

  post: async (table: string, payload: any) => {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return { data }
  },

  put: async (table: string, id: string, payload: any) => {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return { data }
  },

  delete: async (table: string, id: string) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    if (error) throw error
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
      const { data, error } = await supabase
        .from('certificados')
        .update({ status: 'emitido', data_emissao: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      return { data }
    }
  }
}

export const setorService = {
  async listarSetores() {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .order('nome')
    
    if (error) throw error
    return data
  },

  async cadastrarSetor(nome: string) {
    const { data, error } = await supabase
      .from('setores')
      .insert({ nome })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const usuariosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { data }
  },
  
  async update(id: string, userData: any) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(userData)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return { data }
  },
  
  async delete(id: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { data }
  }
}

// Export default api
export default api

// Export other services
export const certificadosService = { /* ... */ }