import { ref, computed, onMounted } from 'vue'
import { supabase } from '../config/supabase'
import { useRouter } from 'vue-router'
import { sanitizeHTML } from '@/utils/sanitize'

export function useListaCursosLogic() {
  const cursos = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchTerm = ref('')
  const statusFilter = ref('todos')
  const router = useRouter()
  
  // Adicionar estas variáveis para o modal de confirmação
  const showDeleteDialog = ref(false)
  const cursoToDelete = ref(null)

  const toast = ref({
    show: false,
    message: '',
    type: 'success'
  })

  const showToast = (message, type = 'success') => {
    toast.value = {
      show: true,
      message,
      type
    }
    setTimeout(() => {
      toast.value.show = false
    }, 3000)
  }

  // Verificar certificados
  const verificarCertificadosEmitidos = async (cursoId) => {
    try {
      const { data, error } = await supabase
        .from('certificados')
        .select('status')
        .eq('curso_id', cursoId)
        .eq('status', 'emitido')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (err) {
      console.error('Error checking certificates:', err)
      return false
    }
  }

  // Load courses from Supabase
  const loadCursos = async () => {
    try {
      loading.value = true
      
      // Limpar o cache antes de buscar novamente
      cursos.value = []
      
      // Dados de demonstração - treinamento fictício
      const treinamentoDemo = {
        id: 'demo-curso-001',
        nome: 'Segurança no Trabalho - NR10',
        descricao: 'Treinamento completo sobre segurança em instalações elétricas, conforme Norma Regulamentadora NR10. Aborda conceitos fundamentais, procedimentos de segurança e boas práticas.',
        duracao_horas: 40,
        data_inicio: '2024-02-01',
        data_fim: '2024-02-15',
        status: 'Em andamento',
        professor_responsavel: 'Prof. João Eduardo Santos',
        tipo: 'Presencial',
        vagas_totais: 25,
        created_at: new Date().toISOString(),
        modulos: [
          {
            id: 'mod-001',
            nome: 'Fundamentos da NR10',
            carga_horaria: 8
          },
          {
            id: 'mod-002',
            nome: 'Procedimentos de Segurança',
            carga_horaria: 12
          },
          {
            id: 'mod-003',
            nome: 'Primeiros Socorros',
            carga_horaria: 8
          },
          {
            id: 'mod-004',
            nome: 'Prática e Avaliação',
            carga_horaria: 12
          }
        ],
        matriculas: [
          { id: 'mat-001', status: 'ativo' },
          { id: 'mat-002', status: 'ativo' },
          { id: 'mat-003', status: 'ativo' }
        ],
        isDemo: true // Flag para identificar dados demo
      }

      // Simular carregamento do Supabase
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Em modo demo, retornar apenas o treinamento de demonstração
      cursos.value = [treinamentoDemo]
      
      // Opcional: Se você quiser manter dados reais + demo, descomente abaixo:
      /*
      const { data, error: supabaseError } = await supabase
        .from('cursos')
        .select(`
          *,
          modulos (
            id,
            nome,
            carga_horaria
          ),
          matriculas (
            id,
            status
          )
        `)
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError
    
      // Combinar dados reais com demo
      if (data) {
        cursos.value = [treinamentoDemo, ...data]
      }
      */
    
      console.log(`Cursos carregados: ${cursos.value.length} (incluindo demonstração)`)
    
    } catch (err) {
      console.error('Error loading courses:', err)
      // Em caso de erro, pelo menos mostrar o curso demo
      cursos.value = [{
        id: 'demo-curso-001',
        nome: 'Segurança no Trabalho - NR10',
        descricao: 'Treinamento completo sobre segurança em instalações elétricas.',
        duracao_horas: 40,
        data_inicio: '2024-02-01',
        data_fim: '2024-02-15',
        status: 'Em andamento',
        professor_responsavel: 'Prof. João Eduardo Santos',
        tipo: 'Presencial',
        modulos: [],
        matriculas: [],
        isDemo: true
      }]
      showToast('Carregando dados de demonstração', 'success')
      error.value = null // Limpar erro para não assustar na demo
    } finally {
      loading.value = false
    }
  }

  // Toggle Status
  const toggleStatus = async (curso, newStatus) => {
    try {
      if (curso.status === 'Finalizado' || newStatus === 'Finalizado') {
        const temCertificado = await verificarCertificadosEmitidos(curso.id)
        if (temCertificado) {
          showToast('Não é possível alterar o status de um curso que possui certificados emitidos', 'error')
          return
        }
      }

      const { error: updateError } = await supabase
        .from('cursos')
        .update({ status: newStatus })
        .eq('id', curso.id)

      if (updateError) throw updateError
      
      await loadCursos()
      showToast(`Status atualizado para ${newStatus}`)
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      showToast('Erro ao atualizar status', 'error')
    }
  }

  // Modificar a função deletarCurso para mostrar o modal
  const deletarCurso = async (id) => {
    // Encontrar o curso pelo ID para exibir informações no modal
    const curso = cursos.value.find(c => c.id === id)
    if (!curso) return
    
    // Armazenar o curso a ser excluído e mostrar o modal
    cursoToDelete.value = curso
    showDeleteDialog.value = true
  }

  // Modificar a função confirmDeleteCurso para resolver o problema com códigos_aula
  const confirmDeleteCurso = async () => {
    if (!cursoToDelete.value) return
    
    const id = cursoToDelete.value.id
    
    try {
      loading.value = true
      
      // 1. Primeiro verificar se há certificados emitidos
      const temCertificado = await verificarCertificadosEmitidos(id)
      if (temCertificado) {
        showToast('Não é possível excluir um curso que possui certificados emitidos', 'error')
        showDeleteDialog.value = false
        return
      }
      
      console.log('Curso ID a ser excluído:', id)
      
      // 2. Realizar exclusão direta do código de aula usando DELETE
      const { data: codigos } = await supabase
        .from('codigos_aula')
        .select('id')
        .eq('curso_id', id)
      
      console.log('Códigos a excluir:', codigos?.length || 0)
      
      if (codigos && codigos.length > 0) {
        // Vamos tentar uma abordagem direta via DELETE em vez de RPC
        try {
          const { error: deleteCodigosError } = await supabase
            .from('codigos_aula')
            .delete()
            .eq('curso_id', id)
            
          if (deleteCodigosError) {
            console.error('Erro ao excluir códigos via DELETE:', deleteCodigosError)
          }
        } catch (err) {
          console.error('Exceção ao excluir códigos:', err)
        }
      }
      
      // 3. Excluir outras relações
      await Promise.all([
        // Avaliações de reação
        supabase.from('avaliacoes_reacao').delete().eq('curso_id', id),
        
        // Certificados pendentes
        supabase.from('certificados').delete().eq('curso_id', id).neq('status', 'emitido'),
        
        // Lista de presença
        supabase.from('lista_presenca').delete().eq('curso_id', id),
        
        // Matrículas
        supabase.from('matriculas').delete().eq('curso_id', id),
        
        // Módulos
        supabase.from('modulos').delete().eq('curso_id', id)
      ])
      
      // 4. Verificação final e exclusão do curso
      try {
        // Tenta excluir o curso
        const { error: cursoError } = await supabase
          .from('cursos')
          .delete()
          .eq('id', id)
        
        if (cursoError) {
          console.error('Erro ao excluir curso:', cursoError)
          throw cursoError
        }
        
        // 5. Verificar se o curso ainda existe (confirmação explícita)
        const { data: cursoVerificacao } = await supabase
          .from('cursos')
          .select('id')
          .eq('id', id)
          .single()
        
        if (cursoVerificacao) {
          throw new Error('O curso não foi excluído completamente. Tente novamente.')
        }
      } catch (err) {
        // Se houver erro na exclusão normal, tente uma abordagem mais direta
        console.error('Erro na exclusão do curso, tentando SQL direto:', err)
        
        try {
          // Execute SQL direto como último recurso
          await supabase.rpc('excluir_curso_completo', { 
            curso_id_param: id
          })
          
          // Verificação final
          const { data: cursoFinal } = await supabase
            .from('cursos')
            .select('id')
            .eq('id', id)
            .single()
          
          if (cursoFinal) {
            throw new Error('Não foi possível excluir o curso mesmo após tentativa direta.')
          }
        } catch (finalErr) {
          console.error('Erro final na exclusão:', finalErr)
          throw finalErr
        }
      }
      
      // 6. Recarregar lista após deletar - implementando um mecanismo mais robusto
      cursos.value = cursos.value.filter(c => c.id !== id) // Remover localmente primeiro
      await loadCursos() // Depois atualiza do servidor
      showToast('Curso excluído com sucesso')
    } catch (err) {
      console.error('Erro ao excluir curso:', err)
      showToast(`Erro ao excluir curso: ${err.message || 'Tente novamente mais tarde'}`, 'error')
    } finally {
      loading.value = false
      showDeleteDialog.value = false
      cursoToDelete.value = null
    }
  }
  
  // Adicionar função para cancelar a exclusão
  const cancelDeleteCurso = () => {
    showDeleteDialog.value = false
    cursoToDelete.value = null
  }

  // Adicionar função editarCurso
  const editarCurso = (curso) => {
    router.push({
      name: 'CadastroCursos',
      params: { id: curso.id },
      query: { edit: 'true' }
    })
  }

  const formatDate = (date) => {
    if (!date) return '--'
    try {
      return date.split('T')[0].split('-').reverse().join('/')
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return '--'
    }
  }

  const cursosFiltrados = computed(() => {
    return cursos.value.filter(curso => {
      const matchSearch = !searchTerm.value ||
        curso.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        curso.descricao?.toLowerCase().includes(searchTerm.value.toLowerCase())

      const matchStatus = !statusFilter.value || curso.status === statusFilter.value

      return matchSearch && matchStatus
    })
  })

  onMounted(() => {
    loadCursos()
  })

  return {
    cursos,
    cursosFiltrados,
    loading,
    error,
    searchTerm,
    statusFilter,
    loadCursos,
    toggleStatus,
    deletarCurso,
    editarCurso, // Função adicionada
    formatDate,
    sanitizeHTML,
    toast,
    showToast,
    // Adicionar as novas variáveis e funções ao retorno
    showDeleteDialog,
    cursoToDelete,
    confirmDeleteCurso,
    cancelDeleteCurso
  }
}
