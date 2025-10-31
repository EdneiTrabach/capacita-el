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
      // 🎯 DADOS DE DEMONSTRAÇÃO - alunos já matriculados
      const matriculasDemo = [
        {
          id: 'demo-matricula-001',
          aluno: {
            id: 'demo-aluno-matriculado-001',
            nome: 'Lucas Gabriel Ferreira',
            email: 'lucas.ferreira@empresa.com'
          },
          data_matricula: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
          status: 'ativo',
          isDemo: true
        },
        {
          id: 'demo-matricula-002',
          aluno: {
            id: 'demo-aluno-matriculado-002',
            nome: 'Mariana Souza Silva',
            email: 'mariana.silva@empresa.com'
          },
          data_matricula: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
          status: 'ativo',
          isDemo: true
        },
        {
          id: 'demo-matricula-003',
          aluno: {
            id: 'demo-aluno-matriculado-003',
            nome: 'Rafael Costa Pereira',
            email: 'rafael.pereira@empresa.com'
          },
          data_matricula: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
          status: 'ativo',
          isDemo: true
        }
      ]

      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 400))
      
      matriculas.value = matriculasDemo
    } catch (error) {
      console.error('Erro ao carregar matrículas:', error)
      matriculas.value = []
    }
  }

  const buscarAlunosDisponiveis = async () => {
    if (!cursoSelecionado.value) return
    
    try {
      // 🎯 DADOS DE DEMONSTRAÇÃO - alunos fictícios disponíveis para matrícula
      const alunosDemo = [
        {
          id: 'demo-aluno-001',
          nome: 'Carlos Eduardo Mendes',
          email: 'carlos.mendes@empresa.com',
          setor: 'Operações',
          status: 'ativo',
          isDemo: true
        },
        {
          id: 'demo-aluno-002',
          nome: 'Fernanda Costa Lima',
          email: 'fernanda.lima@empresa.com',
          setor: 'Qualidade',
          status: 'ativo',
          isDemo: true
        },
        {
          id: 'demo-aluno-003',
          nome: 'Roberto Silva Santos',
          email: 'roberto.santos@empresa.com',
          setor: 'Manutenção',
          status: 'ativo',
          isDemo: true
        },
        {
          id: 'demo-aluno-004',
          nome: 'Patricia Oliveira',
          email: 'patricia.oliveira@empresa.com',
          setor: 'Segurança do Trabalho',
          status: 'ativo',
          isDemo: true
        },
        {
          id: 'demo-aluno-005',
          nome: 'Anderson Rodrigues',
          email: 'anderson.rodrigues@empresa.com',
          setor: 'Elétrica',
          status: 'ativo',
          isDemo: true
        }
      ]

      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Em modo demo, usar apenas alunos de demonstração
      alunosDisponiveis.value = alunosDemo
      
      await loadMatriculas()
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
      // Em caso de erro, mostrar pelo menos alguns alunos demo
      alunosDisponiveis.value = [
        {
          id: 'demo-aluno-001',
          nome: 'Carlos Eduardo Mendes',
          email: 'carlos.mendes@empresa.com',
          setor: 'Operações',
          status: 'ativo',
          isDemo: true
        }
      ]
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
