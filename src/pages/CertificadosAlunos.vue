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
      <input type="text" v-model="searchTerm" placeholder="Buscar por pessoa ou curso...">
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
          <h3>{{ sanitizeHTML(certificado.usuario?.nome) }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Treinamento:</span>
              <span>{{ sanitizeHTML(certificado.curso?.nome) }}</span>
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
            <div class="info-item">
              <span class="label">Observações:</span>
              <span>{{ sanitizeHTML(certificado.observacoes) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Novo Certificado -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ editingId ? 'Editar Certificado' : 'Novo Certificado' }}</h2>
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
            <label>Treinamento*</label>
            <select v-model="novoCertificado.cursoId" required>
              <option value="">Selecione um curso finalizado</option>
              <option v-for="curso in cursos" :key="curso.id" :value="curso.id"
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
            <button type="button" @click="fecharModal" class="btn-cancelar">
              <img src="/public/icons/fechar.svg" alt="Cancelar" class="icon"/>
              Cancelar
            </button>
            <button type="submit" class="btn-salvar">
              <img src="/public/icons/save-fill.svg" alt="Salvar" class="icon"/>
              {{ editingId ? 'Atualizar' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Preview -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="closePreviewModal">
      <div class="modal-content preview-modal" @click.stop>
        <button class="close-btn" @click="closePreviewModal">×</button>
        <iframe :src="previewUrl" class="preview-frame"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import { sanitizeHTML } from '@/utils/sanitize'
import { certificateService } from '@/services/certificateService'

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
      },
      showPreviewModal: false,
      previewUrl: ''
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

    async downloadCertificado(certificado) {
      try {
        const pdf = await certificateService.generateCertificatePDF(certificado)
        pdf.save(`certificado-${certificado.codigo}.pdf`)
      } catch (error) {
        console.error('Erro ao baixar certificado:', error)
        this.showToast('Erro ao baixar certificado', 'error')
      }
    },

    async visualizarCertificado(certificado) {
      try {
        const pdf = await certificateService.generateCertificatePDF(certificado)
        const blob = pdf.output('blob')
        const url = URL.createObjectURL(blob)
        
        // Abrir modal com preview
        this.previewUrl = url
        this.showPreviewModal = true
      } catch (error) {
        console.error('Erro ao visualizar certificado:', error)
        this.showToast('Erro ao visualizar certificado', 'error')
      }
    },

    formatDate(date) {
      if (!date) return '--'
      try {
        return date.split('T')[0].split('-').reverse().join('/')
      } catch (error) {
        console.error('Erro ao formatar data:', error)
        return '--'
      }
    },

    async loadData() {
      try {
        const { data, error } = await supabase
          .from('certificados')
          .select(`
            *,
            usuario:usuarios(*),
            curso:cursos(*)
          `)
        
        if (error) throw error
        this.certificados = data
      } catch (error) {
        console.error('Erro ao carregar certificados:', error)
        this.showToast('Erro ao carregar certificados', 'error')
      }
    },
    async salvarCertificado() {
      try {
        const certificadoData = {
          usuario_id: this.novoCertificado.alunoId,
          curso_id: this.novoCertificado.cursoId,
          data_conclusao: this.novoCertificado.dataConclusao,
          observacoes: this.novoCertificado.observacoes,
          updated_at: new Date().toISOString()
        }

        if (this.editingId) {
          // Atualizar certificado existente
          const { error } = await supabase
            .from('certificados')
            .update(certificadoData)
            .eq('id', this.editingId)

          if (error) throw error
          this.showToast('Certificado atualizado com sucesso!', 'success')
        } else {
          // Inserir novo certificado
          certificadoData.status = 'pendente'
          certificadoData.created_at = new Date().toISOString()
          
          const { error } = await supabase
            .from('certificados')
            .insert([certificadoData])

          if (error) throw error
          this.showToast('Certificado criado com sucesso!', 'success')
        }

        this.showModal = false
        this.editingId = null
        this.resetForm()
        await this.loadData()
      } catch (error) {
        console.error('Erro ao salvar certificado:', error)
        this.showToast('Erro ao salvar certificado', 'error')
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

    async deletarCertificado(id) {
      if (confirm('Tem certeza que deseja excluir este certificado?')) {
        try {
          const { error } = await supabase
            .from('certificados')
            .delete()
            .eq('id', id)

          if (error) throw error
          await this.loadData()
          this.showToast('Certificado excluído com sucesso')
        } catch (error) {
          console.error('Erro ao deletar certificado:', error)
          this.showToast('Erro ao excluir certificado', 'error')
        }
      }
    },
    viewDetails(certificado) {
      // Implementar visualização detalhada do certificado
      console.log('Visualizar certificado:', certificado.codigo)
    },
    async editarCertificado(certificado) {
      try {
        if (certificado.status === 'emitido') {
          this.showToast('Não é possível editar um certificado já emitido', 'error')
          return
        }

        // Carregar dados dos selects antes de abrir o modal
        await Promise.all([
          this.carregarUsuariosAtivos(),
          this.carregarCursosAtivos()
        ])

        // Preencher o formulário com os dados existentes
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
        this.showToast('Erro ao editar certificado', 'error')
      }
    },

    async carregarUsuariosAtivos() {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('status', 'ativo')

        if (error) throw error
        this.alunos = data
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        this.showToast('Erro ao carregar lista de alunos', 'error')
      }
    },

    async carregarCursosAtivos() {
      try {
        const { data, error } = await supabase
          .from('cursos')
          .select('*')
          .eq('status', 'Finalizado')

        if (error) throw error
        this.cursos = data
        console.log('Cursos carregados:', this.cursos)
      } catch (error) {
        console.error('Erro ao carregar cursos:', error)
        this.showToast('Erro ao carregar lista de cursos', 'error')
      }
    },

    async abrirModal() {
      try {
        await Promise.all([
          this.carregarUsuariosAtivos(),
          this.carregarCursosAtivos()
        ])
        this.editingId = null // Garante que é um novo certificado
        this.resetForm() // Limpa o formulário
        this.showModal = true
      } catch (error) {
        console.error('Erro ao preparar modal:', error)
        this.showToast('Erro ao abrir formulário', 'error')
      }
    },

    fecharModal() {
      this.showModal = false
      this.editingId = null
      this.resetForm()
    },

    async loadCertificados() {
      try {
        const { data } = await api.certificados.getAll()
        this.certificados = data
      } catch (error) {
        console.error('Erro ao carregar certificados:', error)
        this.showToast('Erro ao carregar certificados', 'error')
      }
    },

    async emitirCertificado(certificado) {
      try {
        const { error } = await supabase
          .from('certificados')
          .update({ 
            status: 'emitido',
            data_emissao: new Date().toISOString()
          })
          .eq('id', certificado.id)

        if (error) throw error
        await this.loadData()
        this.showToast('Certificado emitido com sucesso!')
      } catch (error) {
        console.error('Erro ao emitir certificado:', error)
        this.showToast('Erro ao emitir certificado', 'error')
      }
    },
    closePreviewModal() {
      this.showPreviewModal = false
      this.previewUrl = ''
    },
    sanitizeHTML
  },
  created() {
    console.log('Componente montado');
    this.loadData()
  }
}
</script>

<style scoped>
.certificados-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
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
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar input,
.search-bar select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary);
  background-color: var(--input-bg);
  transition: all 0.3s ease;
}

.search-bar input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.search-bar select option {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.search-bar input:focus,
.search-bar select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-alpha);
}

/* Grid Layout */
.certificados-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(350px, 1fr));
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
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
}

/* Card Header */
.certificado-header {
  padding: 1.25rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e4e8;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
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
  color: var(--text-primary);
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
  color: var(--text-secondary);
}

.info-item span:last-child {
  color: #193155;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-primary);
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
  background: var(--bg-secondary);
}

.modal-content h2 {
  color: #193155;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #193155;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary);
  background-color: var(--input-bg);
  transition: all 0.3s ease;
}

.form-group select option {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus,
.search-bar input:focus,
.search-bar select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-alpha);
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
  display: flex;
  align-items: center;
  gap: 12px;
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

.preview-modal {
  width: 95%;
  height: 95%;
  max-width: none;
  padding: 1rem;
}

.preview-frame {
  width: 100%;
  height: calc(100% - 40px);
  border: none;
}

.close-btn {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: #193155;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #254677;
  transform: scale(1.1);
}
</style>