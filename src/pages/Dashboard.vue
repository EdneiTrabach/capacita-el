<template>
  <div class="dashboard">
    <div v-if="error" class="toast-error">
      {{ error }}
      <button class="close-btn" @click="error = null">&times;</button>
    </div>
    <div v-else-if="loading" class="loading">
      Carregando...
    </div>
    
    <header class="dashboard-header">
      <div class="header-content">
        <img src="/dashboard.svg" alt="Dashboard Icon" class="dashboard-icon" />
        <h1>Dashboard</h1>
        <button @click="atualizarDados" class="refresh-btn">
          <img src="/public/icons/cursando.svg" alt="Atualizar" class="icon-black" />
          Atualizar Dados
        </button>
      </div>
    </header>

    <div class="filters-container">
      <h2 class="filters-title">Filtros</h2>
      
      <div class="filters-row">
        <div class="filter-group">
          <label>Período</label>
          <div class="date-range">
            <div class="date-input">
              <span class="date-icon">📅</span>
              <input 
                type="date" 
                v-model="filtros.dataInicio"
                :max="filtros.dataFim || undefined"
              >
            </div>
            <span class="date-separator">até</span>
            <div class="date-input">
              <span class="date-icon">📅</span>
              <input 
                type="date" 
                v-model="filtros.dataFim"
                :min="filtros.dataInicio || undefined"
              >
            </div>
          </div>
        </div>

        <div class="filter-group">
          <label>Status do Treinamento</label>
          <div class="select-wrapper">
            <select v-model="filtros.statusCurso">
              <option value="">Todos</option>
              <option value="Em andamento">Em Andamento</option>
              <option value="Finalizado">Finalizados</option>
              <option value="Cancelado">Cancelados</option>
            </select>
            <span class="select-icon">▼</span>
          </div>
        </div>

        <div class="filter-group">
          <label>Status da Pessoa</label>
          <div class="select-wrapper">
            <select v-model="filtros.statusAluno">
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="cursando">Cursando</option>
              <option value="inativo">Inativo</option>
            </select>
            <span class="select-icon">▼</span>
          </div>
        </div>

        <div class="filter-group">
          <label>Professor</label>
          <div class="select-wrapper">
            <select v-model="filtros.professor">
              <option value="">Todos</option>
              <option v-for="prof in professores" :key="prof" :value="prof">
                {{ prof }}
              </option>
            </select>
            <span class="select-icon">▼</span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="filters-loading">
        <span class="loading-spinner"></span>
        Aplicando filtros...
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>Total de Pessoas</h3>
          <p class="stat-number">{{ totalUsuarios }}</p>
          <small class="stat-trend" :class="{ positive: usuariosTendencia > 0 }">
            {{ usuariosTendencia }}% este mês
          </small>
        </div>
      </div>

      <!-- <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <h3>Cursos Ativos</h3>
          <p class="stat-number">{{ cursosAtivos }}</p>
          <small>{{ cursosConcluidos }} concluídos</small>
        </div>
      </div> -->

      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <h3>Matrículas do Mês</h3>
          <p class="stat-number">{{ matriculasMes }}</p>
          <small>Total: {{ matriculasTotal }}</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <h3>Pessoas Ativas</h3>
          <p class="stat-number">{{ alunosAtivos }}</p>
          <small>Cursando: {{ alunosCursando }}</small>
        </div>
      </div>

      <div class="stat-card expandable">
        <div class="stat-header">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <h3>Treinamentos</h3>
            <p class="stat-number">{{ totalCursos }}</p>
            <div class="stat-details">
              <span class="status-badge em-andamento">
                {{ cursosEmAndamento }} Em Andamento
              </span>
              <span class="status-badge finalizados">
                {{ cursosConcluidos }} Concluídos
              </span>
              <span class="status-badge cancelados">
                {{ cursosCancelados }} Cancelados
              </span>
            </div>
          </div>
        </div>

        <!-- Seção expandível com detalhes -->
        <div v-if="showCursosDetails" class="stat-expanded">
          <div class="filters-section">
            <div class="filter-group">
              <label>Período</label>
              <div class="date-range">
                <input 
                  type="date" 
                  v-model="cursosFilters.dataInicio"
                  @change="filtrarCursos"
                >
                <span>até</span>
                <input 
                  type="date" 
                  v-model="cursosFilters.dataFim"
                  @change="filtrarCursos"
                >
              </div>
            </div>
            <div class="filter-group">
              <label>Status</label>
              <select v-model="cursosFilters.status" @change="filtrarCursos">
                <option value="">Todos</option>
                <option value="Em andamento">Em Andamento</option>
                <option value="Finalizado">Finalizados</option>
                <option value="Cancelado">Cancelados</option>
              </select>
            </div>
          </div>

          <div class="cursos-list">
            <div v-for="curso in cursosFiltrados" :key="curso.id" class="curso-item">
              <h4>{{ curso.nome }}</h4>
              <div class="curso-info">
                <span>Professor: {{ curso.professor_responsavel }}</span>
                <span>Início: {{ formatDate(curso.data_inicio) }}</span>
                <span :class="'status-' + curso.status.toLowerCase()">
                  {{ curso.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="export-actions">
            <button @click="exportarPDF" class="btn-export">
              <img src="/public/icons/pdf.svg" alt="PDF" class="icon" />
              Exportar PDF
            </button>
            <button @click="exportarExcel" class="btn-export">
              <img src="/public/icons/excel.svg" alt="Excel" class="icon" />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="cursos-container">
      <h2 class="section-title">Cursos Filtrados</h2>
      <div class="cursos-grid">
        <div v-for="curso in cursosFiltrados" :key="curso.id" class="curso-card">
          <div class="curso-header">
            <h3>{{ curso.nome }}</h3>
            <span :class="['status-badge', curso.status.toLowerCase()]">
              {{ curso.status }}
            </span>
          </div>
          <div class="curso-content">
            <div class="curso-info">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Professor:</span>
                  <span class="info-value">{{ curso.professor_responsavel }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Início:</span>
                  <span class="info-value">{{ formatDate(curso.data_inicio) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Alunos:</span>
                  <span class="info-value">{{ curso.total_alunos || 0 }}</span>
                </div>
              </div>
            </div>
            <div class="curso-stats">
              <div class="stat-item">
                <span class="stat-label">Ativos</span>
                <span class="stat-value">{{ curso.alunos_ativos || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Concluídos</span>
                <span class="stat-value">{{ curso.alunos_concluidos || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <div class="chart-container">
      <h2 class="chart-title">Matrículas por Treinamento</h2>
      <DashboardChart :matriculasPorCurso="matriculasPorCurso" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import DashboardChart from '../components/DashboardChart.vue'
import { supabase } from '../config/supabase'
import { sanitizeHTML } from '@/utils/sanitize'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const totalUsuarios = ref(0)
const cursosAtivos = ref(0)
const matriculasMes = ref(0)
const matriculasPorCurso = ref<Record<string, number>>({})
const professores = ref<string[]>([])
const usuariosTendencia = ref(0)
const cursosConcluidos = ref(0)
const matriculasTotal = ref(0)
const alunosAtivos = ref(0)
const alunosCursando = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

interface Filtros {
  dataInicio: string;
  dataFim: string;
  statusCurso: string;
  statusAluno: string;
  professor: string;
}

const filtros = ref<Filtros>({
  dataInicio: '',
  dataFim: '',
  statusCurso: '',
  statusAluno: '',
  professor: ''
})

const showCursosDetails = ref(false)
interface Curso {
  id: number
  nome: string
  professor_responsavel: string
  data_inicio: string
  data_fim: string
  status: string
  total_alunos?: number
  alunos_ativos?: number
  alunos_concluidos?: number
  matriculas?: Array<{
    status: string
    usuario?: {
      id: number
      status: string
    }
  }>
}

const cursos = ref<Curso[]>([])
const cursosFilters = ref({
  dataInicio: '',
  dataFim: '',
  status: ''
})

const totalCursos = ref(0)
const cursosEmAndamento = ref(0)
const cursosCancelados = ref(0)

const carregarEstatisticas = async () => {
  try {
    // Get users data
    const { data: usuarios, error: usersError } = await supabase
      .from('usuarios')
      .select('*')

    if (usersError) throw usersError

    totalUsuarios.value = usuarios.length
    alunosAtivos.value = usuarios.filter(u => u.status === 'ativo').length
    alunosCursando.value = usuarios.filter(u => u.status === 'cursando').length
    // Get courses data
    const { data: cursos, error: coursesError } = await supabase
      .from('cursos')
      .select('*')

    if (coursesError) throw coursesError

    // Extract unique professor names
    professores.value = [...new Set(cursos.map(curso => curso.professor_responsavel))]
    if (coursesError) throw coursesError

    const hoje = new Date()
    cursosAtivos.value = cursos.filter(curso => 
      new Date(curso.data_fim) > hoje
    ).length

    cursosConcluidos.value = cursos.filter(curso => 
      new Date(curso.data_fim) <= hoje
    ).length

    // Get enrollments data
    const { data: matriculas, error: enrollmentsError } = await supabase
      .from('matriculas')
      .select('*, curso:cursos(*)')

    if (enrollmentsError) throw enrollmentsError

    const currentMonth = hoje.getMonth()
    const currentYear = hoje.getFullYear()

    matriculasMes.value = matriculas.filter(matricula => {
      const dataMatricula = new Date(matricula.data_matricula)
      return dataMatricula.getMonth() === currentMonth &&
        dataMatricula.getFullYear() === currentYear
    }).length

    matriculasTotal.value = matriculas.filter(matricula => 
      matricula.status === 'ativo'
    ).length

    matriculasPorCurso.value = matriculas.reduce((acc, matricula) => {
      if (matricula.curso) {
        const cursoNome = matricula.curso.nome
        acc[cursoNome] = (acc[cursoNome] || 0) + 1
      }
      return acc
    }, {})

  } catch (err) {
    console.error('Error loading statistics:', err)
    error.value = 'Erro ao carregar estatísticas'
  }
}

const atualizarDados = async () => {
  await carregarEstatisticas()
}

const toggleCursosDetails = () => {
  showCursosDetails.value = !showCursosDetails.value
}

const carregarCursos = async () => {
  try {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .order('data_inicio', { ascending: false })

    if (error) throw error

    cursos.value = data
    atualizarContadores()
  } catch (error) {
    console.error('Erro ao carregar cursos:', error)
  }
}

const atualizarContadores = () => {
  totalCursos.value = cursos.value.length
  cursosEmAndamento.value = cursos.value.filter(c => c.status === 'Em andamento').length
  cursosConcluidos.value = cursos.value.filter(c => c.status === 'Finalizado').length
  cursosCancelados.value = cursos.value.filter(c => c.status === 'Cancelado').length
}

const cursosFiltrados = computed(() => {
  return cursos.value.filter(curso => {
    const matchStatus = !cursosFilters.value.status || 
      curso.status === cursosFilters.value.status
    
    const matchDates = checkDateRange(
      curso.data_inicio,
      cursosFilters.value.dataInicio,
      cursosFilters.value.dataFim
    )

    return matchStatus && matchDates
  })
})

const formatDate = (date: string): string => {
  if (!date) return '--'
  return new Date(date).toLocaleDateString('pt-BR')
}

onMounted(() => {
  carregarEstatisticas()
  carregarCursos()
  loadUserData()
})

const exportarPDF = () => {
  // Implement PDF export logic here
  console.log('Exportando PDF...')
}

const exportarExcel = () => {
  // Implement Excel export logic here
  console.log('Exportando Excel...')
}

const filtrarCursos = () => {
  // The filtering is already handled by the computed property cursosFiltrados
  // This function is just a handler for the @change event
  console.log('Filtros atualizados')
}

const aplicarFiltros = async () => {
  try {
    loading.value = true
    error.value = null

    let query = supabase
      .from('cursos')
      .select(`
        *,
        matriculas (
          id,
          status,
          data_matricula,
          usuario:usuarios(
            id,
            nome,
            status
          )
        )
      `)

    // Aplicar filtros
    if (filtros.value.statusCurso) {
      query = query.eq('status', filtros.value.statusCurso)
    }

    if (filtros.value.dataInicio) {
      query = query.gte('data_inicio', filtros.value.dataInicio)
    }

    if (filtros.value.dataFim) {
      query = query.lte('data_inicio', filtros.value.dataFim)
    }

    if (filtros.value.professor) {
      query = query.eq('professor_responsavel', filtros.value.professor)
    }

    const { data, error: queryError } = await query

    if (queryError) throw queryError

    cursos.value = data
    atualizarContadores()
    atualizarEstatisticas()

  } catch (err) {
    console.error('Erro ao aplicar filtros:', err)
    error.value = 'Erro ao filtrar dados'
  } finally {
    loading.value = false
  }
}

// Adicione watchers para filtros automáticos
watch(() => filtros.value, async (newValue, oldValue) => {
  if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
    await aplicarFiltros()
  }
}, { deep: true })

function checkDateRange(data_inicio: string, dataInicio: string, dataFim: string): boolean {
  // If no dates are specified, return true
  if (!dataInicio && !dataFim) return true
  
  const cursoDate = new Date(data_inicio)
  
  // Check start date if specified
  if (dataInicio && cursoDate < new Date(dataInicio)) {
    return false
  }
  
  // Check end date if specified
  if (dataFim && cursoDate > new Date(dataFim)) {
    return false
  }
  interface CursosFilters {
    dataInicio: string;
    dataFim: string;
    status: string;
  }

  interface MatriculaPorCurso {
    [key: string]: number;
  }

  interface Usuario {
    id: number;
    status: string;
  }

  interface Matricula {
    data_matricula: string;
    status: string;
    curso: Curso | null;
  }

  // Update/add type annotations
  const cursos = ref<Curso[]>([])
  const cursosFilters = ref<CursosFilters>({
    dataInicio: '',
    dataFim: '',
    status: ''
  })

  const matriculasPorCurso = ref<MatriculaPorCurso>({})
  const error = ref<string | null>(null)

  const formatDate = (date: string): string => {
    if (!date) return '--'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return true
}
function atualizarEstatisticas() {
  // Update statistics based on filtered courses
  cursosEmAndamento.value = cursos.value.filter(c => c.status === 'Em andamento').length
  cursosConcluidos.value = cursos.value.filter(c => c.status === 'Finalizado').length 
  cursosCancelados.value = cursos.value.filter(c => c.status === 'Cancelado').length
  totalCursos.value = cursos.value.length

  // Update matriculas statistics
  const matriculasFiltered = cursos.value.flatMap(curso => 
    curso.matriculas?.filter(m => m.status === 'ativo') ?? []
  )
  matriculasTotal.value = matriculasFiltered.length
  
  // Update alunos statistics
  const alunosSet = new Set(matriculasFiltered.map(m => m.usuario?.id))
  alunosAtivos.value = [...alunosSet].length
  alunosCursando.value = matriculasFiltered.filter(m => 
    m.usuario?.status === 'cursando'
  ).length
}

const userData = ref({
  nome: '',
  email: ''
})

// Função para carregar dados do usuário
const loadUserData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      userData.value = profile
    }
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error)
  }
}
</script>

<style scoped>
/* Variáveis CSS para modo escuro */
:root {
  --card-bg-dark: #1a1f2e;
  --text-primary-dark: #e1e7ef;
  --text-secondary-dark: #a1a8b6;
  --border-color-dark: rgba(255, 255, 255, 0.1);
  --hover-bg-dark: #252b3b;
  --chart-bg-dark: #1e2432;
}

/* Estilos base atualizados */
.dashboard {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.dashboard-header {
  background: linear-gradient(135deg, #1a1f2e 0%, #252b3b 100%);
  border: 1px solid var(--border-color-dark);
}

.stat-card {
  background: var(--card-bg-dark);
  border: 1px solid var(--border-color-dark);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.stat-card:hover {
  background: var(--hover-bg-dark);
  border-color: var(--border-color-dark);
}

.stat-icon {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary-dark);
}

.stat-info h3 {
  color: var(--text-primary-dark);
}

.stat-number {
  color: #4d9fff;
}

/* Filtros no modo escuro */
.filters-container {
  background: var(--card-bg-dark);
  border: 1px solid var(--border-color-dark);
}

.filters-title {
  color: var(--text-primary-dark);
}

.filter-group label {
  color: var(--text-primary-dark);
}

input[type="date"],
select {
  background: var(--hover-bg-dark);
  border: 1px solid var(--border-color-dark);
  color: var(--text-primary-dark);
}

input[type="date"]:focus,
select:focus {
  border-color: #4d9fff;
  box-shadow: 0 0 0 3px rgba(77, 159, 255, 0.1);
}

/* Cards de status */
.status-badge {
  background: rgba(255, 255, 255, 0.05);
}

.status-badge.em-andamento { 
  background: rgba(0, 123, 255, 0.1);
  color: #4d9fff;
}

.status-badge.finalizados { 
  background: rgba(40, 167, 69, 0.1);
  color: #2ecc71;
}

.status-badge.cancelados { 
  background: rgba(220, 53, 69, 0.1);
  color: #ff6b6b;
}

/* Gráficos e containers */
.chart-container {
  background: var(--card-bg-dark);
  border: 1px solid var(--border-color-dark);
}

.chart-title {
  color: var(--text-primary-dark);
}

/* Info card específico */
.info-card {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: var(--text-primary-dark);
}

.info-card .stat-icon {
  background: rgba(255, 255, 255, 0.1);
}

/* Estilos para dados e estatísticas */
.info-item {
  background: var(--hover-bg-dark);
  border: 1px solid var(--border-color-dark);
}

.info-label {
  color: var(--text-secondary-dark);
}

.info-value {
  color: var(--text-primary-dark);
}

/* Botões e ações */
.refresh-btn {
  background: var(--hover-bg-dark);
  color: var(--text-primary-dark);
  border: 1px solid var(--border-color-dark);
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn-export {
  background: var(--hover-bg-dark);
  color: var(--text-primary-dark);
  border: 1px solid var(--border-color-dark);
}

.btn-export:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Loading e estados */
.loading {
  color: var(--text-secondary-dark);
}

.filters-loading {
  color: var(--text-secondary-dark);
}

.loading-spinner {
  border-color: var(--border-color-dark);
  border-top-color: #4d9fff;
}

/* Toast de erro */
.toast-error {
  background: #2c1215;
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.2);
}


.icon-black {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  filter: contrast(0.4);
}

/* Refresh button styling */
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: #193155;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background-color: #e8eef7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Main dashboard layout */
.dashboard {
  padding: 2rem;
  background-color: var(--bg-secondary);
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary);
}

/* Dashboard header */
.dashboard-header {
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.dashboard-icon {
  width: 200px;
  height: 200px;
  position: absolute;
  left: 0;
}

.dashboard-header h1 {
  font-size: 1.8rem;
  margin: 0 auto; /* Centraliza o título */
  font-weight: 600;
  flex-grow: 1;
  text-align: center;
}

/* Ajuste responsivo */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .dashboard-icon {
    position: static;
    margin-bottom: 0.5rem;
  }

  .dashboard-header h1 {
    margin: 0.5rem 0;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  border: 1px solid var(--border-color);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2.5em;
  margin-right: 1.5rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  color: #193155;
}

.stat-info {
  flex: 1;
}

.stat-info h3 {
  color: var(--text-primary);  /* Mudando para azul escuro */
  font-size: 0.9rem;
  font-weight: 600;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-color);  /* Azul mais escuro para melhor contraste */
  margin-bottom: 0.25rem;
}

.stat-trend {
  font-size: 0.85rem;
  color: #dc3545;
}

.stat-trend.positive {
  color: #28a745;
}

.error-message {
  background: #fee2e2;
  color: #dc3545;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.toast-error {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #fee2e2;
  color: #dc3545;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 300px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideIn 0.3s ease-out;
}

.close-btn {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-title {
  color: #193155;
  font-weight: 600;
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cursos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .filters-row {
    flex-direction: column;
    padding: 1rem;
  }

  .filter-group {
    width: 100%;
    min-width: 100%;
    margin-bottom: 1rem;
  }

  .date-range {
    flex-direction: column;
  }

  .date-range span {
    margin: 0.5rem 0;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .cursos-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
    padding: 0.75rem;
    margin-right: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .chart-container {
    padding: 1rem;
    overflow-x: auto;
  }

  .curso-card {
    margin-bottom: 1rem;
  }

  .curso-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .curso-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  .curso-stats {
    flex-direction: row;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1rem;
  }
}

@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    margin: 0 0 1rem 0;
  }

  .export-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-export {
    width: 100%;
    justify-content: center;
  }

  .curso-header h3 {
    font-size: 1rem;
  }
}

/* Utility classes for better spacing */
.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.p-1 { padding: 0.5rem; }
.p-2 { padding: 1rem; }

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}

.stat-card.expandable {
  transition: all 0.3s ease;
}

.stat-card.expandable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-expanded {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e4e8;
}

.filters-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.em-andamento { color: #007bff; }
.status-badge.finalizados { color: #28a745; }
.status-badge.cancelados { color: #dc3545; }

.cursos-list {
  max-height: 300px;
  overflow-y: auto;
  margin: 1rem 0;
}

.curso-item {
  padding: 1rem;
  border-bottom: 1px solid #e0e4e8;
}

.curso-info {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.export-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-export:hover {
  transform: translateY(-2px);
}

.filters-row {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  color: var(--text-primary-dark);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  color: var(--text-primary-dark);
  transition: all 0.3s ease;
  background: var(--hover-bg-dark);
}

.date-range {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.date-range input {
  flex: 1;
}

.cursos-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
}

.section-title {
  color: #193155;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e4e8;
}

.cursos-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  gap: 1.5rem;
}

.curso-card {
  background: white;
  border: 1px solid #e0e4e8;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
}

.curso-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(25, 49, 85, 0.12);
}

.curso-header {
  background: #f8f9fa;
  padding: 1.25rem;
  border-bottom: 1px solid #e0e4e8;
}

.curso-header h3 {
  color: #193155;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.curso-content {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.curso-info {
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e4e8;
}

.info-label {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-value {
  color: #193155;
  font-weight: 500;
  word-break: break-word;
  text-align: right;
  margin-left: 1rem;
}

.curso-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e4e8;
}

.stat-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e4e8;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-label {
  display: block;
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  color: #193155;
  font-size: 1.25rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.em-andamento { background: #e7f5ff; color: #007bff; }
.status-badge.finalizado { background: #e8f5e9; color: #28a745; }
.status-badge.cancelado { background: #fee2e2; color: #dc3545; }

@media (max-width: 768px) {
  .curso-content {
    padding: 1rem;
  }

  .info-item {
    padding: 0.5rem;
  }

  .curso-stats {
    padding-top: 1rem;
  }

  .stat-item {
    padding: 0.75rem;
  }
}

.filters-container {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--button-primary-text);
}

.filters-title {
  color: var(--text-primary-dark);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(2 minmax(360px, 1fr));
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  color: var(--text-primary-dark);
  font-weight: 500;
  font-size: 0.9rem;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.date-input {
  position: relative;
  flex: 1;
}

.date-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.9rem;
}

.date-separator {
  color: #6c757d;
  font-size: 0.9rem;
}

input[type="date"] {
  width: 100%;
  padding: 0.75rem;
  padding-left: 2.5rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary-dark);
  transition: all 0.3s ease;
}

.select-wrapper {
  position: relative;
}

select {
  width: 100%;
  padding: 0.75rem;
  padding-right: 2rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: #193155;
  appearance: none;
  background: white;
  transition: all 0.3s ease;
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  font-size: 0.8rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

.filters-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e0e4e8;
  border-top-color: #193155;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }

  .date-range {
    flex-direction: column;
  }

  .date-separator {
    align-self: center;
    margin: 0.25rem 0;
  }
}
</style>
