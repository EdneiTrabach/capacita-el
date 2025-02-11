<template>
  <div class="usuarios-container">
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
    <header class="usuarios-header">
      <h1>Pessoas Cadastradas</h1>
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
            <button 
              @click="editarUsuario(usuario)" 
              class="btn-edit"
              :disabled="usuario.tem_certificado"
              :title="usuario.tem_certificado ? 'Não é possível editar um usuário que possui certificados emitidos' : ''"
            >
              <img src="/public/icons/edicao.svg" alt="Editar" class="icon" />
              Editar
            </button>
            <button 
              @click="deletarUsuario(usuario.id)" 
              class="btn-delete"
              :disabled="usuario.tem_certificado"
              :title="usuario.tem_certificado ? 'Não é possível excluir um aluno que possui certificados emitidos' : ''"
            >
              <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon" />
              Excluir
            </button>
          </div>
        </div>

        <div class="usuario-body">
          <h3>{{ sanitizeHTML(usuario.nome) }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Email:</span>
              <span>{{ sanitizeHTML(usuario.email) }}</span>
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
    <!-- Adicione o modal após o grid de usuários -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Editar Aluno</h2>
        <form @submit.prevent="handleEditSubmit" class="edit-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome Completo*</label>
              <input 
                type="text" 
                v-model="editingUser.nome"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                v-model="editingUser.email"
                placeholder="Digite o email"
              />
            </div>

            <div class="form-group">
              <label>Data de Nascimento</label>
              <input 
                type="date" 
                v-model="editingUser.data_nascimento"
              />
            </div>

            <div class="form-group">
              <label>Telefone</label>
              <input 
                type="tel" 
                v-model="editingUser.telefone"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div class="form-group">
              <label>Estado</label>
              <select 
                v-model="editingUser.estado" 
                @change="buscarMunicipios(editingUser.estado)"
              >
                <option value="">Selecione um estado</option>
                <option v-for="estado in estados" :key="estado.uf" :value="estado.uf">
                  {{ estado.nome }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Cidade</label>
              <select 
                v-model="editingUser.cidade"
                :disabled="!editingUser.estado"
              >
                <option value="">Selecione uma cidade</option>
                <option v-for="municipio in municipios" :key="municipio.id" :value="municipio.nome">
                  {{ municipio.nome }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Origem*</label>
              <div class="setor-input-group">
                <select v-model="editingUser.setor" required>
                  <option value="">Selecione uma origem</option>
                  <option v-for="setor in setores" :key="setor.id" :value="setor.nome">
                    {{ setor.nome }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn-cancelar">
              <img src="/icons/fechar.svg" alt="Cancelar" class="icon"/>
              Cancelar
            </button>
            <button type="submit" class="btn-salvar" :disabled="loading">
              <img src="/icons/save-fill.svg" alt="Salvar" class="icon"/>
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../config/supabase'
import { sanitizeHTML } from '@/utils/sanitize'

const router = useRouter()
const usuarios = ref([])
const setores = ref([])
const searchTerm = ref('')
const setorFilter = ref('')
const loading = ref(false)
const error = ref(null)
const statusFilter = ref('')
const sortBy = ref('recent')
const showEditModal = ref(false)
const municipios = ref([])

const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const editingUser = ref({
  id: null,
  nome: '',
  email: '',
  data_nascimento: '',
  telefone: '',
  cidade: '',
  estado: '',
  setor: ''
})

// Computed properties
const setoresUnicos = computed(() => {
  return [...new Set(usuarios.value.map(u => u.setor))].filter(Boolean)
})

const usuariosFiltrados = computed(() => {
  let filtered = usuarios.value.filter(usuario => {
    const matchSearch = !searchTerm.value ||
      usuario.nome?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      usuario.setor?.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchSetor = !setorFilter.value || usuario.setor === setorFilter.value
    const matchStatus = !statusFilter.value || usuario.status === statusFilter.value

    return matchSearch && matchSetor && matchStatus
  })

  // Apply sorting
  switch (sortBy.value) {
    case 'recent':
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'oldest':
      return filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    case 'alpha':
      return filtered.sort((a, b) => a.nome.localeCompare(b.nome))
    default:
      return filtered
  }
})

// Methods
const loadUsuarios = async () => {
  try {
    loading.value = true
    const { data: users, error: err } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) throw err
    usuarios.value = users.map(user => ({
      ...user,
      status: user.status || 'ativo'
    }))
  } catch (err) {
    console.error('Erro ao carregar usuários:', err)
    error.value = 'Erro ao carregar usuários'
  } finally {
    loading.value = false
  }
}

const loadSetores = async () => {
  try {
    const { data: setoresList, error } = await supabase
      .from('setores')
      .select('*')
      .order('nome')

    if (error) throw error
    setores.value = setoresList
  } catch (error) {
    console.error('Erro ao carregar setores:', error)
    showToast('Erro ao carregar setores', 'error')
  }
}

const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type
  }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const formatDate = (date) => {
  if (!date) return '--'
  try {
    const [year, month, day] = date.split('-')
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return '--'
  }
}

const getInitials = (name) => {
  return name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || '??'
}

const toggleStatus = async (usuario, status) => {
  if (usuario.status !== status) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ status })
        .eq('id', usuario.id)

      if (error) throw error

      // Update local state
      const index = usuarios.value.findIndex(u => u.id === usuario.id)
      if (index !== -1) {
        usuarios.value[index] = { ...usuarios.value[index], status }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showToast('Erro ao atualizar status do usuário', 'error')
    }
  }
}

