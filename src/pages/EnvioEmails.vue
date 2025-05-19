<template>
  <div class="email-container">
    <!-- Mensagem de toast para feedback -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>

    <header class="email-header">
      <img src="/public/icons/email.svg" alt="Emails" class="header-icon" />
      <h1>Envio de Emails</h1>
    </header>

    <!-- Seção de seleção de treinamento -->
    <div class="selection-section">
      <h2>Selecione um Treinamento</h2>

      <div class="filter-bar">
        <!-- Filtros aprimorados -->
        <div class="filter-group">
          <label>Ano:</label>
          <select v-model="filtros.ano" @change="loadCursos" class="filter-select">
            <option value="">Todos os anos</option>
            <option v-for="ano in anos" :key="ano" :value="ano">{{ ano }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select v-model="filtros.status" @change="loadCursos" class="filter-select">
            <option value="">Todos os status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizados</option>
            <option value="Aguardando">Aguardando</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Busca:</label>
          <input type="text" v-model="searchTerm" placeholder="Buscar treinamento..." class="search-input" />
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando treinamentos...</p>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="cursosFiltrados.length === 0" class="empty-state">
        <img src="/public/icons/informacao.svg" alt="Info" class="info-icon" />
        <p>Nenhum treinamento encontrado com os filtros selecionados.</p>
      </div>

      <div v-else class="cursos-grid">
        <div v-for="curso in cursosFiltrados" :key="curso.id" class="curso-card" @click="selecionarCurso(curso)">
          <div class="curso-header">
            <h3>{{ sanitizeHTML(curso.nome) }}</h3>
          </div>
          <div class="curso-body">
            <p class="curso-desc">{{ sanitizeHTML(curso.descricao) }}</p>
            <div class="curso-info">
              <div class="info-item">
                <img src="/public/icons/calendario.svg" alt="Data" class="icon-small" />
                <span>Início: {{ formatDate(curso.data_inicio) }}</span>
              </div>
              <div class="info-item">
                <img src="/public/icons/status.svg" alt="Status" class="icon-small" />
                <span>Status: <span :class="`status-${curso.status.toLowerCase().replace(' ', '_')}`">{{ curso.status
                }}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { sanitizeHTML } from '@/utils/sanitize'

const router = useRouter()
const cursos = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')

// Anos para o filtro
const anos = ref([])
const anoAtual = new Date().getFullYear()

// Gerar os últimos 5 anos para o filtro
for (let i = 0; i < 5; i++) {
  anos.value.push(anoAtual - i)
}

// Filtros
const filtros = ref({
  ano: '',
  status: 'Em andamento' // Por padrão, mostrar cursos em andamento
})

// Toast para mensagens de feedback
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// Função para mostrar mensagens de toast
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

// Filtrar cursos baseado na busca e filtros
const cursosFiltrados = computed(() => {
  let filtrados = cursos.value

  // Filtrar por termo de busca
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtrados = filtrados.filter(curso =>
      curso.nome?.toLowerCase().includes(term) ||
      curso.descricao?.toLowerCase().includes(term) ||
      curso.professor_responsavel?.toLowerCase().includes(term)
    )
  }

  return filtrados
})

// Carregar cursos baseado nos filtros
const loadCursos = async () => {
  try {
    loading.value = true
    error.value = null

    // Montar a query base
    let query = supabase
      .from('cursos')
      .select('*')
      .order('data_inicio', { ascending: false })

    // Aplicar filtro de status se houver
    if (filtros.value.status) {
      query = query.eq('status', filtros.value.status)
    }

    // Aplicar filtro de ano se houver
    if (filtros.value.ano) {
      const anoInicio = `${filtros.value.ano}-01-01`
      const anoFim = `${filtros.value.ano}-12-31`
      query = query
        .gte('data_inicio', anoInicio)
        .lte('data_inicio', anoFim)
    }

    // Executar a query
    const { data, error: err } = await query

    if (err) throw err

    cursos.value = data || []

    // Mostrar mensagem se não encontrar cursos
    if (cursos.value.length === 0 && !error.value) {
      showToast('Nenhum treinamento encontrado com os filtros selecionados.', 'info')
    }

  } catch (err) {
    console.error('Erro ao carregar cursos:', err)
    error.value = 'Erro ao carregar treinamentos. Por favor, tente novamente.'
  } finally {
    loading.value = false
  }
}

// Formatar data para exibição
const formatDate = (date) => {
  if (!date) return '--'
  try {
    return date.split('T')[0].split('-').reverse().join('/')
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return '--'
  }
}

// Selecionar curso e navegar para seleção de alunos
const selecionarCurso = (curso) => {
  router.push({
    path: `/envio-emails/${curso.id}`,
    query: { curso: curso.nome }
  })
}

onMounted(() => {
  loadCursos()
})
</script>

<style>
.email-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

.email-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e4e8;
}

.header-icon {
  width: 36px;
  height: 36px;
  margin-right: 1rem;
}

.selection-section {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Nova barra de filtros melhorada */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e0e4e8;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4b5563;
}

.filter-select,
.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e0e4e8;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

.search-input {
  width: 100%;
}

.cursos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.curso-card {
  background-color: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e0e4e8;
}

.curso-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.curso-header {
  background-color: #193155;
  color: white;
  padding: 1rem;
}

.curso-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.curso-body {
  padding: 1rem;
}

.curso-desc {
  color: #4b5563;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.curso-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #6b7280;
}

.icon-small {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.info-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

/* Classes para os status */
.status-em_andamento {
  color: #3b82f6;
  font-weight: 600;
}

.status-finalizado {
  color: #10b981;
  font-weight: 600;
}

.status-aguardando {
  color: #f59e0b;
  font-weight: 600;
}

.status-cancelado {
  color: #ef4444;
  font-weight: 600;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  color: white;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
  max-width: 350px;
}

.toast.success {
  background-color: #10b981;
}

.toast.error {
  background-color: #ef4444;
}

.toast.warning {
  background-color: #f59e0b;
}

.toast.info {
  background-color: #3b82f6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .email-container {
    padding: 1rem;
  }

  .filter-bar {
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }
}
</style>