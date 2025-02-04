<template>
  <div class="cadastro-container">
    <!-- Add toast notification -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>

    <div class="cadastro-card">
      <header class="cadastro-header">
        <h1>{{ isEditing ? 'Editar Aluno' : 'Cadastro de Aluno' }}</h1>
      </header>

      <form @submit.prevent="handleSubmit" class="cadastro-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Nome Completo*</label>
            <input 
              type="text" 
              v-model="formData.nome"
              :class="{ error: errors.nome }"
              placeholder="Digite o nome completo"
              @blur="validateField('nome', formData.nome)"
            />
            <span class="error-message" v-if="errors.nome">{{ errors.nome }}</span>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="formData.email"
              :class="{ error: errors.email }"
              placeholder="Digite o email"
            />
            <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label>Data de Nascimento</label>
            <input 
              type="date" 
              v-model="formData.dataNascimento"
              :class="{ error: errors.dataNascimento }"
              :min="'1900-01-01'"
              :max="maxDate"
              @change="validateDate"
            />
            <span class="error-message" v-if="errors.dataNascimento">{{ errors.dataNascimento }}</span>
          </div>

          <div class="form-group">
            <label>Telefone</label>
            <input 
              type="tel" 
              v-model="formData.telefone"
              :class="{ error: errors.telefone }"
              placeholder="(00) 00000-0000"
            />
            <span class="error-message" v-if="errors.telefone">{{ errors.telefone }}</span>
          </div>

          <div class="form-group">
            <label>CPF</label>
            <input 
              type="text" 
              v-model="formData.documento"
              :class="{ error: errors.documento }"
              placeholder="000.000.000-00"
              maxlength="14"
              @input="handleCPFInput"
              @blur="validateCPFOnBlur"
            />
            <span class="error-message" v-if="errors.documento">{{ errors.documento }}</span>
          </div>

          <div class="form-group">
            <label>Estado</label>
            <select 
              v-model="formData.estado"
              :class="{ error: errors.estado }"
              @change="buscarMunicipios(formData.estado)"
            >
              <option value="">Selecione um estado</option>
              <option v-for="estado in estados" :key="estado.uf" :value="estado.uf">
                {{ estado.nome }}
              </option>
            </select>
            <span class="error-message" v-if="errors.estado">{{ errors.estado }}</span>
          </div>

          <div class="form-group">
            <label>Cidade</label>
            <select 
              v-model="formData.cidade"
              :class="{ error: errors.cidade }"
              :disabled="!formData.estado"
            >
              <option value="">Selecione uma cidade</option>
              <option v-for="municipio in municipios" :key="municipio.id" :value="municipio.nome">
                {{ municipio.nome }}
              </option>
            </select>
            <span class="error-message" v-if="errors.cidade">{{ errors.cidade }}</span>
          </div>

          <div class="form-group">
            <label>Origem</label>
            <div class="setor-input-group">
              <select 
                v-model="formData.setor"
                :class="{ error: errors.setor }"
                @blur="validateField('setor', formData.setor)"
              >
                <option value="">Selecione um setor</option>
                <option v-for="setor in setores" :key="setor.id" :value="setor.nome">
                  {{ setor.nome }}
                </option>
              </select>
              <button type="button" @click="showSetorModal = true" class="btn-add-setor">
                +
              </button>
            </div>
            <span class="error-message" v-if="errors.setor">{{ errors.setor }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancelar" @click="$router.push('/')">
            <img src="/public/icons/fechar.svg" alt="Cancelar" class="icon"/>
            Cancelar
          </button>
          <button type="submit" class="btn-salvar">
            <img src="/public/icons/save-fill.svg" alt="Salvar" class="icon"/>
            {{ isEditing ? 'Atualizar' : 'Salvar' }}
          </button>
        </div>
      </form>

      <div v-if="showSetorModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Nova Origem</h3>
          <div class="form-group">
            <label>Nome da Origem*</label>
            <input 
              type="text" 
              v-model="novoSetor"
              placeholder="Digite o nome da nova origem"
            />
          </div>
          <div class="modal-actions">
            <button @click="showSetorModal = false" class="btn-cancelar">
              <img src="/public/icons/fechar.svg" alt="Cancelar" class="icon"/>
              Cancelar
            </button>
            <button @click="cadastrarNovoSetor" class="btn-salvar">
              <img src="/public/icons/save-fill.svg" alt="Salvar" class="icon"/>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../config/supabase'
import { setorService } from '../services/api'

const router = useRouter()
const route = useRoute()
const isEditing = ref(false)

const formData = ref({
  nome: '',
  email: '',
  dataNascimento: '',
  telefone: '',
  documento: '', 
  cidade: '',
  estado: '',
  setor: ''
})

const errors = ref({})
const setores = ref([])
const novoSetor = ref('')
const showSetorModal = ref(false)
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// No data/ref
const municipios = ref([])

const maxDate = ref(new Date().toISOString().split('T')[0])

onMounted(async () => {
  await loadSetores()
  // Define isEditing baseado na query da rota
  isEditing.value = route.query.edit === 'true'
  if (isEditing.value && route.params.id) {
    await loadUsuario(route.params.id)
  }
})

const estados = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' },
]

