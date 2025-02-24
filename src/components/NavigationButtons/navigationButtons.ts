import { computed } from 'vue'
import { useRouter, useRoute, RouteLocationRaw } from 'vue-router'

export function useNavigation() {
  const router = useRouter()
  const route = useRoute()

  const systemRoutes = [
    '/',
    '/dashboard',
    '/usuarios',
    '/lista-usuarios',
    '/cursos',
    '/lista-cursos',
    '/certificados',
    '/relatorios'
  ]

  const currentIndex = computed(() => {
    return systemRoutes.findIndex(r => r === route.path)
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

  const showNavigation = computed(() => systemRoutes.includes(route.path) || isSpecialRoute.value)

  const isSpecialRoute = computed(() => {
    return route.path.includes('/edit') || route.path.includes('/new')
  })

  const getBackRoute = computed((): string => {
    return route.path.includes('/admin') ? '/admin' : '/lista-cursos'
  })

  const navigate = (direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? currentIndex.value - 1 : currentIndex.value + 1
    if (targetIndex >= 0 && targetIndex < systemRoutes.length) {
      router.push(systemRoutes[targetIndex])
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
