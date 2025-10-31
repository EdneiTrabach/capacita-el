// filepath: d:\PROJETOS-EL\cursos-itilh\src\pages\EnvioEmailsDetalhes.vue
<template>
  <div class="email-container">
    <!-- Mensagem de toast para feedback -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>

    <header class="email-header">
      <button @click="voltarParaSelecao" class="btn-voltar">
        <img src="/public/icons/voltar.svg" alt="Voltar" class="icon" />
        Voltar
      </button>
      <h1>Envio de Emails - {{ cursoNome }}</h1>
    </header>

    <div class="email-content">
      <!-- Seção de seleção de alunos -->
      <div class="selection-section">
        <h2>Selecione os Alunos</h2>

        <div class="filter-controls">
          <div class="search-box">
            <input type="text" v-model="searchTerm" placeholder="Buscar alunos..." class="search-input" />
          </div>

          <div class="selection-actions">
            <button @click="selecionarTodos" class="btn-secundario">
              Selecionar Todos
            </button>
            <button @click="desmarcarTodos" class="btn-secundario">
              Desmarcar Todos
            </button>
          </div>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Carregando alunos matriculados...</p>
        </div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else-if="alunos.length === 0" class="empty-state">
          <img src="/public/icons/informacao.svg" alt="Info" class="info-icon" />
          <p>Nenhum aluno matriculado neste treinamento.</p>
        </div>

        <div v-else class="alunos-grid">
          <div v-for="aluno in alunosFiltrados" :key="aluno.id" class="aluno-card"
            :class="{ selecionado: alunosSelecionados.includes(aluno.id) }" @click="toggleSelecaoAluno(aluno.id)">
            <div class="aluno-avatar">
              <div class="avatar-circle">{{ getInitials(aluno.nome) }}</div>
              <div v-if="alunosSelecionados.includes(aluno.id)" class="check-icon">
                <img src="/public/icons/check.svg" alt="Selecionado" />
              </div>
            </div>
            <div class="aluno-info">
              <h3>{{ aluno.nome }}</h3>
              <p>{{ aluno.email }}</p>
              <p v-if="aluno.setor">{{ aluno.setor }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulário de email -->
      <div class="email-form">
        <h2>Detalhes do Email</h2>

        <div class="form-group">
          <label>Assunto</label>
          <input type="text" v-model="emailData.assunto" placeholder="Informe o assunto do email" class="form-input" />
          <span v-if="errors.assunto" class="error-text">{{ errors.assunto }}</span>
        </div>

        <div class="form-group">
          <label>Modelo de Email</label>
          <select v-model="emailData.modelo" class="form-select">
            <option value="">Selecione um modelo</option>
            <option value="convite">Convite para Treinamento</option>
            <option value="lembrete">Lembrete de Aula</option>
            <option value="material">Material Disponível</option>
            <option value="personalizado">Email Personalizado</option>
          </select>
          <span v-if="errors.modelo" class="error-text">{{ errors.modelo }}</span>
        </div>

        <div v-if="emailData.modelo === 'personalizado'" class="form-group">
          <label>Conteúdo do Email</label>
          <textarea v-model="emailData.conteudo" placeholder="Escreva aqui o conteúdo do seu email..."
            class="form-textarea" rows="10"></textarea>
          <span v-if="errors.conteudo" class="error-text">{{ errors.conteudo }}</span>
        </div>

        <div class="preview-section" v-if="emailData.modelo && emailData.modelo !== 'personalizado'">
          <h3>Preview do Email</h3>
          <div class="email-preview">
            <div v-if="emailData.modelo === 'convite'">
              <h4>Convite para Treinamento: {{ cursoNome }}</h4>
              <p>Olá {Nome do Aluno},</p>
              <p>Gostaríamos de confirmar sua participação no treinamento <strong>{{ cursoNome }}</strong> que começará
                em breve.</p>
              <p>Por favor, reserve esta data em sua agenda e prepare-se para uma experiência de aprendizado
                enriquecedora.</p>
              <p>Atenciosamente,<br>Equipe de Treinamentos</p>
            </div>

            <div v-if="emailData.modelo === 'lembrete'">
              <h4>Lembrete: Aula do Treinamento {{ cursoNome }}</h4>
              <p>Olá {Nome do Aluno},</p>
              <p>Este é um lembrete sobre a próxima aula do treinamento <strong>{{ cursoNome }}</strong>.</p>
              <p>Não se esqueça de verificar o material preparatório e comparecer pontualmente.</p>
              <p>Atenciosamente,<br>Equipe de Treinamentos</p>
            </div>

            <div v-if="emailData.modelo === 'material'">
              <h4>Material Disponível: Treinamento {{ cursoNome }}</h4>
              <p>Olá {Nome do Aluno},</p>
              <p>Os materiais para o treinamento <strong>{{ cursoNome }}</strong> já estão disponíveis em nossa
                plataforma.</p>
              <p>Recomendamos que você revise o conteúdo antes da próxima aula para um melhor aproveitamento.</p>
              <p>Atenciosamente,<br>Equipe de Treinamentos</p>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button @click="enviarEmails" :disabled="isSubmitting || alunosSelecionados.length === 0" class="btn-enviar">
            <img src="/public/icons/email.svg" alt="Enviar" class="icon" />
            {{ isSubmitting ? 'Enviando...' : 'Enviar Emails' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="confirm-modal">
        <h3>Confirmar Envio</h3>
        <p>Você está prestes a enviar {{ alunosSelecionados.length }} emails. Deseja continuar?</p>

        <div class="modal-actions">
          <button @click="showConfirmModal = false" class="btn-cancelar">
            <img src="/public/icons/fechar.svg" alt="Cancelar" class="icon" />
            Cancelar
          </button>
          <button @click="confirmarEnvio" class="btn-enviar">
            <img src="/public/icons/email.svg" alt="Enviar" class="icon" />
            Confirmar Envio
          </button>
        </div>
      </div>
    </div>

    <!-- Adicionar aqui um indicador de status para cada email -->
    <div v-if="envioStatus.loading" class="envio-status loading">
      <div class="spinner"></div>
      <p>Enviando emails... ({{ envioStatus.enviados }} de {{ envioStatus.total }})</p>
    </div>

    <div v-if="envioStatus.success" class="envio-status success">
      <p>{{ envioStatus.enviados }} de {{ envioStatus.total }} emails enviados com sucesso!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/config/supabase'
import { emailService } from '@/services/emailService' // Adicionar esta importação

const router = useRouter()
const route = useRoute()
const cursoId = route.params.cursoId
const cursoNome = ref(route.query.curso || 'Treinamento')

// Estados
const alunos = ref([])
const alunosSelecionados = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const isSubmitting = ref(false)
const showConfirmModal = ref(false)

// Dados do email
const emailData = ref({
  assunto: '',
  modelo: '',
  conteudo: ''
})

const errors = ref({})

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

// Filtrar alunos baseado na busca
const alunosFiltrados = computed(() => {
  if (!searchTerm.value) return alunos.value

  const term = searchTerm.value.toLowerCase()
  return alunos.value.filter(aluno =>
    aluno.nome?.toLowerCase().includes(term) ||
    aluno.email?.toLowerCase().includes(term) ||
    aluno.setor?.toLowerCase().includes(term)
  )
})

// Carregar alunos matriculados no curso
const loadAlunos = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from('matriculas')
      .select(`
        aluno_id,
        usuarios:aluno_id (
          id, 
          nome, 
          email, 
          setor
        )
      `)
      .eq('curso_id', cursoId)
      .eq('status', 'ativo')

    if (err) throw err

    // Extrair dados dos usuários
    const alunosData = data?.map(item => ({
      id: item.usuarios.id,
      nome: item.usuarios.nome,
      email: item.usuarios.email,
      setor: item.usuarios.setor
    })) || []

    alunos.value = alunosData
  } catch (err) {
    console.error('Erro ao carregar alunos:', err)
    error.value = 'Erro ao carregar alunos matriculados. Por favor, tente novamente.'
  } finally {
    loading.value = false
  }
}

// Obter iniciais do nome
const getInitials = (name) => {
  if (!name) return '--'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Selecionar ou desmarcar um aluno
const toggleSelecaoAluno = (alunoId) => {
  const index = alunosSelecionados.value.indexOf(alunoId)
  if (index === -1) {
    alunosSelecionados.value.push(alunoId)
  } else {
    alunosSelecionados.value.splice(index, 1)
  }
}

// Selecionar todos os alunos
const selecionarTodos = () => {
  alunosSelecionados.value = alunosFiltrados.value.map(aluno => aluno.id)
}

// Desmarcar todos os alunos
const desmarcarTodos = () => {
  alunosSelecionados.value = []
}

// Validar o formulário
const validateForm = () => {
  errors.value = {}

  if (!emailData.value.assunto) {
    errors.value.assunto = 'O assunto do email é obrigatório'
  }

  if (!emailData.value.modelo) {
    errors.value.modelo = 'Selecione um modelo de email'
  }

  if (emailData.value.modelo === 'personalizado' && !emailData.value.conteudo) {
    errors.value.conteudo = 'O conteúdo do email é obrigatório'
  }

  if (alunosSelecionados.value.length === 0) {
    showToast('Selecione pelo menos um aluno para enviar o email', 'error')
    return false
  }

  return Object.keys(errors.value).length === 0
}

// Preparar envio de emails
const enviarEmails = () => {
  if (!validateForm()) return
  showConfirmModal.value = true
}

// Voltar para a tela de seleção de cursos
const voltarParaSelecao = () => {
  router.push('/envio-emails')
}

// Adicionar variável reativa para status de envio
const envioStatus = ref({
  loading: false,
  enviados: 0,
  total: 0,
  success: false
})

// Confirmar e executar o envio de emails
const confirmarEnvio = async () => {
  try {
    isSubmitting.value = true
    showConfirmModal.value = false
    envioStatus.value.loading = true
    envioStatus.value.enviados = 0
    envioStatus.value.total = alunosSelecionados.value.length
    envioStatus.value.success = false

    // Obter detalhes do curso
    const { data: cursoData } = await supabase
      .from('cursos')
      .select('nome, data_inicio')
      .eq('id', cursoId)
      .single()

    // Preparar destinatários (alunos selecionados)
    const destinatarios = alunosSelecionados.value.map(alunoId => {
      const aluno = alunos.value.find(a => a.id === alunoId)
      return {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email
      }
    });

    // Configurar o email
    const emailConfig = {
      cursoId: cursoId,
      cursoNome: cursoData?.nome || cursoNome.value,
      assunto: emailData.value.assunto,
      modelo: emailData.value.modelo,
      conteudo: emailData.value.conteudo
    };

    // Usar o serviço de email para enviar
    const result = await emailService.enviarMultiplos(destinatarios, emailConfig);

    if (!result.success) {
      throw new Error(result.error?.message || 'Erro ao enviar emails')
    }

    // Atualizar status de envio
    envioStatus.value.enviados = result.enviados || 0
    envioStatus.value.success = true
    showToast(`${result.enviados || alunosSelecionados.value.length} emails enviados com sucesso!`, 'success')

    // Limpar seleções
    alunosSelecionados.value = []
    emailData.value = {
      assunto: '',
      modelo: '',
      conteudo: ''
    }

  } catch (err) {
    console.error('Erro ao enviar emails:', err)
    showToast('Erro ao enviar emails. Por favor, tente novamente.', 'error')
    envioStatus.value.success = false
  } finally {
    isSubmitting.value = false
    envioStatus.value.loading = false
  }
}

onMounted(() => {
  if (!cursoId) {
    router.push('/envio-emails')
    return
  }

  loadAlunos()
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

.btn-voltar {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #193155;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-voltar:hover {
  background-color: #f0f3f7;
}

.btn-voltar .icon {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
}

.email-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.selection-section,
.email-form {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
  margin-right: 1rem;
}

.selection-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-secundario {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secundario:hover {
  background-color: #e5e7eb;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e4e8;
  border-radius: 4px;
  font-size: 1rem;
}

.alunos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.aluno-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.aluno-card:hover {
  background-color: #f0f3f7;
}

.aluno-card.selecionado {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.aluno-avatar {
  position: relative;
  margin-right: 1rem;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #193155;
  color: white;
  border-radius: 50%;
  font-weight: 500;
}

.check-icon {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background-color: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon img {
  width: 12px;
  height: 12px;
  filter: brightness(0) invert(1);
}

.aluno-info h3 {
  margin: 0;
  font-size: 1rem;
}

.aluno-info p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e4e8;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #193155;
  outline: none;
}

.error-text {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.preview-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e4e8;
}

.email-preview {
  background-color: #f9fafb;
  border: 1px solid #e0e4e8;
  border-radius: 4px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.email-preview h4 {
  margin-top: 0;
  color: #193155;
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.btn-enviar {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: #193155;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-enviar:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-enviar:not(:disabled):hover {
  background-color: #152845;
}

.btn-enviar .icon {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  filter: brightness(0) invert(1);
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirm-modal {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.confirm-modal h3 {
  margin-top: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  gap: 1rem;
}

.btn-cancelar {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancelar:hover {
  background-color: #5c636a;
}

.btn-cancelar .icon {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  filter: brightness(0) invert(1);
}

/* Responsividade */
@media (max-width: 992px) {
  .email-content {
    grid-template-columns: 1fr;
  }
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

.envio-status {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.envio-status.loading {
  background-color: #f0f8ff;
  border: 1px solid #b3d7ff;
}

.envio-status.success {
  background-color: #e6fffa;
  border: 1px solid #b2f5ea;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #b3d7ff;
  border-top: 2px solid #1e88e5;
  border-radius: 50%;
  margin-right: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>