const loadSetores = async () => {
  try {
    setores.value = await setorService.listarSetores()
  } catch (error) {
    console.error('Erro ao carregar setores:', error)
    showToast('Erro ao carregar setores', 'error')
  }
}

const cadastrarNovoSetor = async () => {
  if (!novoSetor.value) {
    showToast('Digite o nome do setor', 'error')
    return
  }

  try {
    // Verifica se já existe um setor com o mesmo nome
    const { data: setorExistente } = await supabase
      .from('setores')
      .select('id')
      .ilike('nome', novoSetor.value.trim())
      .single()

    if (setorExistente) {
      showToast('Já existe uma origem cadastrada com este nome', 'error')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const setorData = {
      nome: novoSetor.value.trim(),
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Cadastra o novo setor
    await setorService.cadastrarSetor(novoSetor.value)
    
    await loadSetores() 
    showSetorModal.value = false
    novoSetor.value = ''
    showToast('Origem cadastrada com sucesso', 'success')
  } catch (error) {
    console.error('Erro ao cadastrar origem:', error)
    showToast('Erro ao cadastrar nova origem', 'error')
  }
}

// Adicione o método para buscar municípios
const buscarMunicipios = async (uf) => {
  try {
    if (!uf) {
      municipios.value = []
      formData.value.cidade = ''
      return
    }
    
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
    const data = await response.json()
    municipios.value = data.map(municipio => ({
      id: municipio.id,
      nome: municipio.nome
    }))

    // Limpa a cidade selecionada quando trocar o estado
    formData.value.cidade = ''
  } catch (error) {
    console.error('Erro ao buscar municípios:', error)
    showToast('Erro ao carregar municípios', 'error')
  }
}

// Adicione um watch para o estado
watch(() => formData.value.estado, (novoEstado) => {
  if (novoEstado) {
    buscarMunicipios(novoEstado)
  } else {
    municipios.value = []
    formData.value.cidade = ''
  }
})

// Adicione estas funções no script
const formatCPF = (cpf) => {
  // Remove tudo que não é número
  const cleaned = cpf.replace(/\D/g, '')
  
  // Aplica a máscara XXX.XXX.XXX-XX
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const isCPFValid = (cpf) => {
  // Remove caracteres não numéricos
  const strCPF = cpf.replace(/\D/g, '')
  
  if (strCPF.length !== 11) return false
  
  // Verifica CPFs com dígitos iguais
  if (/^(\d)\1{10}$/.test(strCPF)) return false
  
  // Validação dos dígitos verificadores
  let sum = 0
  let remainder
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(strCPF.substring(9, 10))) return false
  
  // Segundo dígito verificador
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(strCPF.substring(10, 11))) return false
  
  return true
}

// Adicione um watch para formatar o CPF enquanto digita
watch(() => formData.value.documento, (newValue) => {
  if (!newValue) return
  
  // Remove tudo que não é número
  const justNumbers = newValue.replace(/\D/g, '')
  
  // Limita a 11 dígitos
  if (justNumbers.length > 11) {
    formData.value.documento = formatCPF(justNumbers.slice(0, 11))
    return
  }
  
  // Formata o CPF
  formData.value.documento = formatCPF(justNumbers)
})

// Função de validação individual para cada campo
const validateField = (field, value) => {
  const errors = {}
  
  switch (field) {
    case 'nome':
      if (!value) errors.nome = 'Nome é obrigatório'
      break
      
    case 'documento':
      if (value && !isCPFValid(value)) {
        errors.documento = 'CPF inválido'
      }
      break
      
    case 'setor':
      if (!value) errors.setor = 'Origem é obrigatória'
      break

    case 'dataNascimento':
      if (value) {
        const year = new Date(value).getFullYear()
        if (year < 1900 || year > new Date().getFullYear()) {
          errors.dataNascimento = 'Data inválida. O ano deve estar entre 1900 e o ano atual.'
        }
      }
      break
      
    // Adicione mais casos conforme necessário
  }
  
  return errors
}

// Watchers para cada campo
watch(() => formData.value.nome, (newValue) => {
  const fieldErrors = validateField('nome', newValue)
  errors.value = { ...errors.value, ...fieldErrors }
})

watch(() => formData.value.documento, (newValue) => {
  const fieldErrors = validateField('documento', newValue)
  errors.value = { ...errors.value, ...fieldErrors }
})

watch(() => formData.value.setor, (newValue) => {
  const fieldErrors = validateField('setor', newValue)
  errors.value = { ...errors.value, ...fieldErrors }
})

watch(() => formData.value.dataNascimento, (newValue) => {
  // Só valida se o campo tiver uma data completa
  if (newValue && newValue.length === 10) {
    validateDate()
  }
})

// Modifique a função validateForm para usar a mesma lógica
const validateForm = () => {
  errors.value = {}
  
  // Valida todos os campos obrigatórios
  const allErrors = {
    ...validateField('nome', formData.value.nome),
    ...validateField('documento', formData.value.documento),
    ...validateField('setor', formData.value.setor),
  }
  
  errors.value = allErrors
  return Object.keys(allErrors).length === 0
}

// Função para salvar/atualizar usuário
const handleSubmit = async () => {
  if (validateForm()) {
    try {
      const userData = {
        nome: formData.value.nome,
        email: formData.value.email || null,
        data_nascimento: formData.value.dataNascimento || null,
        telefone: formData.value.telefone || null,
        documento: formData.value.documento || null,
        cidade: formData.value.cidade || null,
        estado: formData.value.estado || null,
        setor: formData.value.setor,
        updated_at: new Date().toISOString()
      }

      if (isEditing.value) {
        const { error } = await supabase
          .from('usuarios')
          .update(userData)
          .eq('id', route.params.id)

        if (error) throw error
        showToast('Usuário atualizado com sucesso!', 'success')
      } else {
        const { error } = await supabase
          .from('usuarios')
          .insert([{ ...userData, status: 'ativo' }])

        if (error) throw error
        showToast('Usuário cadastrado com sucesso!', 'success')
      }

      setTimeout(() => {
        router.push('/lista-usuarios')
      }, 2000)
    } catch (err) { // Removida a tipagem :any
      console.error('Erro ao salvar usuário:', err)
      showToast(err.message || 'Erro ao salvar usuário', 'error')
    }
  }
}

const showToast = (message, type = 'success') => { // Removida a tipagem :string
  toast.value = {
    show: true,
    message,
    type
  }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Função para lidar com o input do CPF
const handleCPFInput = (e) => {
  let value = e.target.value.replace(/\D/g, '') // Remove tudo que não é número
  
  if (value.length <= 11) {
    // Formata conforme vai digitando
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, function(regex, arg1, arg2, arg3, arg4) {
      return `${arg1}.${arg2}.${arg3}-${arg4}`
    })
    
    formData.value.documento = value
    
    // Valida apenas quando completar 11 dígitos
    if (value.replace(/\D/g, '').length === 11) {
      const isValid = isCPFValid(value)
      if (!isValid) {
        errors.value = { ...errors.value, documento: 'CPF inválido' }
      } else {
        const { documento, ...restErrors } = errors.value
        errors.value = restErrors
      }
    }
  }
}

// Função para validar CPF quando sair do campo
const validateCPFOnBlur = () => {
  if (!formData.value.documento) {
    return // CPF não é obrigatório, então não valida se estiver vazio
  }
  
  const isValid = isCPFValid(formData.value.documento)
  if (!isValid) {
    errors.value = { ...errors.value, documento: 'CPF inválido' }
  } else {
    const { documento, ...restErrors } = errors.value
    errors.value = restErrors
  }
}

// Função de validação do CPF melhorada
const validateCPF = (cpf) => {
  const strCPF = cpf.replace(/\D/g, '')
  
  if (strCPF.length !== 11) return false
  
  // Verifica CPFs com dígitos iguais
  if (/^(\d)\1{10}$/.test(strCPF)) return false
  
  let sum = 0
  let remainder
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(strCPF.substring(i-1, i)) * (11 - i)
  }
  
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(strCPF.substring(9, 10))) return false
  
  // Segundo dígito verificador
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(strCPF.substring(i-1, i)) * (12 - i)
  }
  
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(strCPF.substring(10, 11))) return false
  
  return true
}

