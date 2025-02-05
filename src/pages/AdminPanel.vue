<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1>Painel Administrativo</h1>
    </header>

    <div class="admin-content">
      <div class="admin-grid">
        <!-- Gestão de Usuários -->
        <div class="admin-card">
          <h2>Gestão de Usuários</h2>
          <div class="admin-actions">
            <button @click="$router.push('/lista-usuarios')">
              <img src="../../public/icons/config-usuario.svg" alt="Usuários" class="icon"/>
              Gerenciar Usuários
            </button>
          </div>
        </div>

        <!-- Configurações do Sistema -->
        <div class="admin-card">
          <h2>Configurações</h2>
          <div class="admin-actions">
            <button @click="handleSystemConfig">
              <img src="../../public/icons/config-usuario.svg" alt="Configurações" class="icon"/>
              Configurações do Sistema
            </button>
          </div>
        </div>

        <!-- Logs do Sistema -->
        <div class="admin-card">
          <h2>Logs do Sistema</h2>
          <div class="logs-container">
            <div v-for="log in systemLogs" :key="log.id" class="log-entry">
              {{ formatDate(log.created_at) }} - {{ log.action }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'

interface SystemLog {
  id: string
  action: string
  details: any
  created_at: string
  user_id: string
}

const systemLogs = ref<SystemLog[]>([])

const loadSystemLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    systemLogs.value = data || []
  } catch (error) {
    console.error('Erro ao carregar logs:', error)
  }
}

// Função para registrar logs
const logSystemAction = async (action: string, details?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('system_logs').insert({
      action,
      details,
      user_id: user?.id
    })
  } catch (error) {
    console.error('Erro ao registrar log:', error)
  }
}

// Função para formatar data
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('pt-BR')
}

const handleSystemConfig = () => {
  // Implementar lógica de configurações
}

onMounted(() => {
  loadSystemLogs()
})
</script>

<style scoped>
.admin-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.admin-header {
  margin-bottom: 2rem;
}

.admin-header h1 {
  color: #193155;
  font-size: 1.8rem;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(300px, 1fr));
  gap: 2rem;
}

.admin-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.admin-card h2 {
  color: #193155;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.admin-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-actions button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: #193155;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.admin-actions button:hover {
  transform: translateY(-2px);
  background: #254677;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  padding: 0.5rem;
  border-bottom: 1px solid #e0e4e8;
  font-size: 0.9rem;
}

.icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
  }
  
  .admin-grid {
    grid-template-columns: 1fr;
  }
}
</style>