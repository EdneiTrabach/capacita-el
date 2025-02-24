<template>
  <div class="layout">
    <header class="header">
      <div class="header-content">
        <RouterLink to="/" class="logo">
          <h1>Sistema de Gestão de Treinamentos</h1>
        </RouterLink>
        <div class="header-actions">
          <ThemeToggle />
          <!-- Outros controles do header aqui -->
        </div>
      </div>
    </header>
    <RouterView />
  </div>
</template>

<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<style scoped>
.layout {
  background-color: var(--bg-secondary);
  min-height: 100vh;
  transition: background-color 0.3s;
}

.header {
  background: var(--header-gradient);
  color: var(--sidebar-text);
  padding: 1rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  color: inherit;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
