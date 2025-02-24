<script setup lang="ts">
import { useListaPresenca } from './useListaPresenca'
import type { Presenca } from '@/types/presenca'
import './listaPresenca.css'

const {
  presencas,
  loading,
  error,
  success,
  cursoStatus,
  cursoNome,
  qrCode,
  formatDate,
  gerarQRCode,
  filtros,
  loadPresencas
} = useListaPresenca()
</script>

<template>
  <div class="lista-presenca-container">
    <div class="lista-presenca-header">
      <h1>
        Lista de Presença
        <span class="curso-nome">{{ cursoNome }}</span>
      </h1>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <!-- Filtros -->
    <div class="filters">
      <div class="date-filter">
        <input 
          type="date" 
          v-model="filtros.dataAula"
          @change="loadPresencas"
        />
      </div>
    </div>

    <!-- Status do curso -->
    <div class="curso-status">
      <span class="curso-status-label">Status do curso:</span>
      <span :data-status="cursoStatus">{{ cursoStatus }}</span>
    </div>

    <!-- Seção QR Code para o professor -->
    <div v-if="cursoStatus === 'Em andamento'" class="qr-code-section">
      <div v-if="qrCode" class="qr-code-display">
        <img :src="qrCode" alt="QR Code para presença" />
        <p>Validade: 15 minutos</p>
      </div>
      
      <button 
        @click="gerarQRCode" 
        :disabled="loading"
        class="btn-gerar-qr"
      >
        {{ loading ? 'Gerando...' : 'Gerar QR Code' }}
      </button>
    </div>

    <!-- Tabela de presenças -->
    <div class="presencas-table">
      <table>
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Data</th>
            <th>Horário</th>
            <th>Status</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="presenca in presencas" :key="presenca.id">
            <td>{{ presenca.aluno_nome || '-' }}</td>
            <td>{{ formatDate(presenca.data_aula) }}</td>
            <td>{{ presenca.horario_registro }}</td>
            <td>
              <span :class="['status-badge', presenca.status]">
                {{ presenca.status }}
              </span>
            </td>
            <td>{{ presenca.feedback || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
