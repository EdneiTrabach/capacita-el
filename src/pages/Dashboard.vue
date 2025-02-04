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
      <h1>Dashboard</h1>
      <button @click="atualizarDados" class="refresh-btn">
        <img src="/public/icons/cursando.svg" alt="Atualizar" class="icon-black" />
        Atualizar Dados
      </button>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>Total de Alunos</h3>
          <p class="stat-number">{{ totalUsuarios }}</p>
          <small class="stat-trend" :class="{ positive: usuariosTendencia > 0 }">
            {{ usuariosTendencia }}% este mês
          </small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <h3>Cursos Ativos</h3>
          <p class="stat-number">{{ cursosAtivos }}</p>
          <small>{{ cursosConcluidos }} concluídos</small>
        </div>
      </div>

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
          <h3>Alunos Ativos</h3>
          <p class="stat-number">{{ alunosAtivos }}</p>
          <small>Cursando: {{ alunosCursando }}</small>
        </div>
      </div>

      <div class="stat-card expandable" @click="toggleCursosDetails">
        <div class="stat-header">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <h3>Cursos</h3>
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

    <div class="chart-container">
      <h2 class="chart-title">Matrículas por Curso</h2>
      <DashboardChart :matriculasPorCurso="matriculasPorCurso" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
const usuariosTendencia = ref(0)
const cursosConcluidos = ref(0)
const matriculasTotal = ref(0)
const alunosAtivos = ref(0)
const alunosCursando = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

const showCursosDetails = ref(false)
interface Curso {
  id: number
  nome: string
  professor_responsavel: string
  data_inicio: string
  data_fim: string
  status: string
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
</script>

<style scoped>
/* Icon styling */
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
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

/* Dashboard header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: white;
}

.dashboard-header h1 {
  font-size: 1.8rem;
  margin: 0;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  border: 1px solid rgba(25, 49, 85, 0.1);
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
  color: #193155;  /* Mudando para azul escuro */
  font-size: 0.9rem;
  font-weight: 600;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #254677;  /* Azul mais escuro para melhor contraste */
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
  cursor: pointer;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
</style>
