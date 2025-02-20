<template>
  <div class="permissoes-container">
    <h1>Gerenciamento de Permissões</h1>

    <div class="permissions-grid">
      <!-- Lista de Usuários e Suas Permissões -->
      <div class="users-list">
        <h2>Usuários</h2>
        <div v-if="loading" class="loading">Carregando...</div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>
                  <span :class="['status-badge', user.status ? 'active' : 'inactive']">
                    {{ user.status ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <select 
                    v-model="user.role"
                    @change="updateUserRole(user)"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                    <option value="instructor">Instrutor</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'

interface User {
  id: string
  email: string
  role: string
  status: boolean
}

const users = ref<User[]>([])
const loading = ref(true)

const loadUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, status')
      .order('email')

    if (error) throw error
    users.value = data || []
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
  } finally {
    loading.value = false
  }
}

const updateUserRole = async (user: User) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: user.role })
      .eq('id', user.id)

    if (error) throw error

    // Registrar a alteração no log do sistema
    await supabase.from('system_logs').insert({
      action: 'update_user_role',
      details: {
        user_id: user.id,
        new_role: user.role
      },
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.permissoes-container {
  padding: 2rem;
}

h1 {
  color: #193155;
  margin-bottom: 2rem;
}

.permissions-grid {
  display: grid;
  gap: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table-container {
  overflow-x: auto;
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

select {
  padding: 0.5rem;
  border: 1px solid #e0e4e8;
  border-radius: 4px;
  background: white;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
}

.active {
  background: #e6f4ea;
  color: #1e7e34;
}

.inactive {
  background: #fbe9e7;
  color: #d32f2f;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>