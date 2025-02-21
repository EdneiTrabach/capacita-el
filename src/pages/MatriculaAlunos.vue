<!-- src/pages/MatriculaAlunos.vue -->
<template>
  <div class="matricula-container">
    <h1>Matrícula de Alunos</h1>

    <div class="filters">
      <div class="filter-group">
        <label>Selecione o Curso</label>
        <select v-model="cursoSelecionado" @change="buscarAlunosDisponiveis">
          <option value="">Selecione um curso</option>
          <option v-for="curso in cursos" :key="curso.id" :value="curso.id">
            {{ curso.nome }} ({{ curso.status }})
          </option>
        </select>
      </div>
    </div>

    <div v-if="cursoSelecionado" class="matricula-grid">
      <div class="alunos-disponiveis">
        <h3>Alunos Disponíveis</h3>
        <input 
          v-model="searchTerm" 
          placeholder="Buscar alunos..."
          type="text"
        />
        <div class="alunos-list">
          <div 
            v-for="aluno in alunosFiltrados" 
            :key="aluno.id"
            class="aluno-item"
            :class="{ selected: alunosSelecionados.includes(aluno.id) }"
            @click="toggleAluno(aluno.id)"
          >
            {{ aluno.nome }}
            <span class="email">{{ aluno.email }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button 
          @click="matricularAlunos" 
          :disabled="loading || !alunosSelecionados.length"
          class="btn-matricular"
        >
          {{ loading ? 'Matriculando...' : 'Matricular Selecionados' }}
        </button>
      </div>

      <div class="alunos-matriculados">
        <h3>Alunos Matriculados</h3>
        <div class="matriculados-list">
          <div 
            v-for="matricula in matriculas" 
            :key="matricula.id" 
            class="matricula-item"
          >
            {{ matricula.aluno.nome }}
            <button 
              @click="removerMatricula(matricula.id)"
              class="btn-remove"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'

const cursoSelecionado = ref('')
const cursos = ref([])
const alunosDisponiveis = ref([])
const matriculas = ref([])
const alunosSelecionados = ref([])
const searchTerm = ref('')
const loading = ref(false)

// Filtra alunos com base na busca
const alunosFiltrados = computed(() => {
  if (!searchTerm.value) return alunosDisponiveis.value
  
  return alunosDisponiveis.value.filter(aluno => 
    aluno.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    aluno.email.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Carrega cursos disponíveis
const loadCursos = async () => {
  try {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    cursos.value = data
  } catch (error) {
    console.error('Erro ao carregar cursos:', error)
  }
}

// Busca alunos disponíveis para matrícula
const buscarAlunosDisponiveis = async () => {
  if (!cursoSelecionado.value) return
  
  try {
    // Busca alunos já matriculados
    const { data: matriculadosData } = await supabase
      .from('matriculas')
      .select('aluno_id')
      .eq('curso_id', cursoSelecionado.value)

    const alunosMatriculados = matriculadosData?.map(m => m.aluno_id) || []

    // Busca todos os alunos ativos que não estão matriculados
    const { data: alunos, error } = await supabase
      .from('usuarios')
      .select('id, nome, email')
      .eq('status', 'ativo')
      .not('id', 'in', `(${alunosMatriculados.join(',')})`)

    if (error) throw error
    alunosDisponiveis.value = alunos

    // Carrega matrículas existentes
    await loadMatriculas()
  } catch (error) {
    console.error('Erro ao buscar alunos:', error)
  }
}

// Carrega matrículas do curso
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

// Toggle seleção de aluno
const toggleAluno = (alunoId) => {
  const index = alunosSelecionados.value.indexOf(alunoId)
  if (index === -1) {
    alunosSelecionados.value.push(alunoId)
  } else {
    alunosSelecionados.value.splice(index, 1)
  }
}

// Matricula alunos selecionados
const matricularAlunos = async () => {
  if (!alunosSelecionados.value.length) return
  
  try {
    loading.value = true
    const matriculasData = alunosSelecionados.value.map(alunoId => ({
      curso_id: cursoSelecionado.value,
      aluno_id: alunoId,
      status: 'ativo',
      data_matricula: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('matriculas')
      .insert(matriculasData)

    if (error) throw error

    // Recarrega os dados
    await buscarAlunosDisponiveis()
    alunosSelecionados.value = []
  } catch (error) {
    console.error('Erro ao matricular alunos:', error)
  } finally {
    loading.value = false
  }
}

// Remove matrícula
const removerMatricula = async (matriculaId) => {
  if (!confirm('Deseja realmente remover esta matrícula?')) return

  try {
    const { error } = await supabase
      .from('matriculas')
      .delete()
      .eq('id', matriculaId)

    if (error) throw error

    await buscarAlunosDisponiveis()
  } catch (error) {
    console.error('Erro ao remover matrícula:', error)
  }
}

// Carrega dados iniciais
loadCursos()
</script>

<style scoped>
.matricula-container {
  padding: 2rem;
}

.matricula-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.alunos-list, .matriculados-list {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.aluno-item, .matricula-item {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.aluno-item:hover {
  background-color: #f8f9fa;
}

.aluno-item.selected {
  background-color: #e3f2fd;
}

.email {
  font-size: 0.85rem;
  color: #666;
}

.btn-matricular {
  padding: 1rem 2rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-remove {
  padding: 0.25rem 0.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
}

.filters {
  margin-bottom: 2rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.filter-group select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>