// Função de atualização de status
const atualizarStatusUsuario = async (id, status) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ status })
      .eq('id', id)

    if (error) throw error

    const index = usuarios.value.findIndex(u => u.id === id)
    if (index !== -1) {
      usuarios.value[index] = { ...usuarios.value[index], status }
      showToast(`Status do usuário atualizado para ${status}`, 'success')
    }
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    showToast('Não foi possível atualizar o status do usuário. Tente novamente.', 'error')
  }
}

// Adicione esta função para verificar certificados emitidos
const verificarCertificadosEmitidos = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('certificados')
      .select('status')
      .eq('usuario_id', userId)
      .eq('status', 'emitido')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 é "no rows returned"
      throw error
    }

    return !!data // retorna true se houver certificado emitido
  } catch (err) {
    console.error('Error checking certificates:', err)
    return false
  }
}

// Função de exclusão
const deletarUsuario = async (id) => {
  const usuario = usuarios.value.find(u => u.id === id)
  if (!usuario) return

  try {
    // Primeiro verifica se o usuário tem certificados emitidos
    const temCertificado = await verificarCertificadosEmitidos(id)
    if (temCertificado) {
      showToast('Não é possível excluir um aluno que possui certificados emitidos', 'error')
      return
    }

    if (confirm(`Deseja realmente excluir o usuário ${usuario.nome}?\nEsta ação não poderá ser desfeita.`)) {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id)

      if (error) throw error

      usuarios.value = usuarios.value.filter(u => u.id !== id)
      showToast('Usuário excluído com sucesso!', 'success')
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    showToast('Não é possível excluir o usuário. Tente novamente.', 'error')
  }
}

const editarUsuario = async (usuario) => {
  try {
    editingUser.value = { ...usuario }
    showEditModal.value = true
  } catch (error) {
    console.error('Erro ao preparar edição:', error)
    showToast('Erro ao abrir formulário de edição', 'error')
  }
}

const handleEditSubmit = async () => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        nome: editingUser.value.nome,
        email: editingUser.value.email,
        data_nascimento: editingUser.value.data_nascimento,
        telefone: editingUser.value.telefone,
        cidade: editingUser.value.cidade,
        estado: editingUser.value.estado,
        setor: editingUser.value.setor,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingUser.value.id)

    if (error) throw error

    // Atualiza o usuário na lista local
    const index = usuarios.value.findIndex(u => u.id === editingUser.value.id)
    if (index !== -1) {
      usuarios.value[index] = { ...usuarios.value[index], ...editingUser.value }
    }

    showEditModal.value = false
    showToast('Usuário atualizado com sucesso', 'success')
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    showToast('Erro ao atualizar usuário', 'error')
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = {
    id: null,
    nome: '',
    email: '',
    data_nascimento: '',
    telefone: '',
    cidade: '',
    estado: '',
    setor: ''
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await Promise.all([
      loadUsuarios(),
      loadSetores()
    ])
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    showToast('Erro ao carregar dados', 'error')
  }
})

// Expose necessary functions and variables to template
const utils = {
  formatDate,
  getInitials,
  sanitizeHTML,
  toggleStatus,
  showToast
}

defineExpose({
  deletarUsuario,
  editarUsuario,
  handleEditSubmit,
  closeEditModal
})
</script>

<style scoped>


.btn-edit:disabled,
.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}


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
  grid-template-columns: repeat(2, minmax(350px, 1fr));
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
  grid-template-columns: repeat(2, minmax(350px, 1fr));
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

/* Modal Styling */
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
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.modal-content h2 {
  color: #193155;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e4e8;
  font-weight: 600;
}

.edit-form .form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #193155;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: #193155;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }

  .edit-form .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .btn-cancelar,
  .btn-salvar {
    width: 100%;
    justify-content: center;
  }
}
</style>