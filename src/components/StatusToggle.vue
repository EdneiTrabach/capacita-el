<template>
  <div class="status-toggle">
    <button 
      v-for="option in statusOptions" 
      :key="option.value"
      @click="$emit('status-change', option.value)"
      :class="['status-btn', { active: status === option.value }]"
      :disabled="disabled"
    >
      <img :src="option.icon" :alt="option.label" class="icon-black" />
      {{ option.label }}
    </button>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StatusToggle',
  props: {
    status: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const statusOptions = [
      {
        value: 'Em andamento',
        label: 'Em Andamento',
        icon: '/icons/cursando.svg'
      },
      {
        value: 'Finalizado',
        label: 'Finalizado',
        icon: '/icons/check.svg'
      },
      {
        value: 'Cancelado',
        label: 'Cancelado',
        icon: '/icons/fechar.svg'
      }
    ]

    return {
      statusOptions
    }
  }
})
</script>
