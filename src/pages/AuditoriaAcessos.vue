<template>
  <div class="auditoria-container">
    <h1>Auditoria de Acessos</h1>

    <!-- Filtros -->
    <div class="filters">
      <div class="filter-group">
        <label>Período:</label>
        <input 
          type="date" 
          v-model="filters.dataInicio" 
          @change="loadLogs"
        />
        <input 
          type="date" 
          v-model="filters.dataFim"
          @change="loadLogs"
        />
      </div>
      <div class="filter-group">
        <label>Tipo de Ação:</label>
        <select v-model="filters.action" @change="loadLogs">
          <option value="">Todas</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="update_user_role">Alteração de Perfil</option>
          <option value="update_user_status">Alteração de Status</option>
        </select>
      </div>
    </div>

    <!-- Tabela de Logs -->
    <div class="logs-table">
      <div v-if="loading" class="loading">Carregando...</div>
      <table v-else>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Usuário</th>
            <th>Ação</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ formatDate(log.created_at) }}</td>
            <td>{{ log.user_email }}</td>
            <td>{{ formatAction(log.action) }}</td>
            <td>
              <button 
                @click="showDetails(log)" 
                class="btn-details"
              >
                Ver Detalhes
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="selectedLog" class="modal">
      <div class="modal-content">
        <h3>Detalhes do Log</h3>
        <pre>{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
        <button @click="selectedLog = null" class="btn-close">Fechar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { logSystemAction } from '@/utils/logger'

interface Log {
  id: string
  created_at: string
  action: string
  details: any
  user_id: string
  user_email: string
}

const logs = ref<Log[]>([])
const loading = ref(true)
const selectedLog = ref<Log | null>(null)
const filters = ref({
  dataInicio: '',
  dataFim: '',
  action: ''
})

const loadLogs = async () => {
  try {
    loading.value = true
    let query = supabase
      .from('system_logs')
      .select(`
        *,
        users!system_logs_user_id_fkey (
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (filters.value.dataInicio) {
      query = query.gte('created_at', filters.value.dataInicio)
    }
    if (filters.value.dataFim) {
      query = query.lte('created_at', filters.value.dataFim)
    }
    if (filters.value.action) {
      query = query.eq('action', filters.value.action)
    }

    const { data, error } = await query
    if (error) throw error

    logs.value = data?.map(log => ({
      ...log,
      user_email: log.users?.email || 'Usuário não encontrado'
    })) || []
  } catch (error) {
    console.error('Erro ao carregar logs:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('pt-BR')
}

const formatAction = (action: string) => {
  const actions: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    update_user_role: 'Alteração de Perfil',
    update_user_status: 'Alteração de Status'
  }
  return actions[action] || action
}

const showDetails = (log: Log) => {
  selectedLog.value = log
}

const updateUserRole = async (user: any, newRole: string) => {
  const oldRole = user.role
  // Atualiza o papel do usuário
  await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', user.id)

  // Registra a ação no log
  await logSystemAction('update_user_role', {
    user_id: user.id,
    old_role: oldRole,
    new_role: newRole
  })
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.auditoria-container {
  padding: 2rem;
}

h1 {
  color: #193155;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group input,
.filter-group select {
  padding: 0.5rem;
  border: 1px solid #e0e4e8;
  border-radius: 4px;
}

.logs-table {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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

.btn-details {
  padding: 0.5rem 1rem;
  background: #193155;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
}

.modal-content pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  margin: 1rem 0;
}

.btn-close {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>