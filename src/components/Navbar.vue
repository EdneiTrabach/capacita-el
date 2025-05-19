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
          <router-link to="/cursos">
            <img src="../../public/icons/novo-curso.svg" alt="Cadastro de Cursos" class="icon" />
            <span v-if="isExpanded" class="link-text">Novo de treinamentos</span>
          </router-link>
        </li>
        <li>
          <router-link to="/lista-cursos">
            <img src="../../public/icons/livros.svg" alt="Cursos" class="icon" />
            <span v-if="isExpanded" class="link-text">Treinamentos</span>
          </router-link>
        </li>
        <li>
          <router-link to="/certificados">
            <img src="../../public/icons/certificado.svg" alt="Certificados" class="icon" />
            <span v-if="isExpanded" class="link-text">Certificados</span>
          </router-link>
        </li>
        <li>
          <router-link to="/relatorios">
            <img src="../../public/icons/relatorio.svg" alt="Relatórios" class="icon" />
            <span v-if="isExpanded" class="link-text">Relatórios</span>
          </router-link>
        </li>
        <li v-if="isAdmin">
          <router-link to="/admin">
            <img src="/public/icons/config-usuario.svg" alt="Admin" class="icon" />
            <span v-if="isExpanded" class="link-text">Painel Admin</span>
          </router-link>
        </li>
        <!-- Adicione o item para envio de emails no menu -->
        <li v-if="isAdmin">
          <router-link to="/envio-emails">
            <img src="/public/icons/email.svg" alt="Envio de Emails" class="icon" />
            <span v-if="isExpanded" class="link-text">Envio de Emails</span>
          </router-link>
        </li>
      </ul>

      <div class="utility-section">
        <button class="utility-btn" @click="toggleNotifications">
          <img src="/icons/bell.svg" alt="Notificações" class="icon" />
          <span v-if="isExpanded" class="link-text">
            Notificações
            <span v-if="notificationCount > 0" class="notification-badge">
              {{ notificationCount }}
            </span>
          </span>
        </button>

        <ThemeToggle :show-text="isExpanded" />
      </div>

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
import ThemeToggle from './ThemeToggle.vue'

const emit = defineEmits(['sidebarToggle']) // Adicione esta linha

const router = useRouter()
const isAdmin = ref(false)
const isManager = ref(false) // Adicione esta linha
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
    isManager.value = profile?.role === 'gerente' || profile?.role === 'admin'
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

const isDarkMode = ref(false)
const toggleTheme = () => { }

onMounted(() => {
  checkAdminStatus()
})

const notificationCount = ref(0)

const toggleNotifications = () => {
  // Implemente a lógica de notificações aqui
  console.log('Toggling notifications')
}

onMounted(() => {
  checkAdminStatus()
})
</script>

<style scoped>
.sidebar-container {
  position: relative;
}

/* Ajuste na classe .sidebar */
.sidebar {
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  width: 280px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 1rem;
  height: 100vh;
  /* Altura total da viewport */
  min-height: min-content;
  /* Garante que o conteúdo mínimo seja mostrado */
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
.sidebar.collapsed~.toggle-btn {
  left: auto;
}

.logo-section {
  padding: 1rem;
  padding-right: 3rem;
  /* Add space for toggle button */
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  width: 30px;
  height: 30px;
}

/* Ajuste na classe .nav-links */
.nav-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  padding-left: 0;
  width: 100%;
  margin: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.5) rgba(255, 255, 255, 0.1);
}

/* Scrollbar personalizada */
.nav-links::-webkit-scrollbar {
  width: 6px;
  /* Largura da scrollbar */
}

.nav-links::-webkit-scrollbar-track {
  background: rgba(181, 102, 111, 0.1);
  /* Track em bordô sutil */
  border-radius: 3px;
}

.nav-links::-webkit-scrollbar-thumb {
  background: rgba(181, 102, 111, 0.3);
  /* Thumb em bordô */
  border-radius: 3px;
  cursor: pointer;
}

/* Hover na scrollbar */
.nav-links::-webkit-scrollbar-thumb:hover {
  background: rgba(181, 102, 111, 0.5);
  /* Hover em bordô mais forte */
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
  padding: 1rem 0;
  margin-top: auto;
  flex-shrink: 0;
  /* Impede que a seção encolha */
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
  font-family: 'Roboto', sans-serif;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Adicione estas classes para garantir que os textos longos se ajustem */
.link-text {
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.3s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Adiciona "..." quando o texto é muito longo */
  font-size: 15px;
}

.collapsed .link-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
    padding: 1.5rem 0.5rem;
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

.utility-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: auto;
  /* Empurra para baixo */
  flex-shrink: 0;
  /* Impede que a seção encolha */
}

/* Ajuste para os botões de utilidade */
.utility-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.utility-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

/* Ajuste responsivo */
@media (max-width: 768px) {
  .utility-section {
    align-items: center;
  }

  .utility-btn {
    width: auto;
    padding: 0.75rem;
  }

  .notification-badge {
    right: 0;
  }
}

/* Adicione estilos para a barra de rolagem personalizada */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
