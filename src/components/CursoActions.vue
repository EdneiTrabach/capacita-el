<template>
  <div class="actions">
    <button @click="$emit('edit')" class="btn-edit">
      <img src="/public/icons/edicao.svg" alt="Editar" class="icon" />
      Editar
    </button>
    <button @click="$emit('delete')" class="btn-delete">
      <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon" />
      Excluir
    </button>
    <button 
      @click="$router.push(`/curso/${curso.id}/presenca`)"
      class="btn-presenca"
    >
      <img src="../../public/icons/check.svg" alt="Presença" class="icon"/>
      Lista de Presença
    </button>

    <!-- Modificado para incluir o ID do curso -->
    <button 
      @click="$router.push(`/matricula-alunos/${curso.id}`)"
      class="btn-matricula"
    >
      <img src="../../public/icons/lapis.svg" alt="Matrículas" class="icon"/>
      Gerenciar Matrículas
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps({
  curso: {
    type: Object,
    required: true
  }
})

const router = useRouter()
</script>

<style scoped>
.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-edit, .btn-delete, .btn-presenca, .btn-matricula {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-matricula {
  background-color: #2196f3;
  color: white;
}

.btn-matricula:hover {
  background-color: #1976d2;
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
