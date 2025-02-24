<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from './config/supabase'
import type { Component } from 'vue'
import Navbar from './components/Navbar.vue'
import NavigationButtons from '@/components/NavigationButtons/NavigationButtons.vue'
import '@/assets/theme.css'
import { useTheme } from '@/composables/useTheme'
const route = useRoute()
const isSidebarCollapsed = ref(false)

// Use Supabase session for authentication
const isAuthenticated = computed(() => {
  return !!supabase.auth.getSession()
})

const showNavbar = computed(() => isAuthenticated.value && route.path !== '/login')

const handleSidebarToggle = (collapsed: boolean): void => {
  isSidebarCollapsed.value = collapsed
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle sign in
    console.log('User signed in:', session)
  } else if (event === 'SIGNED_OUT') {
    // Handle sign out
    console.log('User signed out')
  }
})

// Computed property para controlar visibilidade do Navbar
const shouldShowNavbar = computed(() => {
  // Não mostra o navbar em rotas de autenticação
  if (route.meta.isAuthRoute) return false
  
  // Não mostra o navbar em rotas que não requerem autenticação
  if (!route.meta.requiresAuth) return false
  
  return true
})

// Inicializa o tema
const { isDark } = useTheme()
</script>
<template>
  <div id="app" class="app-container" :class="{ 'dark': isDark }">
    <Navbar v-if="shouldShowNavbar" @sidebar-toggle="handleSidebarToggle" />
    <main 
      class="main-content" 
      :class="{ 
        'with-sidebar': shouldShowNavbar, 
        'sidebar-collapsed': isSidebarCollapsed 
      }"
    >
      <router-view />
      <NavigationButtons />
    </main>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

#app {
  font-family: 'JetBrains Mono', monospace;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
}

.app-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

main {
  flex: 1;
  margin-left: 0;
  transition: all 0.3s ease;
  width: 100%;
}

main.with-sidebar {
  margin-left: 250px;
  width: calc(100% - 250px);
  background: var(--bg-secondary);
}

main.with-sidebar.sidebar-collapsed {
  margin-left: 60px;
  width: calc(100% - 60px);
}

@media (min-width: 769px) {
  main.with-sidebar {
    margin-left: 250px;
    width: calc(100% - 250px);
  }
}

@media (max-width: 768px) {
  main.with-sidebar {
    margin-left: 60px;
    width: calc(100% - 60px);
  }

  main.with-sidebar.sidebar-collapsed {
    margin-left: 0;
    width: 100%;
  }
}

/* Reset some base styles */
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

.main-content {
  flex: 1;
  min-height: 100vh;
  transition: all 0.3s ease;
  width: 100%;
  position: relative;
}

.main-content.with-sidebar {
  margin-left: 280px; /* Largura do sidebar expandido */
  width: calc(100% - 250px);
  transition: all 0.3s ease;
  background: var(--bg-secondary);
}

.main-content.with-sidebar.sidebar-collapsed {
  margin-left: 60px; /* Largura do sidebar recolhido */
  width: calc(100% - 60px);
  transition: all 0.3s ease;
}

/* Ajuste para dispositivos móveis */
@media (max-width: 768px) {
  .main-content.with-sidebar {
    margin-left: 60px;
    width: calc(100% - 60px);
  }

  .main-content.with-sidebar.sidebar-collapsed {
    margin-left: 0;
    width: 100%;
  }
}

/* Para telas de autenticação (login e reset) */
.reset-container,
.login-container {
  margin-left: 0 !important;
  width: 100% !important;
}
</style>
