<template>
  <div class="usuarios-container">
    <header class="usuarios-header">
      <h1>Alunos Cadastrados</h1>
      <button @click="$router.push('/usuarios')" class="btn-novo">
        <img src="/public/icons/adicao.svg" alt="Novo" class="icon-black" />
        Novo Aluno
      </button>
    </header>

    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchTerm" 
        placeholder="Buscar por nome, email ou setor..."
      >
      <select v-model="setorFilter">
        <option value="">Todos os setores</option>
        <option v-for="setor in setoresUnicos" :key="setor" :value="setor">
          {{ setor }}
        </option>
      </select>
      <select v-model="statusFilter">
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="cursando">Cursando</option>
        <option value="inativo">Inativo</option>
      </select>
      <select v-model="sortBy">
        <option value="recent">Mais recentes</option>
        <option value="oldest">Mais antigos</option>
        <option value="alpha">Ordem alfabética</option>
      </select>
    </div>

    <div class="usuarios-grid">
      <div v-for="usuario in usuariosFiltrados" :key="usuario.id" class="usuario-card">
        <div class="usuario-header">
          <span class="usuario-avatar">{{ getInitials(usuario.nome) }}</span>
          <div class="actions">
            <button @click="editarUsuario(usuario)" class="btn-edit">
              <img src="/public/icons/edicao.svg" alt="Editar" class="icon"/>
              Editar
            </button>
            <button @click="deletarUsuario(usuario.id)" class="btn-delete">
              <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon"/>
              Excluir
            </button>
          </div>
        </div>

        <div class="usuario-body">
          <h3>{{ usuario.nome }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Email:</span>
              <span>{{ usuario.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">Telefone:</span>
              <span>{{ usuario.telefone }}</span>
            </div>
            <div class="info-item">
              <span class="label">Setor:</span>
              <span>{{ usuario.setor }}</span>
            </div>
            <div class="info-item">
              <span class="label">Cidade:</span>
              <span>{{ usuario.cidade }}/{{ usuario.estado }}</span>
            </div>
            <div class="info-item">
              <span class="label">Data de Nascimento:</span>
              <span>{{ formatDate(usuario.data_nascimento) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <span :class="'status-' + usuario.status">{{ usuario.status }}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <div class="status-toggle">
            <button 
              @click="toggleStatus(usuario, 'ativo')" 
              :class="['status-btn', { active: usuario.status === 'ativo' }]">
            <img src="/public/icons/check.svg" alt="Ativo" class="icon-black"/>
            Ativo
          </button>
            <button 
              @click="toggleStatus(usuario, 'cursando')" 
              :class="['status-btn', { active: usuario.status === 'cursando' }]"
            >
            <img src="/public/icons/cursando.svg" alt="Cursando" class="icon-black"/>
            Cursando
            </button>
            <button 
              @click="toggleStatus(usuario, 'inativo')" 
              :class="['status-btn', { active: usuario.status === 'inativo' }]"
            >
            <img src="/public/icons/fechar.svg" alt="Editar" class="icon-black"/>
            Inativo
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import ConfirmDialog from '../components/ConfirmDialog.vue'

export default {
  name: 'ListaUsuarios',
  components: {
    ConfirmDialog
  },
  data() {
    return {
      usuarios: [],
      searchTerm: '',
      setorFilter: '',
      loading: false,
      error: null,
      statusFilter: '',
      sortBy: 'recent' // Default sorting by most recent
    }
  },
  async created() {
    await this.loadUsuarios()
  },
  computed: {
    setoresUnicos() {
      return [...new Set(this.usuarios.map(u => u.setor))].filter(Boolean)
    },
    usuariosFiltrados() {
      let filtered = this.usuarios.filter(usuario => {
        const matchSearch = !this.searchTerm ||
          usuario.nome?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          usuario.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          usuario.setor?.toLowerCase().includes(this.searchTerm.toLowerCase())

        const matchSetor = !this.setorFilter || usuario.setor === this.setorFilter
        const matchStatus = !this.statusFilter || usuario.status === this.statusFilter

        return matchSearch && matchSetor && matchStatus
      })

      // Apply sorting
      switch (this.sortBy) {
        case 'recent':
          return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        case 'oldest':
          return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        case 'alpha':
          return filtered.sort((a, b) => a.nome.localeCompare(b.nome))
        default:
          return filtered
      }
    }
  },
  methods: {
    getInitials(name) {
      return name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || '??'
    },
    async loadUsuarios() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/usuarios');
        if (response.data) {
          this.usuarios = response.data;
          console.log('Usuários carregados:', this.usuarios.length);
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        this.error = 'Erro ao carregar usuários';
        if (error.response) {
          console.error('Erro detalhado:', error.response.data);
        }
      } finally {
        this.loading = false;
      }
    },
    async deletarUsuario(id) {
      if (confirm('ATENÇÃO: Esta ação excluirá permanentemente o usuário do sistema. Esta ação não pode ser desfeita. Você tem certeza que deseja continuar?')) {
        try {
          await api.delete(`/usuarios/${id}`)
          await this.loadUsuarios()
          alert('Usuário excluído com sucesso')
        } catch (error) {
          console.error('Erro ao deletar usuário:', error)
          alert('Erro ao excluir usuário. Por favor, tente novamente.')
        }
      }
    },
    async editarUsuario(usuario) {
      try {
        this.$router.push({
          name: 'CadastroUsuarios',
          params: { id: usuario.id },
          query: { edit: true }
        })
      } catch (error) {
        console.error('Erro ao editar usuário:', error)
        alert('Erro ao editar usuário. Por favor, tente novamente.')
      }
    },
    async alterarStatus(usuario) {
      const novoStatus = prompt('Digite o novo status (ativo/cursando/inativo):', usuario.status);
      if (novoStatus && ['ativo', 'cursando', 'inativo'].includes(novoStatus)) {
        try {
          await axios.put(`http://localhost:3000/usuarios/${usuario.id}`, {
            ...usuario,
            status: novoStatus
          });
          await this.loadUsuarios();
          alert('Status atualizado com sucesso!');
        } catch (error) {
          console.error('Erro ao atualizar status:', error);
          alert('Erro ao atualizar status');
        }
      }
    },
    async toggleStatus(usuario, status) {
      if (usuario.status !== status) {
        try {
          await api.put(`/usuarios/${usuario.id}`, {
            ...usuario,
            status: status
          });
          // Update the user in place instead of reloading all users
          const index = this.usuarios.findIndex(u => u.id === usuario.id);
          if (index !== -1) {
            this.usuarios[index] = { ...this.usuarios[index], status: status };
          }
        } catch (error) {
          console.error('Erro ao atualizar status:', error);
        }
      }
    },
    formatDate(date) {
      if (!date) return '--'
      return new Date(date).toLocaleDateString('pt-BR')
    }
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

.usuarios-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

.usuarios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.usuarios-header h1 {
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

.search-bar input {
  flex: 2;
}

.search-bar select {
  flex: 1;
  min-width: 150px;
  background-color: white;
}

.search-bar input:focus,
.search-bar select:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

.usuarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Card de Usuário */
.usuario-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease;
  border: 1px solid rgba(25, 49, 85, 0.1);
}

.usuario-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Cabeçalho do Card */
.usuario-header {
  padding: 1.25rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e4e8;
}

.usuario-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(25, 49, 85, 0.2);
}

/* Corpo do Card */
.usuario-body {
  padding: 1.5rem;
}

.usuario-body h3 {
  color: #193155;
  font-size: 1.3rem;
  margin: 0 0 1.25rem 0;
  font-weight: 600;
  line-height: 1.2;
}

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

/* Melhorando o contraste dos valores */
.info-item span:last-child {
  color: #193155; /* Cor principal do projeto para melhor contraste */
  font-weight: 500; /* Peso da fonte mais pronunciado */
  font-size: 0.95rem; /* Tamanho ligeiramente maior */
}

/* Estilização específica para cada tipo de informação */
.info-item span[class^="status-"] {
  font-weight: 600;
}

/* Status Badges */
.status-ativo { 
  color: #198754 !important;
}

.status-cursando { 
  color: #0d6efd !important;
}

.status-inativo { 
  color: #dc3545 !important;
}

/* Botões de Ação */
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

/* Seção de Status Toggle */
.card-actions {
  padding: 1rem;
  border-top: 1px solid #e0e4e8;
  background: #f8f9fa;
}

.status-toggle {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.status-btn {
  padding: 0.75rem 1.25rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  background-color: white;
  color: #495057;
  transition: all 0.3s ease;
  font-weight: 500;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.status-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.status-btn.active {
  color: white;
  border-color: transparent;
}

.status-btn.active:nth-child(1) {
  background-color: #198754;
}

.status-btn.active:nth-child(2) {
  background-color: #0d6efd;
}

.status-btn.active:nth-child(3) {
  background-color: #dc3545;
}

/* Responsividade */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .status-toggle {
    flex-direction: column;
  }

  .status-btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .usuarios-container {
    padding: 1rem;
  }

  .usuarios-header {
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

  .usuarios-grid {
    grid-template-columns: 1fr;
  }
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

.certificados-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

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

.certificado-header {
  padding: 1.25rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e4e8;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
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
  transition: all 0.3s ease;
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