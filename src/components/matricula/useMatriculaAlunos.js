import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/config/supabase'

export function useMatriculaAlunos() {
  const showDeleteMatriculaDialog = ref(false)
  const matriculaToDelete = ref(null)
  
  const route = useRoute()
  const cursoId = route.params.cursoId
  const cursoSelecionado = ref(cursoId)
  const cursos = ref([])
  const alunosDisponiveis = ref([])
  const matriculas = ref([])
  const alunosSelecionados = ref([])
  const searchTerm = ref('')
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  const alunosFiltrados = computed(() => {
    if (!searchTerm.value) return alunosDisponiveis.value
    
    return alunosDisponiveis.value.filter(aluno => 
      aluno.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      aluno.email.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  })

  const loadCurso = async () => {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', cursoId)
        .single()

      if (error) throw error
      cursos.value = [data]
    } catch (error) {
      console.error('Erro ao carregar curso:', error)
    }
  }

  const loadMatriculas = async () => {
    try {
      const { data, error } = await supabase
        .from('matriculas')
        .select(`
          id,
          aluno:usuarios(id, nome, email)
        `)
        .eq('curso_id', cursoSelecionado.value)

      if (error) throw error
      matriculas.value = data
    } catch (error) {
      console.error('Erro ao carregar matrículas:', error)
    }
  }

  const buscarAlunosDisponiveis = async () => {
    if (!cursoSelecionado.value) return
    
    try {
      const { data: matriculadosData } = await supabase
        .from('matriculas')
        .select('aluno_id')
        .eq('curso_id', cursoSelecionado.value)

      const alunosMatriculados = matriculadosData?.map(m => m.aluno_id) || []

      const { data: alunos, error } = await supabase
        .from('usuarios')
        .select('id, nome, email')
        .eq('status', 'ativo')
        .not('id', 'in', `(${alunosMatriculados.join(',')})`)

      if (error) throw error
      alunosDisponiveis.value = alunos

      await loadMatriculas()
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
    }
  }

  const toggleAluno = (alunoId) => {
    const index = alunosSelecionados.value.indexOf(alunoId)
    if (index === -1) {
      alunosSelecionados.value.push(alunoId)
    } else {
      alunosSelecionados.value.splice(index, 1)
    }
  }

  const matricularAlunos = async () => {
    if (!alunosSelecionados.value.length) return
    
    try {
      loading.value = true
      error.value = ''
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Usuário não autenticado')

      const matriculasData = alunosSelecionados.value.map(alunoId => ({
        curso_id: cursoSelecionado.value,
        aluno_id: alunoId,
        status: 'ativo',
        data_matricula: new Date().toISOString()
      }))

      const { error: insertError } = await supabase
        .from('matriculas')
        .insert(matriculasData)

      if (insertError) throw insertError

      success.value = 'Alunos matriculados com sucesso!'
      await buscarAlunosDisponiveis()
      alunosSelecionados.value = []
    } catch (err) {
      console.error('Erro ao matricular alunos:', err)
      error.value = err.message || 'Erro ao matricular alunos'
    } finally {
      loading.value = false
    }
  }

  const removerMatricula = async (matriculaId) => {
    const matricula = matriculas.value.find(m => m.id === matriculaId)
    if (!matricula) return
    
    matriculaToDelete.value = matricula
    showDeleteMatriculaDialog.value = true
  }

  const confirmRemoverMatricula = async () => {
    if (!matriculaToDelete.value) return

    try {
      loading.value = true
      const { error } = await supabase
        .from('matriculas')
        .delete()
        .eq('id', matriculaToDelete.value.id)

      if (error) throw error

      success.value = 'Matrícula removida com sucesso!'
      await buscarAlunosDisponiveis()
      showDeleteMatriculaDialog.value = false
    } catch (error) {
      console.error('Erro ao remover matrícula:', error)
      error.value = 'Erro ao remover matrícula'
    } finally {
      loading.value = false
      matriculaToDelete.value = null
    }
  }

  onMounted(() => {
    loadCurso()
    buscarAlunosDisponiveis()
  })

  return {
    cursos,
    cursoSelecionado,
    alunosFiltrados,
    matriculas,
    alunosSelecionados,
    searchTerm,
    loading,
    error,
    success,
    toggleAluno,
    matricularAlunos,
    removerMatricula,
    confirmRemoverMatricula,
    showDeleteMatriculaDialog,
    matriculaToDelete
  }
}
