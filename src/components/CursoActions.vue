<template>
  <div class="actions">
    <button @click="$emit('edit')" class="action-btn btn-edit pos-top-left" data-tooltip="Editar">
      <img src="/public/icons/edicao.svg" alt="Editar" class="icon" />
    </button>
    <button @click="$emit('delete')" class="action-btn btn-delete pos-top-right" data-tooltip="Excluir">
      <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon" />
    </button>
    <button 
      @click="$router.push(`/curso/${curso.id}/presenca`)"
      class="action-btn btn-presenca pos-center"
      data-tooltip="Lista de Presença"
    >
      <img src="../../public/icons/check.svg" alt="Presença" class="icon"/>
    </button>
    <button 
      @click="$router.push(`/matricula-alunos/${curso.id}`)"
      class="action-btn btn-matricula pos-bottom-left"
      data-tooltip="Gerenciar Matrículas"
    >
      <img src="../../public/icons/lapis.svg" alt="Matrículas" class="icon"/>
    </button>
    <button 
      @click="$router.push(`/curso/${curso.id}/avaliacao`)"
      class="action-btn btn-avaliacao pos-bottom-right"
      data-tooltip="Avaliar Treinamento"
    >
      <img src="/public/icons/star.svg" alt="Avaliar" class="icon"/>
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
  gap: 5px;
  width: fit-content;
}

.pos-top-left {
  grid-column: 1;
  grid-row: 1;
}

.pos-top-right {
  grid-column: 2;
  grid-row: 1;
}

.pos-center {
  grid-column: 1 / span 2;
  grid-row: 2;
  justify-self: center;
}

.pos-bottom-left {
  grid-column: 1;
  grid-row: 3;
}

.pos-bottom-right {
  grid-column: 2;
  grid-row: 3;
}

.action-btn {
  position: relative;
  padding: 0.5rem;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.action-btn::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem;
  background-color: #333;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.action-btn:hover::before {
  opacity: 1;
  visibility: visible;
}


.btn-edit {
  background-color: #4CAF50;
  color: white;
}

.btn-edit:hover {
  background-color: #45a049;
}

.btn-delete {
  background-color: #f44336;
  color: white;
}

.btn-delete:hover {
  background-color: #da190b;
}

.btn-presenca {
  background-color: #ff9800;
  color: white;
}

.btn-presenca:hover {
  background-color: #f57c00;
}

.btn-matricula {
  background-color: #2196f3;
  color: white;
}

.btn-matricula:hover {
  background-color: #1976d2;
}

.btn-avaliacao {
  background-color: #9c27b0;
  color: white;
}

.btn-avaliacao:hover {
  background-color: #7b1fa2;
}

.btn-avaliacao:hover,
.btn-matricula:hover,
.btn-presenca:hover,
.btn-delete:hover,
.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-edit,
.btn-delete,
.btn-presenca,
.btn-download,
.btn-view,
.btn-emit,
.btn-avaliacao,
.btn-matricula {
  padding: 0.75rem 1.25rem;
  border-radius: 8px! important;
  width: 30px;
  height: 30px; /* Altura fixa para todos os botões */
  min-width: 30px;
  border: none;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

</style>
