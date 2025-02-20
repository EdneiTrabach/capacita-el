import { ref } from 'vue'
import { supabase } from '@/config/supabase'

export function useUsuarios() {
  const usuarios = ref([])
  const loading = ref(false)
  const error = ref(null)
  const setores = ref([])

  const toast = ref({
    show: false,
    message: '',
    type: 'success'
  })

  const loadUsuarios = async () => {
    try {
      loading.value = true
      console.log('Iniciando carregamento de usuários...')

      const { data, error: err } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err

      usuarios.value = data
      console.log('Usuários carregados:', usuarios.value)

    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
      error.value = 'Erro ao carregar usuários'
    } finally {
      loading.value = false
    }
  }

  const loadSetores = async () => {
    try {
      const { data, error: err } = await supabase
        .from('setores')
        .select('*')
        .order('nome')

      if (err) throw err
      setores.value = data

    } catch (err) {
      console.error('Erro ao carregar setores:', err)
    }
  }

  return {
    usuarios,
    loading,
    error,
    toast,
    setores,
    loadUsuarios,
    loadSetores
  }
}