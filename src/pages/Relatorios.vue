<template>
  <div class="relatorios-container">
    <header class="relatorios-header">
      <h1>Relatórios</h1>
    </header>

    <!-- Relatório de Certificados -->
    <div v-if="showCertificadosReport" class="report-section">
      <div class="report-header">
        <h2>Relatório de Certificados Emitidos</h2>
        <button @click="showCertificadosReport = false" class="btn-voltar">
          <img src="/public/icons/voltar.svg" alt="Voltar" class="icon" />
          Voltar
        </button>
      </div>
      
      <div class="filters-grid">
        <div class="filter-group">
          <label>Aluno</label>
          <select v-model="certificadosFilters.alunoId">
            <option value="">Todos os alunos</option>
            <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">
              {{ aluno.nome }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Curso</label>
          <select v-model="certificadosFilters.cursoId">
            <option value="">Todos os cursos</option>
            <option v-for="curso in cursos" :key="curso.id" :value="curso.id">
              {{ curso.nome }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status</label>
          <select v-model="certificadosFilters.status">
            <option value="">Todos os status</option>
            <option value="emitido">Emitido</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Período</label>
          <div class="date-range">
            <input type="date" v-model="certificadosFilters.dataInicio">
            <span>até</span>
            <input type="date" v-model="certificadosFilters.dataFim">
          </div>
        </div>

        <div class="filter-group">
          <label>Ano</label>
          <select v-model="certificadosFilters.ano">
            <option value="">Todos os anos</option>
            <option v-for="ano in anos" :key="ano" :value="ano">{{ ano }}</option>
          </select>
        </div>
      </div>

      <div class="actions-bar">
        <button @click="gerarRelatorioCertificados" class="btn-gerar-pdf">
          <img src="/public/icons/pdf.svg" alt="PDF" class="icon" />
          Gerar PDF
        </button>
        <button @click="exportarCertificadosExcel" class="btn-export-excel">
          <img src="/public/icons/excel.svg" alt="EXCEL" class="icon" />
          Exportar Excel
        </button>
      </div>
    </div>

    <!-- Relatório de Alunos por Curso -->
    <div v-if="showAlunosReport" class="report-section">
      <div class="report-header">
        <h2>Relatório de Alunos por Curso</h2>
        <button @click="showAlunosReport = false" class="btn-voltar">
          <img src="/public/icons/voltar.svg" alt="Voltar" class="icon" />
          Voltar</button>
      </div>

      <div class="filters-grid">
        <div class="filter-group">
          <label>Curso</label>
          <select v-model="alunosFilters.cursoId">
            <option value="">Todos os cursos</option>
            <option v-for="curso in cursos" :key="curso.id" :value="curso.id">
              {{ curso.nome }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status da Pessoa</label>
          <select v-model="alunosFilters.status">
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="cursando">Cursando</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Período de Matrícula</label>
          <div class="date-range">
            <input type="date" v-model="alunosFilters.dataInicio">
            <span>até</span>
            <input type="date" v-model="alunosFilters.dataFim">
          </div>
        </div>

        <div class="filter-group">
          <label>Conclusão</label>
          <select v-model="alunosFilters.conclusao">
            <option value="">Todos</option>
            <option value="concluido">Concluído</option>
            <option value="emAndamento">Em andamento</option>
          </select>
        </div>
      </div>

      <div class="actions-bar">
        <button @click="gerarRelatorioAlunos" class="btn-gerar-pdf">
          <img src="/public/icons/pdf.svg" alt="PDF" class="icon" />
          Gerar PDF
        </button>
        <button @click="exportarAlunosExcel" class="btn-export-excel">
          <img src="/public/icons/excel.svg" alt="EXCEL" class="icon" />
          Exportar Excel
        </button>
      </div>
    </div>

    <!-- Cards de Relatórios -->
    <div v-if="!showCertificadosReport && !showAlunosReport" class="relatorios-grid">
      <!-- Cards existentes -->
      <div class="relatorio-card" @click="showAlunosReport = true">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'users']" class="icon-black" />
        </div>
        <h3>Relatórios de Alunos por Curso</h3>
        <p>Visualize a distribuição de alunos em cada curso</p>
        <button class="btn-gerar">Gerar Relatório</button>
      </div>

      <!-- Novos cards -->
      <div class="relatorio-card" @click="$router.push('/relatorios/periodo')">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'calendar-alt']" class="icon-black" />
        </div>
        <h3>Relatório por Período</h3>
        <p>Análise de treinamentos por período específico</p>
        <button class="btn-gerar">Gerar Relatório</button>
      </div>

      <div class="relatorio-card" @click="$router.push('/relatorios/setor')">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'building']" class="icon-black" />
        </div>
        <h3>Relatório por Setor</h3>
        <p>Distribuição de treinamentos por setor</p>
        <button class="btn-gerar">Gerar Relatório</button>
      </div>

      <div class="relatorio-card" @click="$router.push('/relatorios/tempo')">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'clock']" class="icon-black" />
        </div>
        <h3>Tempo de Treinamento</h3>
        <p>Análise por carga horária dos treinamentos</p>
        <button class="btn-gerar">Gerar Relatório</button>
      </div>

      <div class="relatorio-card" @click="$router.push('/relatorios/tipo')">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'chalkboard-teacher']" class="icon-black" />
        </div>
        <h3>Tipo de Treinamento</h3>
        <p>Relatórios por modalidade de treinamento</p>
        <button class="btn-gerar">Gerar Relatório</button>
      </div>

      <div class="relatorio-card" @click="showAgendadosReport = true">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'calendar-check']" class="icon-black" />
        </div>
        <h3>Treinamentos Agendados</h3>
        <p>Visualize os próximos treinamentos</p>
        <button class="btn-gerar">Gerar Relatório</button>
      </div>

      <div class="relatorio-card" @click="showPendentesReport = true">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'certificate']" class="icon-black" />
        </div>
        <h3>Certificados Pendentes</h3>
        <p>Gestão de certificados pendentes</p>
        <button class="btn-gerar">Gerar Relatório</button>
      </div>
    </div>

    <div v-if="showSetorReport" class="report-section">
      <SetorRelatorio @voltar="showSetorReport = false" />
    </div>

    <div v-if="showTempoReport" class="report-section">
      <TempoRelatorio @voltar="showTempoReport = false" />
    </div>

    <div v-if="showTipoReport" class="report-section">
      <TipoRelatorio @voltar="showTipoReport = false" />
    </div>

    <div v-if="showAgendadosReport" class="report-section">
      <AgendadosRelatorio @voltar="showAgendadosReport = false" />
    </div>

    <div v-if="showPendentesReport" class="report-section">
      <PendentesRelatorio @voltar="showPendentesReport = false" />
    </div>
  </div>
  <div v-if="selectedCertificado" class="report-data">
    <h3>{{ sanitizeHTML(selectedCertificado.aluno_nome) }}</h3>
    <p>{{ sanitizeHTML(selectedCertificado.curso_nome) }}</p>
    <p>{{ sanitizeHTML(selectedCertificado.observacoes || '') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/config/supabase'
import { sanitizeHTML } from '@/utils/sanitize'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import RelatoriosPeriodo from '@/components/RelatoriosPeriodo/RelatoriosPeriodo.vue'

import { 
  faUsers, 
  faCalendarAlt, 
  faBuilding, 
  faClock, 
  faChalkboardTeacher,
  faCalendarCheck,
  faCertificate
} from '@fortawesome/free-solid-svg-icons'

// Adicionar ícones à biblioteca
library.add(
  faUsers,
  faCalendarAlt,
  faBuilding,
  faClock,
  faChalkboardTeacher,
  faCalendarCheck,
  faCertificate
)

interface Certificado {
  id: string
  aluno_nome: string
  curso_nome: string 
  data_emissao: string
  status: string
  aluno_id: string
  curso_id: string
  observacoes?: string
}

// Adicione as interfaces
interface Aluno {
  id: string
  nome: string
}

interface Curso {
  id: string
  nome: string
}

// Adicione o ref para certificado selecionado
const selectedCertificado = ref<Certificado | null>(null)

// Defina os tipos dos refs
const alunos = ref<Aluno[]>([])
const cursos = ref<Curso[]>([])
const certificados = ref<Certificado[]>([])
const loading = ref(true)
const error = ref('')
const showCertificadosReport = ref(false)
const showAlunosReport = ref(false)
const anos = ref<number[]>([])
// Filtros
const certificadosFilters = ref({
  alunoId: '',
  cursoId: '',
  status: '',
  dataInicio: '',
  dataFim: '',
  ano: ''
})

const alunosFilters = ref({
  cursoId: '',
  status: '',
  dataInicio: '',
  dataFim: '',
  conclusao: ''
})

// Adicione os novos refs para controle de visibilidade
const showSetorReport = ref(false)
const showTempoReport = ref(false)
const showTipoReport = ref(false)
const showAgendadosReport = ref(false)
const showPendentesReport = ref(false)

const loadData = async () => {
  try {
    loading.value = true
    
    // Carregar certificados
    const { data, error: err } = await supabase
      .from('certificados')
      .select(`
        *,
        usuarios (nome),
        cursos (nome)
      `)
      .order('created_at', { ascending: false })

    if (err) throw err
    
    // Corrija o mapeamento dos certificados
    certificados.value = data?.map(cert => ({
      id: cert.id,
      aluno_id: cert.usuario_id,
      curso_id: cert.curso_id,
      aluno_nome: cert.usuarios?.nome || 'Nome não encontrado',
      curso_nome: cert.cursos?.nome || 'Curso não encontrado', 
      data_emissao: cert.data_emissao,
      status: cert.status,
      observacoes: cert.observacoes
    })) || []

    // Carregar alunos e cursos para os filtros
    const [{ data: alunosData }, { data: cursosData }] = await Promise.all([
      supabase.from('usuarios').select('*'),
      supabase.from('cursos').select('*')
    ])

    alunos.value = alunosData || []
    cursos.value = cursosData || []

    // Gerar anos para filtro
    const currentYear = new Date().getFullYear()
    anos.value = Array.from({ length: 5 }, (_, i) => currentYear - i)

  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    error.value = 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
}

const gerarRelatorioCertificados = async () => {
  // Implemente a geração do relatório PDF
  console.log('Gerando relatório de certificados...')
}

const exportarCertificadosExcel = async () => {
  // Implemente a exportação para Excel
  console.log('Exportando para Excel...')
}

const gerarRelatorioAlunos = async () => {
  // Implemente a geração do relatório de alunos
  console.log('Gerando relatório de alunos...')
}

const exportarAlunosExcel = async () => {
  // Implemente a exportação para Excel
  console.log('Exportando alunos para Excel...')
}

const filtrarCertificados = computed(() => {
  return certificados.value.filter(cert => {
    const matchAluno = !certificadosFilters.value.alunoId || 
      cert.aluno_id === certificadosFilters.value.alunoId
    
    const matchCurso = !certificadosFilters.value.cursoId || 
      cert.curso_id === certificadosFilters.value.cursoId
    
    const matchStatus = !certificadosFilters.value.status || 
      cert.status === certificadosFilters.value.status
    
    // Adicione outros filtros conforme necessário
    
    return matchAluno && matchCurso && matchStatus
  })
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  filter: brightness(0) invert(1); /* Add this line to make SVG white */
}

.icon-black {
  font-size: 2.5rem;
  color: #193155;
}

.relatorios-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

.relatorios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.relatorios-header h1 {
  color: #ffffff;
  font-size: 1.8rem;
  margin: 0;
  font-weight: 600;
}

.relatorios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 1200px) {
  .relatorios-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .relatorios-grid {
    grid-template-columns: 1fr;
  }
}

.relatorio-card {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease;
  border: 1px solid rgba(25, 49, 85, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  border-color: rgba(255, 255, 255, 0.2);
}

.relatorio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgba(255, 255, 255, 0.8);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  background: #f8f9fa;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #193155;
}

.relatorio-card h3 {
  color: #193155;
  font-size: 1.4rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.relatorio-card p {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.btn-gerar {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 200px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.btn-gerar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 49, 85, 0.2);
  filter: brightness(110%);
}

.btn-gerar:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .relatorios-container {
    padding: 1rem;
  }

  .relatorios-header {
    padding: 1rem;
    text-align: center;
  }

  .relatorios-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .relatorio-card {
    padding: 1.5rem;
  }

  .card-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .btn-gerar {
    width: 100%;
  }
}

.report-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.report-header h2 {
  color: #193155;
  font-size: 1.5rem;
  margin: 0;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #193155;
}

.filter-group label {
  color: #193155;
  font-weight: 500;
}

.filter-group select,
.filter-group input {
  padding: 0.75rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: #193155;
  transition: all 0.3s ease;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-range input {
  flex: 1;
}

.actions-bar {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e4e8;
}

.btn-voltar,
.btn-gerar-pdf,
.btn-export-excel {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-voltar {
  background-color: #6c757d;
  color: white;
}

.btn-gerar-pdf {
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  color: white;
}

.btn-export-excel {
  background-color: #28a745;
  color: white;
}

.btn-voltar:hover,
.btn-gerar-pdf:hover,
.btn-export-excel:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .actions-bar {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-voltar,
  .btn-gerar-pdf,
  .btn-export-excel {
    width: 100%;
  }
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc3545;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e4e8;
}

th {
  background: #f8f9fa;
  color: #193155;
  font-weight: 600;
}
</style>