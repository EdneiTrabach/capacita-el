<template>
  <div class="sidebar-container">
    <nav class="sidebar" :class="{ 'collapsed': !isExpanded }">
      <button class="toggle-btn" @click="toggleSidebar">
        {{ isExpanded ? '◀' : '▶' }}
      </button>
      
      <div class="logo-section">
        <img src="../../public/icons/logo-fill.jpeg" alt="Logo" class="logo" />
        <span v-if="isExpanded">Capacita.EL</span>
      </div>

      <ul class="nav-links">
        <li>
          <router-link to="/">
            <img src="../../public/icons/home.svg" alt="Home" class="icon" />
            <span v-if="isExpanded" class="link-text">Home</span>
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard">
            <img src="../../public/icons/grafico.svg" alt="Dashboard" class="icon" />
            <span v-if="isExpanded" class="link-text">Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link to="/usuarios">
            <img src="../../public/icons/add-usuario.svg" alt="Cadastro de Usuário" class="icon" />
            <span v-if="isExpanded" class="link-text">Cadastro de pessoas</span>
          </router-link>
        </li>
        <li>
          <router-link to="/lista-usuarios">
            <img src="../../public/icons/config-usuario.svg" alt="Configuracoes de Usuário" class="icon" />
            <span v-if="isExpanded" class="link-text">Gestão de pessoas</span>
          </router-link>
        </li>
        <li>
          <router-link to="/certificados">
            <img src="../../public/icons/certificado.svg" alt="Certificados" class="icon" />
            <span v-if="isExpanded" class="link-text">Certificados</span>
          </router-link>
        </li>
        <!-- <li>
          <router-link to="/relatorios">
            <img src="../../public/icons/relatorio.svg" alt="Relatórios" class="icon" />
            <span v-if="isExpanded" class="link-text">Relatórios</span>
          </router-link>
        </li> -->
        <li>
          <router-link to="/lista-cursos">
            <img src="../../public/icons/livros.svg" alt="Cursos" class="icon" />
            <span v-if="isExpanded" class="link-text">Treinamentos</span>
          </router-link>
        </li>
        <!-- <li v-if="isAdmin">
          <router-link to="/admin">
            <img src="/public/icons/config-usuario.svg" alt="Admin" class="icon" />
            <span v-if="isExpanded" class="link-text">Painel Admin</span>
          </router-link>
        </li> -->
      </ul>

      <!-- Novo botão de logout -->
      <div class="logout-section">
        <button @click="handleLogout" class="logout-btn"> <!-- Changed to button -->
          <img src="../../public/icons/sair.svg" alt="Sair" class="icon" />
          <span v-if="isExpanded" class="link-text">Sair</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'

const emit = defineEmits(['sidebarToggle']) // Adicione esta linha

const router = useRouter()
const isAdmin = ref(false)
const isExpanded = ref(true)

const checkAdminStatus = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    isAdmin.value = profile?.role === 'admin'
  }
}

const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value
  emit('sidebarToggle', !isExpanded.value) // Emite o evento para o App.vue
}

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear any necessary storage
    localStorage.clear()
    
    // Navigate to login page
    await router.push('/login')
    
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    alert('Erro ao sair do sistema. Tente novamente.')
  }
}

onMounted(() => {
  checkAdminStatus()
})
</script>

<style scoped>
.sidebar-container {
  position: relative;
}

.sidebar {
  background: linear-gradient(180deg, #193155 0%, #0f1f35 100%);
  color: white;
  height: 100vh;
  width: 280px;
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 1rem;
}

.sidebar.collapsed {
  width: 80px;
  padding: 1.5rem 0.5rem;
}

.toggle-btn {
  position: absolute;
  right: -15px;
  top: 25px;
  background: #ffffff;
  color: #193155;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Remove any previous positioning adjustments */
.sidebar.collapsed ~ .toggle-btn {
  left: auto;
}

.logo-section {
  padding: 1rem;
  padding-right: 3rem; /* Add space for toggle button */
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  width: 30px;
  height: 30px;
}

.nav-links {
  list-style: none;
  padding: 1rem 0;
  margin: 0;
  flex: 1;
}

.nav-links li {
  margin-bottom: 0.5rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Novo estilo para a seção de logout */
.logout-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
  margin-top: auto;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  filter: brightness(0) invert(1); /* Add this line to make SVG white */
}

.link-text {
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.collapsed .link-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  
  .sidebar.collapsed {
    width: 0;
    padding: 0;
  }
  
  .link-text {
    display: none;
  }
  
  .toggle-btn {
    top: 10px;
  }
}
</style>
