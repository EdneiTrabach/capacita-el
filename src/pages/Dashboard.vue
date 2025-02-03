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
    </div>

    <div class="chart-container">
      <h2 class="chart-title">Matrículas por Curso</h2>
      <DashboardChart :matriculasPorCurso="matriculasPorCurso" />
    </div>
  </div>
</template>

<script>
import api from '../config/axios'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import DashboardChart from '../components/DashboardChart.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  name: 'Dashboard',
  components: { DashboardChart },
  data() {
    return {
      totalUsuarios: 0,
      cursosAtivos: 0,
      matriculasMes: 0,
      matriculasPorCurso: {},
      usuariosTendencia: 0,
      cursosConcluidos: 0,
      matriculasTotal: 0,
      alunosAtivos: 0,
      alunosCursando: 0,
      loading: false,
      error: null
    }
  },
  async created() {
    await this.carregarEstatisticas()
  },
  methods: {
    async carregarEstatisticas() {
      this.loading = true
      this.error = null

      try {
        // Buscar dados de usuários
        const usuariosRes = await api.get('/usuarios')
        const usuarios = usuariosRes.data

        this.totalUsuarios = usuarios.length
        this.alunosAtivos = usuarios.filter(u => u.status === 'ativo').length
        this.alunosCursando = usuarios.filter(u => u.status === 'cursando').length

        // Calcular tendência de usuários
        this.usuariosTendencia = 5 

        // Buscar dados dos cursos
        try {
          const cursosRes = await api.get('/cursos')
          const cursos = cursosRes.data
          const hoje = new Date()

          this.cursosAtivos = cursos.filter(curso =>
            new Date(curso.data_fim) > hoje
          ).length

          this.cursosConcluidos = cursos.filter(curso =>
            new Date(curso.data_fim) <= hoje
          ).length

        } catch (error) {
          console.error('Erro ao carregar cursos:', error)
          this.cursosAtivos = 0
          this.cursosConcluidos = 0
        }

        // Buscar dados de matrículas
        try {
          const matriculasRes = await api.get('/matriculas')
          const matriculas = matriculasRes.data
          const hoje = new Date()
          const currentMonth = hoje.getMonth()
          const currentYear = hoje.getFullYear()

          this.matriculasMes = matriculas.filter(matricula => {
            const dataMatricula = new Date(matricula.data_matricula)
            return dataMatricula.getMonth() === currentMonth &&
              dataMatricula.getFullYear() === currentYear
          }).length

          this.matriculasTotal = matriculas.filter(matricula =>
            matricula.status === 'ativo'
          ).length

          this.matriculasPorCurso = matriculas.reduce((acc, matricula) => {
            if (matricula.curso) {
              const cursoNome = matricula.curso.nome
              acc[cursoNome] = (acc[cursoNome] || 0) + 1
            }
            return acc
          }, {})

        } catch (error) {
          console.error('Erro ao carregar matrículas:', error)
          this.matriculasMes = 0
          this.matriculasTotal = 0
          this.matriculasPorCurso = {}
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        this.error = 'Erro ao carregar estatísticas'
      } finally {
        this.loading = false
      }
    },
    async atualizarDados() {
      await this.carregarEstatisticas()
    }
  }
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
</style>
