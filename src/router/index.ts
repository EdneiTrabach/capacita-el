import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/config/supabase'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../pages/Home.vue'
import AdminPanel from '../pages/AdminPanel.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/usuarios/:id?',  // Adicione parâmetro opcional
    name: 'CadastroUsuarios',
    component: () => import('../pages/CadastroUsuarios.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lista-usuarios',
    name: 'listaUsuarios',
    component: () => import('../pages/ListaUsuarios.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cursos/:id?',
    name: 'CadastroCursos',
    component: () => import('../pages/CadastroCursos.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cursos',
    name: 'cadastroCursos',
    component: () => import('../pages/CadastroCursos.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lista-cursos',
    name: 'ListaCursos',  // Make sure name matches exactly
    component: () => import('../pages/ListaCursos.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/certificados',
    name: 'certificados',
    component: () => import('../pages/CertificadosAlunos.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/relatorios',
    name: 'relatorios',
    component: () => import('../pages/Relatorios.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/pages/ResetPassword.vue'),
    meta: {
      allowResetPassword: true,
      isAuthRoute: true
    },
    beforeEnter: (to, from, next) => {
      // Verifica se tem hash com token
      if (window.location.hash) {
        next()
      } else {
        next('/login')
      }
    }
  },
  {
    path: '/admin',
    component: AdminPanel,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

// Middleware de autenticação
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const isAuthRoute = to.matched.some(record => record.meta.isAuthRoute)
  const allowResetPassword = to.matched.some(record => record.meta.allowResetPassword)
  const isAdmin = to.matched.some(record => record.meta.requiresAdmin)

  // Permitir acesso à página de reset de senha mesmo com sessão ativa
  if (allowResetPassword) {
    next()
    return
  }

  // Verifica se é uma rota de autenticação (login, reset-password)
  if (isAuthRoute) {
    if (session) {
      next('/')
    } else {
      next()
    }
    return
  }

  // Verifica se a rota requer autenticação
  if (requiresAuth) {
    if (!session) {
      // Salva a URL tentada para redirect após login
      sessionStorage.setItem('intendedUrl', to.fullPath)
      next('/login')
    } else {
      // Se já está autenticado, permite o acesso
      next()
    }
    return
  }

  next()
})

// Adicione um guard global de erro
router.beforeEach((to, from, next) => {
  // Se a rota não existe, redireciona para NotFound
  if (!to.matched.length) {
    next({ name: 'NotFound' })
    return
  }
  next()
})

// Melhore o tratamento de erros
router.onError((error) => {
  console.error('Router error:', error)
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    window.location.reload()
  }
})

export default router
