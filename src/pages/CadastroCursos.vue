<template>
  <div class="cadastro-container">
    <div class="cadastro-card">
      <header class="cadastro-header">
        <h1>{{ isEditing ? 'Editar Curso' : 'Novo Curso' }}</h1>
      </header>

      <form @submit.prevent="handleSubmit" class="cadastro-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Nome do Curso*</label>
            <input 
              type="text" 
              v-model="formData.nome"
              :class="{ error: errors.nome }"
              placeholder="Digite o nome do curso"
            />
            <span class="error-message" v-if="errors.nome">{{ errors.nome }}</span>
          </div>

          <div class="form-group">
            <label>Carga Horária Total*</label>
            <input 
              type="number" 
              v-model="formData.duracao_horas"
              :class="{ error: errors.duracao_horas }"
              min="1"
            />
            <span class="error-message" v-if="errors.duracao_horas">
              {{ errors.duracao_horas }}
            </span>
          </div>

          <div class="form-group">
            <label>Data de Início*</label>
            <input 
              type="date" 
              v-model="formData.data_inicio"
              :class="{ error: errors.data_inicio }"
            />
            <span class="error-message" v-if="errors.data_inicio">
              {{ errors.data_inicio }}
            </span>
          </div>

          <div class="form-group">
            <label>Professor Responsável*</label>
            <input 
              type="text" 
              v-model="formData.professor_responsavel"
              :class="{ error: errors.professor_responsavel }"
              placeholder="Nome do professor responsável"
            />
            <span class="error-message" v-if="errors.professor_responsavel">
              {{ errors.professor_responsavel }}
            </span>
          </div>

          <div class="form-group full-width">
            <label>Descrição*</label>
            <textarea 
              v-model="formData.descricao"
              :class="{ error: errors.descricao }"
              rows="3"
              placeholder="Descreva o curso"
            ></textarea>
            <span class="error-message" v-if="errors.descricao">
              {{ errors.descricao }}
            </span>
          </div>
        </div>

        <div class="modulos-section">
          <h3>Módulos do Curso</h3>
          <div v-for="(modulo, index) in formData.modulos" :key="index" class="modulo-item">
            <div class="modulo-header">
              <h4>Módulo {{ index + 1 }}</h4>
              <button type="button" @click="removerModulo(index)" class="btn-remove">
                <img src="/public/icons/lixeira.svg" alt="Info" class="icon" />
              </button>
            </div>
            <div class="modulo-form">
              <input 
                type="text" 
                v-model="modulo.nome"
                placeholder="Nome do módulo"
              />
              <input 
                type="number" 
                v-model="modulo.carga_horaria"
                placeholder="Carga horária"
                min="1"
              />
            </div>
          </div>
          
          <button type="button" @click="adicionarModulo" class="btn-add-modulo">
            <img src="/public/icons/adicao.svg" alt="Info" class="icon" />
            Adicionar Módulo
          </button>
        </div>

        <div class="form-actions">
          <button type="button" @click="$router.push('/lista-cursos')" class="btn-cancelar">
            <img src="/public/icons/fechar.svg" alt="Dashboard" class="icon" />
            Cancelar
          </button>
          <button type="submit" class="btn-salvar">
            <img src="/public/icons/save-fill.svg" alt="Salvar" class="icon" />
            {{ isEditing ? 'Atualizar' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../config/axios'
import axios from 'axios'

export default {
  name: 'CadastroCursos',
  data() {
    return {
      formData: {
        nome: '',
        descricao: '',
        duracao_horas: '',
        data_inicio: '',
        professor_responsavel: '',
        status: 'ativo',
        modulos: []
      },
      errors: {},
      isEditing: false
    }
  },
  methods: {
    validateForm() {
      this.errors = {}
      
      if (!this.formData.nome) this.errors.nome = 'Nome é obrigatório'
      if (!this.formData.duracao_horas) this.errors.duracao_horas = 'Carga horária é obrigatória'
      if (!this.formData.data_inicio) this.errors.data_inicio = 'Data de início é obrigatória'
      if (!this.formData.professor_responsavel) this.errors.professor_responsavel = 'Professor responsável é obrigatório'
      if (!this.formData.descricao) this.errors.descricao = 'Descrição é obrigatória'
      
      return Object.keys(this.errors).length === 0
    },
    adicionarModulo() {
      this.formData.modulos.push({
        nome: '',
        carga_horaria: ''
      })
    },
    removerModulo(index) {
      this.formData.modulos.splice(index, 1)
    },
    async handleSubmit() {
      if (this.validateForm()) {
        try {
          if (this.isEditing) {
            await api.put(`/cursos/${this.$route.params.id}`, this.formData)
          } else {
            await api.post('/cursos', this.formData)
          }
          this.$router.push('/lista-cursos')
        } catch (error) {
          console.error('Erro ao salvar curso:', error)
          alert('Erro ao salvar curso. Por favor, tente novamente.')
        }
      }
    },
    async loadCurso(id) {
      try {
        const response = await api.get(`/cursos/${id}`)
        this.formData = {
          ...response.data,
          data_inicio: response.data.data_inicio?.split('T')[0],
          modulos: response.data.modulos || []
        }
      } catch (error) {
        console.error('Erro ao carregar curso:', error)
        alert('Erro ao carregar curso. Por favor, tente novamente.')
      }
    }
  },
  async created() {
    this.isEditing = !!this.$route.query.edit
    if (this.isEditing && this.$route.params.id) {
      await this.loadCurso(this.$route.params.id)
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

.cadastro-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

.cadastro-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.cadastro-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  margin-bottom: 2rem;
}

.cadastro-header h1 {
  color: #ffffff;
  font-size: 1.8rem;
  margin: 0;
  font-weight: 600;
}

.cadastro-form {
  padding: 0 2rem 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  color: #193155;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea, select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

input.error, textarea.error, select.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

/* Seção de módulos */
.modulos-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.modulos-section h3 {
  color: #193155;
  margin-bottom: 1.5rem;
}

.modulo-item {
  background: white;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.modulo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modulo-header h4 {
  color: #193155;
  margin: 0;
}

.modulo-form {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.btn-add-modulo {
  background-color: #28a745;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-add-modulo:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.btn-remove {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-remove:hover {
  background-color: #fee2e2;
}

/* Botões de ação */
.form-actions {
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

.btn-cancelar,
.btn-salvar,
.btn-add-modulo,
.btn-remove {
  display: flex;
  align-items: center;
  gap: 12px;
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
  .cadastro-container {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modulo-form {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancelar, 
  .btn-salvar {
    width: 100%;
  }
}
</style>