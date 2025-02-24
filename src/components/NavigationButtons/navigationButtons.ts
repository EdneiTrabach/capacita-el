import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useNavigation() {
  const router = useRouter()
  const route = useRoute()

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

  const excludedRoutes = [
    '/login', 
    '/reset-password', 
    '/admin',
    '/forgot-password',
    '/404',
    '/unauthorized',
    '/perfil'
  ]

  const showNavigation = computed(() => !excludedRoutes.includes(route.path))

  const isSpecialRoute = computed(() => {
    const currentPath = route.path
    return (
      currentPath.includes('/lista-presenca') || 
      currentPath.includes('/registrar-presenca') || 
      currentPath.includes('/matricula-alunos') ||
      currentPath.includes('/curso/') ||
      ['/usuarios-sistema', '/permissoes', '/auditoria-acessos'].includes(currentPath)
    )
  })

  const getBackRoute = computed(() => {
    const currentPath = route.path
    if (['/usuarios-sistema', '/permissoes', '/auditoria-acessos'].includes(currentPath)) {
      return '/admin'
    }
    if (currentPath.includes('/curso/') || currentPath.includes('/matricula-alunos/')) {
      return '/lista-cursos'
    }
    return -1
  })

  const navigate = (route: string | number) => {
    router.push(String(route))
  }

  const goToPrevious = () => {
    if (hasPrevious.value) {
      const prevRoute = systemRoutes[currentIndex.value - 1].path
      router.push(prevRoute).catch(() => {
        console.warn(`Rota ${prevRoute} não encontrada`)
      })
    }
  }

  const goToNext = () => {
    if (hasNext.value) {
      const nextRoute = systemRoutes[currentIndex.value + 1].path
      router.push(nextRoute).catch(() => {
        console.warn(`Rota ${nextRoute} não encontrada`)
      })
    }
  }

  return {
    showNavigation,
    isSpecialRoute,
    getBackRoute,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
    navigate,
    router
  }
}
