<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './layouts/Navbar.vue' // Updated import path
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from './config/supabase'

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
</script>
<template>

  <div class="app-container">
    <Navbar v-if="showNavbar" @sidebar-toggle="handleSidebarToggle" />
    <main :class="{ 'with-sidebar': showNavbar, 'sidebar-collapsed': isSidebarCollapsed }">
      <RouterView />
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
</style>
