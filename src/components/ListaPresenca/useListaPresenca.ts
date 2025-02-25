import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/config/supabase'
import { presencaService } from '@/services/presencaService'
import { logSystemAction } from '@/utils/logger'
import type { Presenca } from '@/types/presenca' // Atualizar import aqui

export function useListaPresenca() {
  const route = useRoute()
  const cursoId = route.params.id
  const cursoNome = ref('')
  const dataAula = ref('') // Adicione esta linha
  const presencas = ref<Presenca[]>([])
  const loading = ref(false)
  const error = ref('')
  const success = ref('')
  const cursoStatus = ref('')
  const qrCode = ref('')
  const filtros = ref({
    dataAula: new Date().toISOString().split('T')[0] // Data atual como valor inicial
  })

  const loadPresencas = async () => {
    try {
      const { data, error } = await supabase
        .from('lista_presenca')
        .select(`
          *,
          aluno:usuarios(nome)
        `)
        .eq('curso_id', cursoId)
        .eq('data_aula', filtros.value.dataAula) // Usar o filtro aqui
        .order('horario_registro', { ascending: false })

      if (error) throw error
      presencas.value = data
    } catch (err) {
      console.error('Erro ao carregar presenças:', err)
      error.value = 'Erro ao carregar lista de presença'
    }
  }

  const verificarStatusCurso = async () => {
    try {
      const { data, error: statusError } = await supabase
        .from('cursos')
        .select('status')
        .eq('id', cursoId)
        .single()

      if (statusError) throw statusError

      if (data?.status !== 'Em andamento') {
        error.value = 'Lista de presença disponível apenas para cursos em andamento'
        return false
      }

      return true
    } catch (err) {
      console.error('Erro ao verificar status do curso:', err)
      error.value = 'Erro ao verificar status do curso'
      return false
    }
  }

  const registrarPresenca = async () => {
    try {
      loading.value = true
      error.value = ''
      success.value = ''

      const cursoAtivo = await verificarStatusCurso()
      if (!cursoAtivo) {
        return
      }

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
      error.value = err instanceof Error ? err.message : 'Erro ao registrar presença'
    } finally {
      loading.value = false
    }
  }

  const gerarQRCode = async () => {
    try {
      loading.value = true
      error.value = ''
      
      // Certifique-se que cursoId é uma string
      const cursoIdString = Array.isArray(cursoId) ? cursoId[0] : cursoId
      const dataAulaAtual = new Date().toISOString().split('T')[0]
      
      qrCode.value = await presencaService.gerarCodigoAula(cursoIdString, dataAulaAtual)
      
      setTimeout(() => {
        qrCode.value = ''
      }, 15 * 60 * 1000)
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err)
      error.value = 'Erro ao gerar QR Code'
    } finally {
      loading.value = false
    }
  }

  // Funções auxiliares para formatação
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('pt-BR')
  }

  // Modificar a função buscarStatusCurso para carregar o status do curso
  const buscarStatusCurso = async () => {
    try {
      const { data, error: statusError } = await supabase
        .from('cursos')
        .select('status')
        .eq('id', cursoId)
        .single()

      if (statusError) throw statusError
      cursoStatus.value = data?.status || ''
    } catch (err) {
      console.error('Erro ao buscar status do curso:', err)
      error.value = 'Erro ao verificar status do curso'
    }
  }

  const buscarCurso = async () => {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('nome, status')
        .eq('id', cursoId)
        .single()

      if (error) throw error
      
      cursoNome.value = data.nome  // Adicione esta linha
      cursoStatus.value = data.status
    } catch (err) {
      console.error('Erro ao buscar curso:', err)
      error.value = 'Erro ao carregar informações do curso'
    }
  }

  // Chame buscarStatusCurso no onMounted
  onMounted(async () => {
    await buscarCurso()  // Modifique para chamar buscarCurso
    await loadPresencas() // Depois carrega as presenças
  })

  return {
    presencas,
    loading,
    error,
    success,
    cursoStatus,
    cursoNome,  // Adicione esta linha
    qrCode,
    registrarPresenca,
    gerarQRCode,
    formatDate,
    filtros, // Adicionar filtros ao retorno
    loadPresencas // Opcional: exportar loadPresencas se precisar chamar manualmente
  }
}
