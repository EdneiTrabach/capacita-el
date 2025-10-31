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
      loading.value = true
      error.value = ''

      // 🎯 DADOS DE DEMONSTRAÇÃO - registros de presença
      const presencasDemo = [
        {
          id: 'demo-presenca-001',
          aluno_id: 'demo-aluno-matriculado-001',
          aluno_nome: 'Lucas Gabriel Ferreira',
          curso_id: cursoId,
          data_aula: new Date().toISOString().split('T')[0], // Hoje
          horario_registro: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
          status: 'presente',
          feedback: '5',
          comentarios: 'Excelente treinamento, muito esclarecedor sobre segurança elétrica.',
          isDemo: true
        },
        {
          id: 'demo-presenca-002',
          aluno_id: 'demo-aluno-matriculado-002',
          aluno_nome: 'Mariana Souza Silva',
          curso_id: cursoId,
          data_aula: new Date().toISOString().split('T')[0], // Hoje
          horario_registro: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5h atrás
          status: 'presente',
          feedback: '4',
          comentarios: 'Conteúdo muito importante para nossa área de trabalho.',
          isDemo: true
        },
        {
          id: 'demo-presenca-003',
          aluno_id: 'demo-aluno-matriculado-003',
          aluno_nome: 'Rafael Costa Pereira',
          curso_id: cursoId,
          data_aula: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ontem
          horario_registro: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // Ontem
          status: 'presente',
          feedback: '5',
          comentarios: 'Professor muito experiente, aprendi muito sobre NR10.',
          isDemo: true
        },
        {
          id: 'demo-presenca-004',
          aluno_id: 'demo-aluno-004',
          aluno_nome: 'Carlos Eduardo Mendes',
          curso_id: cursoId,
          data_aula: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0], // Anteontem
          horario_registro: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
          status: 'presente',
          feedback: '4',
          comentarios: 'Ótima didática do instrutor.',
          isDemo: true
        }
      ]

      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 700))
      
      presencas.value = presencasDemo
    } catch (err) {
      console.error('Erro ao carregar presenças:', err)
      error.value = 'Erro ao carregar lista de presença'
      // Mostrar pelo menos uma presença demo em caso de erro
      presencas.value = [{
        id: 'demo-presenca-001',
        aluno_nome: 'Lucas Gabriel Ferreira',
        data_aula: new Date().toISOString().split('T')[0],
        horario_registro: new Date().toISOString(),
        status: 'presente',
        isDemo: true
      }]
    } finally {
      loading.value = false
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
      success.value = ''
      
      // Certifique-se que cursoId é uma string
      const cursoIdString = Array.isArray(cursoId) ? cursoId[0] : cursoId
      
      // Use a data do filtro ou a data atual
      const dataAulaAtual = filtros.value.dataAula || new Date().toISOString().split('T')[0]
      
      qrCode.value = await presencaService.gerarCodigoAula(cursoIdString, dataAulaAtual)
      
      // Adiciona uma mensagem de sucesso
      success.value = 'QR Code gerado com sucesso! Validade: 15 minutos'
      
      // Limpeza automática após 15 minutos
      setTimeout(() => {
        if (qrCode.value) {
          qrCode.value = ''
          success.value = ''
        }
      }, 15 * 60 * 1000)
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err)
      error.value = 'Erro ao gerar QR Code. Por favor, tente novamente.'
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
