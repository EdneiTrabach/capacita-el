import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Credenciais do Supabase não configuradas corretamente')
    throw new Error('Supabase credentials not configured')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'supabase-auth'
    },
    realtime: {
        timeout: 15000
    },
    global: {
        fetch: fetch.bind(globalThis),
        headers: { 'x-application-name': 'cursos-itilh' }
    }
})

// Verificação de conectividade
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth event:', event)
})