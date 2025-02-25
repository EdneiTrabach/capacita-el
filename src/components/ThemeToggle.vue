<template>
  <button @click="toggleTheme" class="theme-toggle" aria-label="Alternar tema">
    <img 
      :src="`/icons/${isDark ? 'sun' : 'moon'}.svg`" 
      :alt="isDark ? 'Modo Claro' : 'Modo Escuro'" 
      class="icon"
    />
    <span v-if="showText" class="button-text">{{ isDark ? 'Modo Claro' : 'Modo Escuro' }}</span>
  </button>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Defina a prop showText
defineProps({
  showText: {
    type: Boolean,
    default: true
  }
})

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle {
  background: transparent;
  border: none;
  padding: 0.75rem 1rem;  
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-family: jetbrains-mono, monospace;
  width: auto;
  gap: 1rem;
}

.theme-toggle:hover {
  background-color: var(--hover-overlay);
}

/* Remove margem direita quando não há texto */
.theme-toggle:not(:has(.button-text)) .icon {
  margin-right: 0;
}

.button-text {
  font-size: 1rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .theme-toggle {
    padding: 0.75rem;
    width: 40px;
  }
  
  .button-text {
    display: none;
  }
}
</style>
