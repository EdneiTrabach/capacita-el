<template>
  <div class="certificados-container">
    <!-- Add toast component at the top level -->
    <div class="toast" v-if="toast.show" :class="toast.type">
      {{ toast.message }}
    </div>
    <header class="certificados-header">
      <h1>Gestão de Certificados</h1>
      <button @click="abrirModal" class="btn-novo">
        <img src="/public/icons/adicao.svg" alt="Novo" class="icon-black" />
        Novo Certificado
      </button>
    </header>

    <div class="search-bar">
      <input type="text" v-model="searchTerm" placeholder="Buscar por aluno ou curso...">
      <select v-model="statusFilter">
        <option value="">Todos os status</option>
        <option value="emitido">Emitido</option>
        <option value="pendente">Pendente</option>
        <option value="cancelado">Cancelado</option>
      </select>
      <select v-model="sortBy">
        <option value="recent">Mais recentes</option>
        <option value="oldest">Mais antigos</option>
        <option value="alpha">Ordem alfabética</option>
      </select>
      <input type="date" v-model="dateFilter" placeholder="Filtrar por data">
    </div>

    <div class="certificados-grid">
      <div v-for="certificado in certificadosFiltrados" :key="certificado.id" class="certificado-card"
        :class="certificado.status">
        <div class="certificado-header">
          <span class="status-badge">{{ certificado.status }}</span>
          <div class="actions">
            <!-- Botões para certificados pendentes -->
            <template v-if="certificado.status === 'pendente'">
              <button @click="emitirCertificado(certificado)" class="btn-emit">
                <img src="/public/icons/imprimir.svg" alt="Emitir" class="icon" />
                Emitir
              </button>
              <button @click="editarCertificado(certificado)" class="btn-edit">
                <img src="/public/icons/edicao.svg" alt="Editar" class="icon" />
                Editar
              </button>
              <button @click="deletarCertificado(certificado.id)" class="btn-delete">
                <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon" />
                Excluir
              </button>
            </template>
            
            <!-- Botões para certificados emitidos -->
            <template v-if="certificado.status === 'emitido'">
              <button @click="downloadCertificado(certificado)" class="btn-download">
                📥 Download PDF
              </button>
              <button @click="visualizarCertificado(certificado)" class="btn-view">
                👁️ Visualizar
              </button>
            </template>
          </div>
        </div>

        <div class="certificado-body">
          <h3>{{ certificado?.usuario?.nome || 'Aluno não encontrado' }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Curso:</span>
              <span>{{ certificado?.curso?.nome || 'Curso não encontrado' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Carga Horária:</span>
              <span>{{ certificado?.curso?.duracao_horas || '--' }}h</span>
            </div>
            <div class="info-item">
              <span class="label">Data de Conclusão:</span>
              <span>{{ formatDate(certificado.data_conclusao) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Código:</span>
              <span>{{ certificado.codigo }}</span>
            </div>
            <div class="info-item">
              <span class="label">Data de Emissão:</span>
              <span>{{ formatDate(certificado.data_emissao) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Email do Aluno:</span>
              <span>{{ certificado?.usuario?.email || '--' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Novo Certificado -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Novo Certificado</h2>
        <form @submit.prevent="salvarCertificado">
          <div class="form-group">
            <label>Aluno*</label>
            <select v-model="novoCertificado.alunoId" required>
              <option value="">Selecione um aluno</option>
              <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">
                {{ aluno.nome }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Curso*</label>
            <select v-model="novoCertificado.cursoId" required>
              <option value="">Selecione um curso finalizado</option>
              <option v-for="curso in cursos" 
                      :key="curso.id" 
                      :value="curso.id"
                      :disabled="curso.status !== 'Finalizado'">
                {{ curso.nome }} ({{ curso.status }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Data de Conclusão*</label>
            <input type="date" v-model="novoCertificado.dataConclusao" required>
          </div>

          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="novoCertificado.observacoes" rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" class="btn-salvar">
              Salvar Certificado
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import api from '../services/api';
import API_URL from '../config/api';

export default {
  name: 'CertificadosAlunos',
  data() {
    return {
      certificados: [],
      alunos: [],
      cursos: [],
      searchTerm: '',
      statusFilter: '',
      sortBy: 'recent',
      dateFilter: '',
      showModal: false,
      novoCertificado: {
        alunoId: '',
        cursoId: '',
        dataConclusao: '',
        observacoes: ''
      },
      editingId: null,
      toast: {
        show: false,
        message: '',
        type: 'success'
      }
    }
  },
  computed: {
    certificadosFiltrados() {
      let filtered = this.certificados.filter(cert => {
        // Filtro por texto (nome do aluno ou curso)
        const matchSearch = !this.searchTerm ||
          cert.usuario?.nome?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          cert.curso?.nome?.toLowerCase().includes(this.searchTerm.toLowerCase());

        // Filtro por status
        const matchStatus = !this.statusFilter ||
          cert.status === this.statusFilter;

        // Filtro por data
        const matchDate = !this.dateFilter ||
          this.formatDate(cert.data_conclusao) === this.formatDate(this.dateFilter);

        return matchSearch && matchStatus && matchDate;
      });

      // Aplicar ordenação
      switch (this.sortBy) {
        case 'recent':
          return filtered.sort((a, b) =>
            new Date(b.data_emissao || b.createdAt) - new Date(a.data_emissao || a.createdAt)
          );
        case 'oldest':
          return filtered.sort((a, b) =>
            new Date(a.data_emissao || a.createdAt) - new Date(b.data_emissao || b.createdAt)
          );
        case 'alpha':
          return filtered.sort((a, b) =>
            (a.usuario?.nome || '').localeCompare(b.usuario?.nome || '')
          );
        default:
          return filtered;
      }
    }
  },
  methods: {
    showToast(message, type = 'success') {
      this.toast = {
        show: true,
        message,
        type
      };
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },
    
    async emitirCertificado(certificado) {
      try {
        // Verificar status atual do curso
        const cursoResponse = await axios.get(`${API_URL}/cursos/${certificado.curso_id}`);
        const curso = cursoResponse.data;
        
        if (!curso) {
          throw new Error('Curso não encontrado');
        }
    
        if (curso.status !== 'Finalizado') {
          throw new Error(`Não é possível emitir certificado para um curso ${curso.status.toLowerCase()}`);
        }
    
        const response = await axios.put(`${API_URL}/certificados/${certificado.id}/emitir`, {
          data_emissao: new Date(),
          status: 'emitido'
        });
    
        await this.loadData();
        this.showToast('Certificado emitido com sucesso!');
      } catch (error) {
        console.error('Erro ao emitir certificado:', error);
        this.showToast(error.message || 'Erro ao emitir certificado', 'error');
      }
    },

    async downloadCertificado(certificado) {
      try {
        const response = await axios.get(
          `${API_URL}/certificados/${certificado.id}/pdf`,
          { responseType: 'blob' }
        );

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado-${certificado.codigo}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erro ao baixar certificado:', error);
        alert('Erro ao baixar certificado');
      }
    },

    async visualizarCertificado(certificado) {
      try {
        const response = await axios.get(
          `${API_URL}/certificados/${certificado.id}/pdf`,
          { responseType: 'blob' }
        );

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erro ao visualizar certificado:', error);
        alert('Erro ao visualizar certificado');
      }
    },

    formatDate(date) {
      if (!date) return '--';
      return new Date(date).toLocaleDateString('pt-BR');
    },
    async loadData() {
      console.log('Carregando dados...');
      try {
        const certificadosRes = await axios.get(`${API_URL}/certificados`, {
          params: {
            include: ['usuario', 'curso']
          }
        });

        this.certificados = certificadosRes.data;
        console.log('Certificados carregados:', this.certificados);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    },
    async salvarCertificado() {
      try {
        // Validar se aluno e curso existem e estão ativos
        const [aluno, curso] = await Promise.all([
          axios.get(`${API_URL}/usuarios/${this.novoCertificado.alunoId}`),
          axios.get(`${API_URL}/cursos/${this.novoCertificado.cursoId}`)
        ]);

        if (!aluno.data || aluno.data.status !== 'ativo') {
          throw new Error('Aluno não encontrado ou inativo');
        }

        // Verificar status atual do curso
        if (!curso.data) {
          throw new Error('Curso não encontrado');
        }

        if (curso.data.status !== 'Finalizado') {
          throw new Error(`Não é possível criar certificado para um curso ${curso.data.status.toLowerCase()}`);
        }

        const certificadoData = {
          usuario_id: this.novoCertificado.alunoId,
          curso_id: this.novoCertificado.cursoId,
          data_conclusao: this.novoCertificado.dataConclusao,
          observacoes: this.novoCertificado.observacoes,
          status: 'pendente'
        };

        if (this.editingId) {
          await axios.put(`${API_URL}/certificados/${this.editingId}`, certificadoData);
          this.showToast('Certificado atualizado com sucesso!');
        } else {
          await axios.post(`${API_URL}/certificados`, certificadoData);
          this.showToast('Certificado criado com sucesso!');
        }

        this.showModal = false;
        this.editingId = null;
        this.resetForm();
        await this.loadData();
      } catch (error) {
        console.error('Erro ao salvar certificado:', error);
        this.showToast(error.response?.data?.error || error.message || 'Erro ao salvar certificado', 'error');
      }
    },

    resetForm() {
      this.novoCertificado = {
        alunoId: '',
        cursoId: '',
        dataConclusao: '',
        observacoes: ''
      }
    },

    downloadCertificado(certificado) {
      // Implementar lógica de download do certificado
      console.log('Download certificado:', certificado.codigo)
    },
    viewDetails(certificado) {
      // Implementar visualização detalhada do certificado
      console.log('Visualizar certificado:', certificado.codigo)
    },
    async editarCertificado(certificado) {
      try {
        if (certificado.status === 'emitido') {
          alert('Não é possível editar um certificado já emitido');
          return;
        }
        this.novoCertificado = {
          alunoId: certificado.usuario_id,
          cursoId: certificado.curso_id,
          dataConclusao: certificado.data_conclusao?.split('T')[0],
          observacoes: certificado.observacoes
        }
        this.editingId = certificado.id
        this.showModal = true
      } catch (error) {
        console.error('Erro ao editar certificado:', error)
        alert('Erro ao editar certificado')
      }
    },

    async deletarCertificado(id) {
      try {
        const certificado = this.certificados.find(c => c.id === id);
        if (!certificado) {
          this.showToast('Certificado não encontrado', 'error');
          return;
        }
    
        if (certificado.status === 'emitido') {
          this.showToast('Não é possível excluir um certificado já emitido', 'error');
          return;
        }
    
        if (confirm('ATENÇÃO: Esta ação excluirá permanentemente o certificado. Esta ação não pode ser desfeita. Você tem certeza que deseja continuar?')) {
          await api.certificados.delete(id);
          // Remove o certificado da lista local
          this.certificados = this.certificados.filter(cert => cert.id !== id);
          this.showToast('Certificado excluído com sucesso!', 'success');
        }
      } catch (error) {
        console.error('Erro ao deletar certificado:', error);
        this.showToast(error.message, 'error');
      }
    },
    

    async carregarUsuariosAtivos() {
      try {
        const response = await axios.get(`${API_URL}/usuarios`, {
          params: { status: 'ativo' }
        });
        this.alunos = response.data;
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        alert('Erro ao carregar lista de alunos');
      }
    },

    async carregarCursosAtivos() {
      try {
        // Buscar todos os cursos para verificar status
        const response = await axios.get(`${API_URL}/cursos`);
        // Filtrar apenas cursos finalizados
        this.cursos = response.data.filter(curso => curso.status === 'Finalizado');
        console.log('Cursos carregados:', this.cursos);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        this.showToast('Erro ao carregar lista de cursos', 'error');
      }
    },

    async abrirModal() {
      try {
        // Carrega dados necessários antes de abrir o modal
        await Promise.all([
          this.carregarUsuariosAtivos(),
          this.carregarCursosAtivos()
        ]);
        this.showModal = true;
      } catch (error) {
        console.error('Erro ao preparar modal:', error);
        alert('Erro ao abrir formulário de novo certificado');
      }
    },

    async loadCertificados() {
      try {
        const response = await axios.get(`${API_URL}/certificados`, {
          withCredentials: true,
          params: {
            include: ['usuario', 'curso']
          }
        });
        this.certificados = response.data;
      } catch (error) {
        console.error('Erro ao carregar certificados:', error);
      }
    }
  },
  created() {
    console.log('Componente montado');
    this.loadData()
  }
}
</script>

<style scoped>
.icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  filter: brightness(0) invert(1); 
}

.icon-black {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  filter: contrast(0.4);
}

.certificados-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

.certificados-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.certificados-header h1 {
  color: #ffffff;
  font-size: 1.8rem;
  margin: 0;
  font-weight: 600;
}

.btn-novo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #ffffff;
  color: #193155;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-novo:hover {
  background-color: #e8eef7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

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
  padding: 0.75rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: #193155;
  transition: all 0.3s ease;
}

.search-bar input:focus,
.search-bar select:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

/* Grid Layout */
.certificados-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Card Styling */
.certificado-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease;
  border: 1px solid rgba(25, 49, 85, 0.1);
}

.certificado-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.certificado-card.emitido .status-badge {
  background-color: #d1fae5;
  color: #059669;
}

.certificado-card.pendente .status-badge {
  background-color: #fef3c7;
  color: #d97706;
}

.certificado-card.cancelado .status-badge {
  background-color: #fee2e2;
  color: #dc2626;
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

.btn-download {
  background-color: #254677;
  color: white;
}

.btn-view {
  background-color: #6c757d;
  color: white;
}

.btn-emit {
  background-color: #28a745;
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

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 2rem;
  border-radius: 8px;
  color: white;
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
}

.toast.success {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
}

.toast.error {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h2 {
  color: #193155;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #193155;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: #193155;
  transition: all 0.3s ease;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e4e8;
}

.btn-cancelar,
.btn-salvar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar {
  background-color: #6c757d;
  color: white;
}

.btn-salvar {
  background-color: #193155;
  color: white;
}

.btn-cancelar:hover,
.btn-salvar:hover {
  transform: translateY(-2px);
}

.btn-cancelar:hover {
  background-color: #5a6268;
}

.btn-salvar:hover {
  background-color: #254677;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .btn-cancelar,
  .btn-salvar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .certificados-container {
    padding: 1rem;
  }

  .certificados-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .search-bar {
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-bar input,
  .search-bar select {
    width: 100%;
  }

  .certificados-grid {
    grid-template-columns: 1fr;
  }
}
</style>