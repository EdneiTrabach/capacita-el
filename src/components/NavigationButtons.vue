<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

// Modifique o systemRoutes removendo matricula-alunos
const systemRoutes = [
  { path: '/', name: 'Home' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/usuarios', name: 'Cadastro de Pessoas' },
  { path: '/lista-usuarios', name: 'Gestão de Pessoas' },
  { path: '/cursos', name: 'Cadastro de Treinamentos' },
  { path: '/lista-cursos', name: 'Lista de Treinamentos' },
  { path: '/certificados', name: 'Emissão de Certificados' },
  { path: '/relatorios', name: 'Relatórios' }
]

const currentIndex = computed(() => {
  return systemRoutes.findIndex(r => r.path === route.path)
})

const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < systemRoutes.length - 1)

const goToPrevious = () => {
  if (hasPrevious.value) {
    const prevRoute = systemRoutes[currentIndex.value - 1].path
    router.push(prevRoute).catch(() => {
      // Se a rota não existir, não faz nada
      console.warn(`Rota ${prevRoute} não encontrada`)
    })
  }
}

const goToNext = () => {
  if (hasNext.value) {
    const nextRoute = systemRoutes[currentIndex.value + 1].path
    router.push(nextRoute).catch(() => {
      // Se a rota não existir, não faz nada
      console.warn(`Rota ${nextRoute} não encontrada`)
    })
  }
}

// Rotas onde os botões não devem aparecer
const excludedRoutes = [
  '/login', 
  '/reset-password', 
  '/admin',
  '/forgot-password',
  '/404',
  '/unauthorized',
  '/perfil'
]

const showNavigation = computed(() => {
  return !excludedRoutes.includes(route.path)
})

// Modifique o isSpecialRoute para verificar se contém o caminho base e dinâmico
const isSpecialRoute = computed(() => {
  const currentPath = route.path
  return (
    currentPath.includes('/lista-presenca') || 
    currentPath.includes('/registrar-presenca') || 
    currentPath.includes('/matricula-alunos') ||
    currentPath.includes('/curso/')
  )
})

// Modifique a função para determinar a rota de retorno
const getBackRoute = computed(() => {
  const currentPath = route.path
  
  // Se estiver em uma rota de curso (presença ou matrícula)
  if (currentPath.includes('/curso/') || currentPath.includes('/matricula-alunos/')) {
    return '/lista-cursos'
  }
  
  return -1
})
</script>

<template>
  <div class="navigation-buttons" v-if="showNavigation">
    <!-- Se for rota especial, mostra apenas o botão de voltar -->
    <template v-if="isSpecialRoute">
      <button 
        @click="router.push('/lista-cursos')"
        class="nav-btn prev-btn"
      >
        <img src="/icons/left.svg" alt="Voltar" class="icon-white" />
        Voltar para Lista
      </button>
    </template>
    
    <!-- Se não for rota especial, mostra navegação normal -->
    <template v-else>
      <button 
        @click="goToPrevious" 
        :disabled="!hasPrevious"
        class="nav-btn prev-btn"
      >
        <img src="/icons/left.svg" alt="Anterior" class="icon-white" />
        Anterior
      </button>
      <button 
        @click="goToNext" 
        :disabled="!hasNext"
        class="nav-btn next-btn"
      >
        Próximo
        <img src="/icons/right.svg" alt="Próximo" class="icon-white" />
      </button>
    </template>
  </div>
</template>

<style scoped>
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  margin-top: auto;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  color: white;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #6c757d;
}

.nav-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 49, 85, 0.2);
}

.nav-btn:not(:disabled):active {
  transform: translateY(0);
}

.icon-white {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}
</style>