const validateDate = () => {
  const date = formData.value.dataNascimento
  if (date) {
    // Só valida se a data estiver completa (YYYY-MM-DD)
    if (date.length === 10) {
      const selectedDate = new Date(date)
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth() + 1 // getMonth() retorna 0-11
      const day = selectedDate.getDate()
      
      // Verifica se é uma data válida
      const isValidDate = selectedDate instanceof Date && !isNaN(selectedDate)
      
      // Recria a data para verificar se os dias batem (isso pega meses com dias inválidos)
      const testDate = new Date(year, month - 1, day)
      const isValidDayMonth = testDate.getMonth() === month - 1 && testDate.getDate() === day
      
      if (!isValidDate || !isValidDayMonth) {
        errors.value = {
          ...errors.value,
          dataNascimento: 'Data inválida. Por favor, insira uma data válida.'
        }
        return
      }

      // Verifica o intervalo de anos apenas se a data for válida
      if (year < 1900 || year > new Date().getFullYear()) {
        errors.value = {
          ...errors.value,
          dataNascimento: 'O ano deve estar entre 1900 e o ano atual.'
        }
        return
      }

      // Remove o erro se a data for válida
      const { dataNascimento, ...restErrors } = errors.value
      errors.value = restErrors
    }
  }
}

onMounted(loadSetores)
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

