import { ref, computed, onMounted } from 'vue'
import { supabase } from '../config/supabase'
import { useRouter } from 'vue-router'
import { sanitizeHTML } from '@/utils/sanitize'

export function useListaCursosLogic() {
  const cursos = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchTerm = ref('')
  const statusFilter = ref('')
  const router = useRouter()

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
      cursos.value = data
    } catch (err) {
      console.error('Error loading courses:', err)
      error.value = 'Erro ao carregar cursos'
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

  // Adicionar função deletarCurso
  const deletarCurso = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      // Recarregar lista após deletar
      await loadCursos()
      showToast('Curso excluído com sucesso')
    } catch (err) {
      console.error('Erro ao excluir curso:', err)
      showToast('Erro ao excluir curso', 'error')
    }
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
    showToast
  }
}
