// src/utils/logger.ts
import { supabase } from '@/config/supabase'

export const logSystemAction = async (action: string, details?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Usuário não autenticado')

    await supabase.from('system_logs').insert({
      action,
      details,
      user_id: user.id,
      ip_address: window.location.hostname,
      user_agent: navigator.userAgent
    })
  } catch (error) {
    console.error('Erro ao registrar log:', error)
  }
}