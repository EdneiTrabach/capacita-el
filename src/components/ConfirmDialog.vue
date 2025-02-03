<template>
  <div v-if="show" class="confirm-dialog-overlay">
    <div class="confirm-dialog">
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="confirm-actions">
        <button @click="$emit('cancel')" class="btn-cancelar">
          {{ button.no }}
        </button>
        <button @click="$emit('confirm')" class="btn-confirmar">
          {{ button.yes }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    show: Boolean,
    title: String,
    message: String,
    button: {
      type: Object,
      default: () => ({
        yes: 'Confirmar',
        no: 'Cancelar'
      })
    }
  }
}
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirm-dialog {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}

.confirm-dialog h2 {
  color: #193155;
  margin-bottom: 1rem;
}

.confirm-dialog p {
  color: #666;
  margin-bottom: 2rem;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancelar,
.btn-confirmar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar {
  background-color: #6c757d;
  color: white;
}

.btn-confirmar {
  background-color: #dc3545;
  color: white;
}

.btn-cancelar:hover,
.btn-confirmar:hover {
  transform: translateY(-2px);
}
</style>