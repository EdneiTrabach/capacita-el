<template>
  <div class="usuarios-sistema">
    <h1>Usuários do Sistema</h1>
    
    <div class="usuarios-table">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th>Perfil</th>
            <th>Último Acesso</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td>{{ usuario.email }}</td>
            <td>{{ usuario.status ? 'Ativo' : 'Inativo' }}</td>
            <td>{{ usuario.role }}</td>
            <td>{{ formatDate(usuario.last_sign_in_at) }}</td>
            <td>
              <button @click="toggleStatus(usuario)" 
                      :class="usuario.status ? 'btn-danger' : 'btn-success'">
                {{ usuario.status ? 'Desativar' : 'Ativar' }}
              </button>
              <button @click="editarPermissoes(usuario)" class="btn-edit">
                Editar Permissões
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'

interface Usuario {
  id: string
  email: string
  status: boolean
  role: string
  last_sign_in_at: string
}

const usuarios = ref<Usuario[]>([])

const carregarUsuarios = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      
    if (error) throw error
    usuarios.value = data || []
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
  }
}

const toggleStatus = async (usuario: Usuario) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ status: !usuario.status })
      .eq('id', usuario.id)

    if (error) throw error
    await carregarUsuarios()
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('pt-BR')
}

const editarPermissoes = (usuario: Usuario) => {
  // Implement your permission editing logic here
  console.log('Editar permissões para:', usuario.email)
}

onMounted(() => {
  carregarUsuarios()
})
</script>

<style scoped>
.usuarios-sistema {
  padding: 2rem;
}

.usuarios-table {
  margin-top: 2rem;
  background: white;
  border-radius: 8px;
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
  font-weight: 600;
  color: #193155;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  margin-right: 0.5rem;
  cursor: pointer;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-edit {
  background: #193155;
  color: white;
}
</style>