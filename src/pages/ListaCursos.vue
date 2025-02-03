<template>
  <div class="cursos-container">
    <header class="cursos-header">
      <h1>Cursos Cadastrados</h1>
      <button @click="$router.push('/cursos')" class="btn-novo">
        <img src="../../public/icons/adicao.svg" alt="Novo" class="icon-black" />
        Novo Curso
      </button>
    </header>

    <div class="search-bar">
      <input type="text" v-model="searchTerm" placeholder="Buscar por nome ou descrição...">
      <select v-model="statusFilter">
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="concluido">Concluído</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>

    <div class="cursos-grid">
      <div v-for="curso in cursosFiltrados" :key="curso.id" class="curso-card">
        <div class="curso-header">
          <h3>{{ curso.nome }}</h3>
          <div class="actions">
            <button @click="editarCurso(curso)" class="btn-edit">
              <img src="../../public/icons/adicao.svg" alt="Editar" class="icon" />
              Editar
            </button>
            <button @click="deletarCurso(curso.id)" class="btn-delete">
              <img src="../../public/icons/lixeira.svg" alt="Excluir" class="icon" />
              Excluir
            </button>
          </div>
        </div>

        <div class="curso-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Carga Horária:</span>
              <span>{{ curso.duracao_horas }}h</span>
            </div>
            <div class="info-item">
              <span class="label">Início:</span>
              <span>{{ formatDate(curso.data_inicio) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <span :class="'status-' + curso.status.replace(' ', '_')">{{ curso.status }}</span>
            </div>
            <div class="info-item">
              <span class="label">Professor:</span>
              <span>{{ curso.professor_responsavel }}</span>
            </div>
          </div>
          <div class="modulos-section">
            <h4>Módulos</h4>
            <ul>
              <li v-for="(modulo, index) in curso.modulos" :key="index">
                {{ modulo.nome }} ({{ modulo.carga_horaria }}h)
              </li>
            </ul>
          </div>
          <div class="card-actions">
            <div class="status-toggle">
              <button @click="toggleStatus(curso, 'Em andamento')"
                :class="['status-btn', { active: curso.status === 'Em andamento' }]">
                <img src="../../public/icons/cursando.svg" alt="Cursando" class="icon-black" />
                Em Andamento
              </button>
              <button @click="toggleStatus(curso, 'Finalizado')"
                :class="['status-btn', { active: curso.status === 'Finalizado' }]">
                <img src="../../public/icons/check.svg" alt="Finalizado" class="icon-black" />
                Finalizado
              </button>
              <button @click="toggleStatus(curso, 'Cancelado')"
                :class="['status-btn', { active: curso.status === 'Cancelado' }]">
                <img src="../../public/icons/fechar.svg" alt="Finalizado" class="icon-black" />
                Cancelado
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../config/axios'

export default {
  name: 'ListaCursos',
  data() {
    return {
      cursos: [],
      searchTerm: '',
      statusFilter: '',
      loading: false,
      error: null
    }
  },
  computed: {
    cursosFiltrados() {
      // First sort the courses by creation date
      const sortedCursos = [...this.cursos].sort((a, b) => {
        // Sort by createdAt date, newest first
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

      // Then apply the filters
      return sortedCursos.filter(curso => {
        const matchSearch = !this.searchTerm ||
          curso.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          curso.descricao?.toLowerCase().includes(this.searchTerm.toLowerCase())

        const matchStatus = !this.statusFilter || curso.status === this.statusFilter

        return matchSearch && matchStatus
      })
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '--'
      return new Date(date).toLocaleDateString('pt-BR')
    },
    async loadCursos() {
      this.loading = true
      try {
        const response = await api.get('/cursos')
        this.cursos = response.data
      } catch (error) {
        console.error('Erro ao carregar cursos:', error)
        this.error = 'Erro ao carregar cursos'
      } finally {
        this.loading = false
      }
    },
    async deletarCurso(id) {
      if (confirm('ATENÇÃO: Esta ação excluirá permanentemente o curso. Esta ação não pode ser desfeita. Você tem certeza que deseja continuar?')) {
        try {
          await api.delete(`/cursos/${id}`)
          await this.loadCursos()
          alert('Curso excluído com sucesso')
        } catch (error) {
          console.error('Erro ao deletar curso:', error)
          alert('Erro ao excluir curso. Por favor, tente novamente.')
        }
      }
    },
    editarCurso(curso) {
      this.$router.push({
        name: 'CadastroCursos',
        params: { id: curso.id },
        query: { edit: true }
      })
    },
    async toggleStatus(curso, status) {
      try {
        curso.status = status
        await api.put(`/cursos/${curso.id}`, curso)
        await this.loadCursos()
      } catch (error) {
        console.error('Erro ao atualizar status do curso:', error)
        alert('Erro ao atualizar status do curso. Por favor, tente novamente.')
      }
    }
  },
  created() {
    this.loadCursos()
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
  width: 24px;
  text-align: center;
  filter: contrast(0.4);
}

/* Estilos para o container principal */
.cursos-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

/* Header com gradiente e melhor contraste */
.cursos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cursos-header h1 {
  color: #ffffff;
  font-size: 1.8rem;
  margin: 0;
  font-weight: 600;
}

/* Botão Novo com hover effect aprimorado */
.btn-novo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #ffffff;
  color: #193155;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-novo:hover {
  background-color: #e8eef7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Barra de pesquisa melhorada */
.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar input,
.search-bar select {
  padding: 0.75rem 1rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: #2c3e50;
  flex: 1;
  transition: all 0.3s ease;
}

.search-bar input:focus,
.search-bar select:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

/* Cards de curso com melhor visual */
.curso-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e0e4e8;
}

.curso-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.curso-header {
  padding: 1.25rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e4e8;
  display: flex;
  justify-content: space-between;
}

.curso-header h3 {
  color: #193155;
  font-weight: 600;
  margin: 0;
}

/* Status badges com cores distintas */
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-Em_andamento {
  color: #0055b3 !important;
  /* Azul mais escuro */
  font-weight: 600;
}

.status-Finalizado {
  color: #157347 !important;
  /* Verde mais escuro */
  font-weight: 600;
}

.status-Cancelado {
  color: #b02a37 !important;
  /* Vermelho mais escuro */
  font-weight: 600;
}

/* Modal de criação/edição */
.modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  color: #193155;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e4e8;
}

/* Botões de ação com melhor contraste */
.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-edit {
  background-color: #193155;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover {
  transform: translateY(-2px);
  filter: brightness(110%);
}

.curso-body {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.85rem;
  color: #495057;
  font-weight: 500;
}

/* Melhorando o contraste dos valores */
.info-item span:last-child {
  color: #193155;
  /* Cor principal do projeto */
  font-weight: 500;
  font-size: 0.95rem;
}

.status-ativo {
  color: #28a745;
}

.status-concluido {
  color: #17a2b8;
}

.status-cancelado {
  color: #dc3545;
}

.modulos-section {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.modulos-section h4 {
  color: #193155;
  margin-bottom: 0.75rem;
}

.modulos-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.modulos-section li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e4e8;
  color: #193155;
  /* Usando a cor principal */
  font-weight: 500;
}

.card-actions {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.status-toggle {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}

.status-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  background-color: white;
  color: #6c757d;
  transition: all 0.2s ease;
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-btn:hover {
  transform: translateY(-2px);
}

.status-btn.active {
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-btn.active:nth-child(1) {
  background-color: #007bff;
}

.status-btn.active:nth-child(2) {
  background-color: #28a745;
}

.status-btn.active:nth-child(3) {
  background-color: #dc3545;
}

.status-em_andamento {
  color: #007bff;
}

.status-finalizado {
  color: #28a745;
}

.status-cancelado {
  color: #dc3545;
}

.status-Em_andamento {
  color: #007bff;
  font-weight: bold;
}

.status-Finalizado {
  color: #28a745;
  font-weight: bold;
}

.status-Cancelado {
  color: #dc3545;
  font-weight: bold;
}

@media (max-width: 768px) {
  .cursos-container {
    padding: 1rem;
  }

  .cursos-grid {
    grid-template-columns: 1fr;
  }

  .search-bar {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* Action Buttons */
.actions {
  display: flex;
  gap: 0.75rem;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-edit {
  background-color: #193155;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Card Header */
.certificado-header {
  padding: 1.25rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e4e8;
}

/* Status Badge */
.status-badge {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Status Colors */
.certificado-card.emitido .status-badge {
  background-color: #198754;
  color: white;
}

.certificado-card.pendente .status-badge {
  background-color: #0d6efd;
  color: white;
}

.certificado-card.cancelado .status-badge {
  background-color: #dc3545;
  color: white;
}

/* Action Buttons */
.actions {
  display: flex;
  gap: 0.75rem;
}

.btn-edit,
.btn-delete,
.btn-download,
.btn-view,
.btn-emit {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 120px;
}

.btn-edit {
  background-color: #193155;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-download {
  background-color: #254677;
  color: white;
}

.btn-view {
  background-color: #6c757d;
  color: white;
}

.btn-emit {
  background-color: #198754;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover,
.btn-download:hover,
.btn-view:hover,
.btn-emit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Card Body */
.certificado-body {
  padding: 1.5rem;
}

.certificado-body h3 {
  color: #193155;
  font-size: 1.3rem;
  margin: 0 0 1.25rem 0;
  font-weight: 600;
  line-height: 1.2;
}

/* Information Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.85rem;
  color: #495057;
  font-weight: 500;
}

.info-item span:last-child {
  color: #193155;
  font-weight: 500;
  font-size: 0.95rem;
}
</style>