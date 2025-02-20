<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { useRoute } from 'vue-router'
import { logSystemAction } from '@/utils/logger'

interface Presenca {
  id: string
  aluno_id: string
  aluno_nome?: string
  curso_id: string
  data_aula: string
  horario_registro: string
  status: string
}

const route = useRoute()
const cursoId = route.params.id
const presencas = ref<Presenca[]>([])
const loading = ref(true)
const error = ref('')
const success = ref('')
const dataAula = ref(new Date().toISOString().split('T')[0])

const loadPresencas = async () => {
  try {
    loading.value = true
    const { data, error: loadError } = await supabase
      .from('lista_presenca')
      .select(`
        *,
        alunos:usuarios(nome)
      `)
      .eq('curso_id', cursoId)
      .order('data_aula', { ascending: false })

    if (loadError) throw loadError
    presencas.value = data || []
  } catch (err) {
    console.error('Erro ao carregar presenças:', err)
    error.value = 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
}

const registrarPresenca = async () => {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Usuário não autenticado')

    // Verificar se já registrou presença hoje
    const { data: presencaExistente } = await supabase
      .from('lista_presenca')
      .select('*')
      .eq('aluno_id', user.id)
      .eq('curso_id', cursoId)
      .eq('data_aula', dataAula.value)
      .single()

    if (presencaExistente) {
      error.value = 'Presença já registrada para hoje'
      return
    }

    const { error: insertError } = await supabase
      .from('lista_presenca')
      .insert({
        aluno_id: user.id,
        curso_id: cursoId,
        data_aula: dataAula.value,
        ip_registro: window.location.hostname
      })

    if (insertError) throw insertError

    await logSystemAction('registro_presenca', {
      curso_id: cursoId,
      data_aula: dataAula.value
    })

    success.value = 'Presença registrada com sucesso!'
    await loadPresencas()
  } catch (err) {
    console.error('Erro ao registrar presença:', err)
    error.value = 'Erro ao registrar presença'
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

onMounted(() => {
  loadPresencas()
})
</script>

<template>
  <div class="lista-presenca-container">
    <h1>Lista de Presença</h1>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <div class="actions">
      <button 
        @click="registrarPresenca" 
        :disabled="loading"
        class="btn-registrar"
      >
        {{ loading ? 'Registrando...' : 'Registrar Presença' }}
      </button>
    </div>

    <div class="presencas-table">
      <table>
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Data</th>
            <th>Horário</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="presenca in presencas" :key="presenca.id">
            <td>{{ presenca.alunos?.nome }}</td>
            <td>{{ formatDate(presenca.data_aula) }}</td>
            <td>{{ new Date(presenca.horario_registro).toLocaleTimeString('pt-BR') }}</td>
            <td>
              <span :class="['status-badge', presenca.status]">
                {{ presenca.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.lista-presenca-container {
  padding: 2rem;
}

.actions {
  margin: 2rem 0;
}

.btn-registrar {
  background: #193155;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
}

.btn-registrar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.presencas-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e4e8;
}

th {
  background: #f8f9fa;
  color: #193155;
  font-weight: 600;
}

.error-message {
  color: #dc3545;
  margin-bottom: 1rem;
}

.success-message {
  color: #28a745;
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
}

.presente {
  background: #e6f4ea;
  color: #1e7e34;
}

.ausente {
  background: #fbe9e7;
  color: #d32f2f;
}
</style>