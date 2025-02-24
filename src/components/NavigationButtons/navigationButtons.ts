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
    { path: '/certificados', name: 'Certificados' },
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
    return route.path.includes('/edit') || route.path.includes('/new')
  })

  const getBackRoute = computed(() => {
    if (route.path.includes('/admin')) return '/admin'
    return '/lista-cursos'  // rota padrão de retorno
  })

  const navigate = (direction: 'prev' | 'next') => {
    let targetIndex: number

    if (direction === 'prev' && hasPrevious.value) {
      targetIndex = currentIndex.value - 1
    } else if (direction === 'next' && hasNext.value) {
      targetIndex = currentIndex.value + 1  
    } else {
      return
    }

    const targetRoute = systemRoutes[targetIndex]
    if (targetRoute) {
      router.push({
        path: targetRoute.path
      })
    }
  }

  const goToPrevious = () => {
    if (hasPrevious.value) {
      navigate('prev')
    }
  }

  const goToNext = () => {
    if (hasNext.value) {
      navigate('next')  
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
