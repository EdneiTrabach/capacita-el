import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/config/supabase'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../pages/Home.vue'
import AdminPanel from '../pages/AdminPanel.vue'
import Login from '@/pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import CadastroUsuarios from '../pages/CadastroUsuarios.vue'
import ListaUsuarios from '../pages/ListaUsuarios.vue'
import CadastroCursos from '../pages/CadastroCursos.vue'
import ListaCursos from '../pages/ListaCursos.vue'
import CertificadosAlunos from '../pages/CertificadosAlunos.vue'
import Relatorios from '../pages/Relatorios.vue'
import ResetPassword from '@/pages/ResetPassword.vue'
import NotFound from '@/pages/NotFound.vue'
import RelatoriosPeriodo from '@/components/RelatoriosPeriodo/RelatoriosPeriodo.vue'
import RelatoriosSetor from '@/components/RelatoriosSetor/RelatoriosSetor.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
      path: '/matricula-alunos',
      name: 'MatriculaAlunos',
      component: () => import('@/pages/MatriculaAlunos.vue')
    },
    {
      path: '/matricula-alunos/:cursoId',
      name: 'MatriculaAlunos',
      component: () => import('@/components/matricula/MatriculaAlunos.vue'),
      meta: {
        requiresAuth: true,
        layout: 'default' // Isso ativará o layout com sidebar
      },
      props: true
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
      path: '/usuarios-sistema',
      name: 'UsuariosSistema',
      component: () => import('../pages/UsuariosSistema.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/permissoes',
      name: 'Permissoes',
      component: () => import('../pages/Permissoes.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/auditoria-acessos',
      name: 'AuditoriaAcessos',
      component: () => import('../pages/AuditoriaAcessos.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/curso/:id/presenca',
      name: 'ListaPresenca',
      component: () => import('../components/ListaPresenca/ListaPresenca.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/curso/:id/avaliacao',
      name: 'AvaliacaoReacao',
      component: () => import('@/components/AvaliacaoReacao.vue')
    },
    {
      path: '/relatorios/periodo',
      name: 'RelatoriosPeriodo',
      component: RelatoriosPeriodo,
      meta: { requiresAuth: true }
    },
    {
      path: '/relatorios/setor',
      name: 'RelatoriosSetor', 
      component: RelatoriosSetor,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFound.vue'),
      meta: { requiresAuth: false }
    }  
  ]
})

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

  if (to.meta.requiresAdmin) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single()
    
    if (userData?.role !== 'admin') {
      next('/')
      return
    }
  }

  // Adicione uma verificação específica para a rota de lista de presença
  if (to.name === 'ListaPresenca') {
    const cursoId = to.params.id
    const { data, error } = await supabase
      .from('cursos')
      .select('status')
      .eq('id', cursoId)
      .single()

    if (error || data?.status !== 'Em andamento') {
      next('/')
      return
    }
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

// Adicione um handler de erro global
router.onError((error) => {
  console.error('Router error:', error)
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    window.location.reload()
  }
})

// Certifique-se de que esta seja a única exportação default
export default router
