import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/config/supabase'
import { logSystemAction } from '@/utils/logger'
import type { Presenca } from './types'

export function useListaPresenca() {
  const route = useRoute()
  const cursoId = route.params.id
  const presencas = ref<Presenca[]>([])
  const loading = ref(true)
  const error = ref('')
  const success = ref('')
  const dataAula = ref(new Date().toISOString().split('T')[0])

  const loadPresencas = async () => {
    try {
      loading.value = true
      const { data, error: loadError } = await supabase
        .from('lista_presenca')
        .select(`
          *,
          alunos:usuarios(nome)
        `)
        .eq('curso_id', cursoId)
        .order('data_aula', { ascending: false })

      if (loadError) throw loadError
      presencas.value = data || []
    } catch (err) {
      console.error('Erro ao carregar presenças:', err)
      error.value = 'Erro ao carregar dados'
    } finally {
      loading.value = false
    }
  }

  const registrarPresenca = async () => {
    try {
      loading.value = true
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Usuário não autenticado')

      const { data: presencaExistente } = await supabase
        .from('lista_presenca')
        .select('*')
        .eq('aluno_id', user.id)
        .eq('curso_id', cursoId)
        .eq('data_aula', dataAula.value)
        .single()

      if (presencaExistente) {
        error.value = 'Presença já registrada para hoje'
        return
      }

      const { error: insertError } = await supabase
        .from('lista_presenca')
        .insert({
          aluno_id: user.id,
          curso_id: cursoId,
          data_aula: dataAula.value,
          ip_registro: window.location.hostname
        })

      if (insertError) throw insertError

      await logSystemAction('registro_presenca', {
        curso_id: cursoId,
        data_aula: dataAula.value
      })

      success.value = 'Presença registrada com sucesso!'
      await loadPresencas()
    } catch (err) {
      console.error('Erro ao registrar presença:', err)
      error.value = 'Erro ao registrar presença'
    } finally {
      loading.value = false
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  onMounted(() => {
    loadPresencas()
  })

  return {
    presencas,
    loading,
    error,
    success,
    registrarPresenca,
    formatDate
  }
}
