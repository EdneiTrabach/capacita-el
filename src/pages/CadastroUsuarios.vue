<template>
  <div class="cadastro-container">
    <div class="cadastro-card">
      <header class="cadastro-header">
        <h1>Cadastro de Alunos</h1>
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
            />
            <span class="error-message" v-if="errors.documento">{{ errors.documento }}</span>
          </div>

          <div class="form-group">
            <label>Cidade</label>
            <input 
              type="text" 
              v-model="formData.cidade"
              :class="{ error: errors.cidade }"
              placeholder="Digite a cidade"
            />
            <span class="error-message" v-if="errors.cidade">{{ errors.cidade }}</span>
          </div>

          <div class="form-group">
            <label>Estado</label>
            <select 
              v-model="formData.estado"
              :class="{ error: errors.estado }"
            >
              <option value="">Selecione um estado</option>
              <option v-for="estado in estados" :key="estado.uf" :value="estado.uf">
                {{ estado.nome }}
              </option>
            </select>
            <span class="error-message" v-if="errors.estado">{{ errors.estado }}</span>
          </div>

          <div class="form-group">
            <label>Origem</label>
            <div class="setor-input-group">
              <select 
                v-model="formData.setor"
                :class="{ error: errors.setor }"
              >
                <option value="">Selecione um setor</option>
                <option v-for="setor in setores" :key="setor" :value="setor">
                  {{ setor }}
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
            Salvar
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

<script>
import api from '../services/api'
import axios from 'axios'
import { API_URL } from '../config/api'

export default {
  name: 'CadastroUsuarios',
  data() {
    return {
      formData: {
        nome: '',
        email: '',
        dataNascimento: '',
        telefone: '',
        documento: '',
        cidade: '',
        estado: '',
        setor: ''
      },
      errors: {},
      estados: [
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
      ],
      setores: [],
      showSetorModal: false,
      novoSetor: ''
    }
  },
  async created() {
    await this.loadSetores()
    if (this.$route.query.edit && this.$route.params.id) {
      await this.loadUsuario(this.$route.params.id)
    }
  },
  methods: {
    validateForm() {
      this.errors = {}
      
      // Validar apenas o nome
      if (!this.formData.nome) {
        this.errors.nome = 'Nome é obrigatório'
      }

      return Object.keys(this.errors).length === 0
    },
    async loadUsuario(id) {
      try {
        const response = await axios.get(`${API_URL}/usuarios/${id}`)
        this.formData = {
          ...response.data,
          dataNascimento: response.data.data_nascimento?.split('T')[0]
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        alert('Erro ao carregar dados do usuário')
      }
    },
    async handleSubmit() {
      if (this.validateForm()) {
        try {
          if (this.$route.query.edit) {
            await axios.put(`${API_URL}/usuarios/${this.$route.params.id}`, this.formData)
            alert('Usuário atualizado com sucesso!')
          } else {
            await axios.post(`${API_URL}/usuarios`, this.formData)
            alert('Usuário cadastrado com sucesso!')
          }
          this.$router.push('/lista-usuarios')
        } catch (error) {
          console.error('Erro ao salvar usuário:', error)
          alert('Erro ao salvar usuário')
        }
      }
    },
    async loadSetores() {
      try {
        const response = await axios.get(`${API_URL}/setores`)
        this.setores = response.data.map(s => s.nome)
      } catch (error) {
        console.error('Erro ao carregar setores:', error)
      }
    },

    async cadastrarNovoSetor() {
      if (!this.novoSetor) {
        alert('Digite o nome do setor')
        return
      }

      try {
        await axios.post(`${API_URL}/setores`, {
          nome: this.novoSetor
        })
        
        // Atualiza a lista de setores
        await this.loadSetores()
        
        // Seleciona o novo setor
        this.formData.setor = this.novoSetor
        
        // Fecha o modal e limpa o campo
        this.showSetorModal = false
        this.novoSetor = ''
        
      } catch (error) {
        console.error('Erro ao cadastrar setor:', error)
        alert('Erro ao cadastrar novo setor')
      }
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
</style>
