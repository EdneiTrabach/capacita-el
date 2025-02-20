<template>
  <div class="cursos-grid">
    <div v-for="curso in cursos" :key="curso.id" class="curso-card">
      <div class="curso-header">
        <h3>{{ sanitizeHTML(curso.nome) }}</h3>
        <CursoActions 
          :curso="curso" 
          @edit="$emit('edit', curso)"
          @delete="$emit('delete', curso.id)"
        />
      </div>
      <div class="curso-body">
        <p class="descriçao-card">{{ sanitizeHTML(curso.descricao) }}</p>
        <CursoInfo :curso="curso" />
        <StatusToggle 
          :status="curso.status"
          :disabled="curso.status === 'Finalizado' && hasCertificado"
          @status-change="$emit('status-change', curso, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue' // Adicionar PropType
import CursoActions from './CursoActions.vue'
import CursoInfo from './CursoInfo.vue'
import StatusToggle from './StatusToggle.vue'
import { sanitizeHTML } from '@/utils/sanitize'

interface Curso {
  id: number;
  nome: string;
  descricao: string;
  status: string;
  professor_responsavel: string;
  data_inicio: string;
  carga_horaria: number;
}

export default defineComponent({
  name: 'CursosList',
  components: {
    CursoActions,
    CursoInfo,
    StatusToggle
  },
  props: {
    cursos: {
      type: Array as PropType<Curso[]>,
      required: true
    },
    hasCertificado: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {
      sanitizeHTML
    }
  }
})
</script>

<style>
@import '../pages/ListaCursos.css';
</style>

