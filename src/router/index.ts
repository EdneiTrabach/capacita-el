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
    component: () => import('../pages/ResetPassword.vue'),
    meta: { 
      requiresAuth: false,
      isAuthRoute: true,
      allowResetPassword: true // Nova flag para identificar a rota de reset
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
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
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
    // Se tiver uma sessão ativa, redireciona para home
    if (session) {
      next('/')
    } else {
      next() // Permite acesso à rota de autenticação
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
      next()
    }
    return
  }

  // Verifica se a rota requer privilégios de administrador
  if (isAdmin) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single()

    if (profile?.role !== 'admin') {
      next('/')
      return
    }
  }

  // Para outras rotas
  next()
})

export default router
