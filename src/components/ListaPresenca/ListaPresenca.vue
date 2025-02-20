<script setup lang="ts">
import { useListaPresenca } from './useListaPresenca'
import './styles.css'

interface Presenca {
  id: string
  aluno_id: string 
  aluno_nome?: string
  curso_id: string
  data_aula: string
  horario_registro: string
  status: string
}

const {
  presencas,
  loading,
  error,
  success,
  cursoStatus,
  registrarPresenca,
  formatDate
} = useListaPresenca()
</script>

<template>
  <div class="lista-presenca-container">
    <h1>Lista de Presença</h1>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <!-- Mostra status do curso -->
    <div class="curso-status">
      Status do curso: {{ cursoStatus }}
    </div>

    <!-- Mostra o botão apenas se o curso estiver em andamento -->
    <div v-if="cursoStatus === 'Em andamento'" class="actions">
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
            <td>{{ presenca.aluno_nome }}</td>
            <td>{{ formatDate(presenca.data_aula) }}</td>
            <td>{{ presenca.horario_registro }}</td>
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