.cadastro-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

.cadastro-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.cadastro-header {
  background: #193155;
  color: white;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.cadastro-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.cadastro-form {
  padding: 0 2rem 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  color: #193155;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  transition: border-color 0.3s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: #193155;
}

input.error, select.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button {
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
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-salvar {
  background-color: #193155;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-cancelar:hover, .btn-salvar:hover {
  transform: translateY(-2px);
}

.btn-cancelar:hover {
  background-color: #5a6268;
}

.btn-salvar:hover {
  background-color: #254677;
}

@media (max-width: 768px) {
  .cadastro-container {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  button {
    width: 100%;
  }
}

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
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.modal-content h3 {
  color: #193155;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e4e8;
}

.modal-content .form-group {
  margin-bottom: 1.5rem;
}

.modal-content label {
  display: block;
  color: #193155;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.modal-content input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: #193155;
  transition: all 0.3s ease;
}

.modal-content input:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e4e8;
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-cancelar:hover,
.btn-salvar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-cancelar:hover {
  background-color: #5a6268;
}

.btn-salvar:hover {
  background-color: #254677;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-actions button {
    width: 100%;
  }
}

.setor-input-group {
  display: flex;
  gap: 0.5rem;
}

.btn-add-setor {
  padding: 0.75rem;
  background: #193155;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  min-width: 42px;
}

.btn-add-setor:hover {
  background-color: #254677;
}

/* Add toast styles */
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

/* ... rest of your styles */
</style>
