<template>
  <button @click="toggleTheme" class="theme-toggle" aria-label="Alternar tema">
    <img 
      :src="`/public/icons/${isDark ? 'sun' : 'moon'}.svg`" 
      :alt="isDark ? 'Modo Claro' : 'Modo Escuro'" 
      class="icon"
    />
    <span class="button-text">{{ isDark ? 'Modo Claro' : 'Modo Escuro' }}</span>
  </button>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle {
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
}

.theme-toggle:hover {
  background-color: var(--hover-overlay);
}

.icon {
  width: 24px;
  height: 24px;
  filter: var(--icon-filter);
  margin-right: 1rem;
}

.button-text {
  font-size: 1rem;
  color: var(--text-color);
}
</style>
