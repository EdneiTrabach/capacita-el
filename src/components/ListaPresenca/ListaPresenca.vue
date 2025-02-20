<script setup lang="ts">
import { useListaPresenca } from './useListaPresenca'
import './styles.css'

const {
  presencas,
  loading,
  error,
  success,
  registrarPresenca,
  formatDate
} = useListaPresenca()
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
