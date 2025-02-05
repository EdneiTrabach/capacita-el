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
          <label>Status do Aluno</label>
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
      <div class="relatorio-card" @click="showAlunosReport = true">
        <div class="card-icon">
          <img src="/public/icons/relatorio.svg" alt="Alunos por Curso" class="icon-black" />
        </div>
        <h3>Alunos por Curso</h3>
        <p>Visualize a distribuição de alunos em cada curso</p>
        <button class="btn-gerar">
          Gerar Relatório
        </button>
      </div>

      <div class="relatorio-card" @click="showCertificadosReport = true">
        <div class="card-icon">
          <img src="/public/icons/grafico-linha.svg" alt="Certificados Emitidos" class="icon-black" />
        </div>
        <h3>Certificados Emitidos</h3>
        <p>Relatório de certificados emitidos por período</p>
        <button class="btn-gerar">
          Gerar Relatório
        </button>
      </div>
    </div>
  </div>
  <div class="report-data">
    <h3>{{ sanitizeHTML(certificado.aluno_nome) }}</h3>
    <p>{{ sanitizeHTML(certificado.curso_nome) }}</p>
    <p>{{ sanitizeHTML(certificado.observacoes) }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import API_URL from '../config/api';
import { sanitizeHTML } from '@/utils/sanitize'

export default {
  name: 'Relatorios',
  data() {
    return {
      showCertificadosReport: false,
      showAlunosReport: false,
      alunos: [],
      cursos: [],
      anos: [],
      certificadosFilters: {
        alunoId: '',
        cursoId: '',
        status: '',
        dataInicio: '',
        dataFim: '',
        ano: ''
      },
      alunosFilters: {
        cursoId: '',
        status: '',
        dataInicio: '',
        dataFim: '',
        conclusao: ''
      }
    }
  },
  methods: {
    async loadData() {
      try {
        const [{ data: alunos }, { data: cursos }] = await Promise.all([
          supabase.from('usuarios').select('*'),
          supabase.from('cursos').select('*')
        ])

        this.alunos = alunos || []
        this.cursos = cursos || []
        
        // Generate years for filter (last 5 years)
        const currentYear = new Date().getFullYear()
        this.anos = Array.from({length: 5}, (_, i) => currentYear - i)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    },
    async gerarRelatorioCertificados() {
      try {
        const response = await axios.get(`${API_URL}/relatorios/certificados`, {
          params: this.certificadosFilters
        });
        // Process the data for PDF generation
        return response.data;
      } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        throw error;
      }
    },
    async exportarCertificadosExcel() {
      // Implementar exportação Excel
    },
    async gerarRelatorioAlunos() {
      try {
        const response = await axios.get(`${API_URL}/relatorios/alunos-por-curso`, {
          params: this.alunosFilters
        });
        // Process the data for PDF generation
        return response.data;
      } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        throw error;
      }
    },
    async exportarAlunosExcel() {
      // Implementar exportação Excel
    },
    sanitizeHTML
  },
  created() {
    this.loadData();
  }
}
</script>

<style scoped>
.icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  filter: brightness(0) invert(1); /* Add this line to make SVG white */
}

.icon-black {
  font-size: 1.2rem;
  width: 100px;
  height: 60px;
  text-align: center;
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
  grid-template-columns: repeat(2, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.relatorio-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease;
  border: 1px solid rgba(25, 49, 85, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.relatorio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
</style>