<template>
  <div class="curso-info">
    <div class="info-row">
      <span class="info-label">Professor:</span>
      <span>{{ curso.professor_responsavel || '--' }}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Data Início:</span>
      <span>{{ formatDate(curso.data_inicio) }}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Carga Horária:</span>
      <span>{{ curso.duracao_horas ? `${curso.duracao_horas}h` : '--' }}</span>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CursoInfo',
  props: {
    curso: {
      type: Object,
      required: true
    }
  },
  setup() {
    const formatDate = (date) => {
      if (!date) return '--'
      try {
        // Converte a data para o formato dd/mm/yyyy
        return date.split('T')[0].split('-').reverse().join('/')
      } catch (error) {
        console.error('Erro ao formatar data:', error)
        return '--'
      }
    }

    return {
      formatDate
    }
  }
})
</script>

<style>
@import '../assets/ListaCursos.css';
</style>