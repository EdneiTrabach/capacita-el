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
  <div class="curso-info">
    <h3>{{ sanitizeHTML(formData.nome) }}</h3>
    <p>{{ sanitizeHTML(formData.descricao) }}</p>
    <p>Professor: {{ sanitizeHTML(formData.professor_responsavel) }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../config/supabase'
import { useRouter, useRoute } from 'vue-router'
import { sanitizeHTML } from '@/utils/sanitize'

interface Modulo {
  id?: string
  nome: string
  carga_horaria: number
  curso_id?: string
}

interface FormData {
  nome: string
  descricao: string
  duracao_horas: number
  data_inicio: string
  professor_responsavel: string
  status: string
  modulos: Modulo[]
}

interface Errors {
  nome?: string
  descricao?: string
  duracao_horas?: string
  data_inicio?: string
  professor_responsavel?: string
}

const router = useRouter()
const route = useRoute()
const formData = ref<FormData>({
  nome: '',
  descricao: '',
  duracao_horas: 0,
  data_inicio: '',
  professor_responsavel: '',
  status: 'Em andamento',
  modulos: []
})

const errors = ref<Errors>({})
const isEditing = ref(false)

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.nome) errors.value.nome = 'Nome é obrigatório'
  if (!formData.value.duracao_horas) errors.value.duracao_horas = 'Carga horária é obrigatória'
  if (!formData.value.data_inicio) errors.value.data_inicio = 'Data de início é obrigatória'
  if (!formData.value.professor_responsavel) errors.value.professor_responsavel = 'Professor responsável é obrigatório'
  if (!formData.value.descricao) errors.value.descricao = 'Descrição é obrigatória'
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (validateForm()) {
    try {
      if (isEditing.value) {
        // Update existing course
        const { error: updateError } = await supabase
          .from('cursos')
          .update({
            nome: formData.value.nome,
            descricao: formData.value.descricao,
            duracao_horas: formData.value.duracao_horas,
            data_inicio: formData.value.data_inicio,
            professor_responsavel: formData.value.professor_responsavel,
            status: formData.value.status
          })
          .eq('id', route.params.id)

        if (updateError) throw updateError

        // Update modules
        for (const modulo of formData.value.modulos) {
          if (modulo.id) {
            // Update existing module
            await supabase
              .from('modulos')
              .update({
                nome: modulo.nome,
                carga_horaria: modulo.carga_horaria
              })
              .eq('id', modulo.id)
          } else {
            // Insert new module
            await supabase
              .from('modulos')
              .insert({
                curso_id: route.params.id,
                nome: modulo.nome,
                carga_horaria: modulo.carga_horaria
              })
          }
        }
      } else {
        // Insert new course
        const { data: newCourse, error: insertError } = await supabase
          .from('cursos')
          .insert([{
            nome: formData.value.nome,
            descricao: formData.value.descricao,
            duracao_horas: formData.value.duracao_horas,
            data_inicio: formData.value.data_inicio,
            professor_responsavel: formData.value.professor_responsavel,
            status: 'Em andamento'
          }])
          .select()
          .single()

        if (insertError) throw insertError

        // Insert modules
        if (formData.value.modulos.length > 0) {
          await supabase
            .from('modulos')
            .insert(
              formData.value.modulos.map(modulo => ({
                curso_id: newCourse.id,
                nome: modulo.nome,
                carga_horaria: modulo.carga_horaria
              }))
            )
        }
      }

      router.push('/lista-cursos')
    } catch (err) {
      console.error('Error saving course:', err)
      alert('Erro ao salvar curso')
    }
  }
}

const loadCurso = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('cursos')
      .select(`
        *,
        modulos (
          id,
          nome,
          carga_horaria
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    formData.value = {
      ...data,
      data_inicio: data.data_inicio?.split('T')[0],
      modulos: data.modulos || []
    }
  } catch (err) {
    console.error('Error loading course:', err)
    alert('Erro ao carregar curso')
  }
}

const adicionarModulo = () => {
  formData.value.modulos.push({
    nome: '',
    carga_horaria: 0
  })
}

const removerModulo = (index: number) => {
  formData.value.modulos.splice(index, 1)
}

const formatDate = (date: string | undefined): string => {
  if (!date) return '--'
  try {
    return date.split('T')[0].split('-').reverse().join('/')
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return '--'
  }
}

onMounted(() => {
  isEditing.value = !!route.query.edit
  if (isEditing.value && route.params.id) {
    loadCurso(route.params.id as string)
  }
})

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