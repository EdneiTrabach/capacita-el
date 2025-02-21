<!-- src/components/ListaPresenca/ListaPresencaProfessor.vue -->
<template>
  <div class="lista-presenca-container">
    <h1>Gerenciar Presença</h1>

    <div class="qr-code-section">
      <img v-if="qrCode" :src="qrCode" alt="QR Code para presença" />
      <button @click="gerarNovoQRCode" class="btn-gerar-qr">
        Gerar novo QR Code
      </button>
    </div>

    <!-- Lista de presenças existente... -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { presencaService } from '@/services/presencaService'

const qrCode = ref('')
const cursoId = ref('')  // Add this if cursoId will be set internally

const gerarNovoQRCode = async () => {
  qrCode.value = await presencaService.gerarCodigoAula(cursoId.value, new Date().toISOString())
}
</script>