import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../config/supabase'
import Home from '../pages/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/usuarios',
      name: 'cadastroUsuarios',
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
      path: '/cursos',
      name: 'cadastroCursos',
      component: () => import('../pages/CadastroCursos.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/lista-cursos',
      name: 'listaCursos',
      component: () => import('../pages/ListaCursos.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard to protect routes
router.beforeEach(async (to, from, next) => {
  const session = await supabase.auth.getSession()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !session) {
    next('/login')
  } else if (!requiresAuth && session && to.path === '/login') {
    next('/')
  } else {
    next()
  }
})

export default router
