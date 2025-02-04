import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../config/supabase'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../pages/Home.vue'

const routes: RouteRecordRaw[] = [
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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !session) {
    next('/login')
  } else if (to.path === '/login' && session) {
    next('/')
  } else {
    next()
  }
})

export default router
