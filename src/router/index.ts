import { createRouter, createWebHistory } from 'vue-router'
import { authDemo } from '@/services/authDemo'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../pages/Home.vue'
import AdminPanel from '@/pages/AdminPanel.vue'
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
import RelatoriosTempo from '@/components/RelatoriosTempo/RelatoriosTempo.vue'
import RelatoriosTipo from '@/components/RelatoriosTipo/RelatoriosTipo.vue'
import RelatoriosAgendados from '@/components/RelatoriosAgendados/RelatoriosAgendados.vue'
import RelatoriosPendentes from '@/components/RelatoriosPendentes/RelatoriosPendentes.vue'
import UsuariosSistema from '@/pages/UsuariosSistema.vue'
import AuditoriaAcessos from '@/pages/AuditoriaAcessos.vue'

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
      name: 'Relatorios',
      component: () => import('@/pages/Relatorios.vue'),
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
      name: 'AdminPanel',
      component: AdminPanel,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/usuarios-sistema',
      name: 'UsuariosSistema',
      component: UsuariosSistema,
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
      component: AuditoriaAcessos,
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
      path: '/relatorios/tempo',
      name: 'RelatoriosTempo',
      component: RelatoriosTempo,
      meta: { requiresAuth: true }
    },
    {
      path: '/relatorios/tipo',
      name: 'RelatoriosTipo',
      component: RelatoriosTipo,
      meta: { requiresAuth: true }
    },
    {
      path: '/relatorios/agendados',
      name: 'RelatoriosAgendados',
      component: RelatoriosAgendados,
      meta: { requiresAuth: true }
    },
    {
      path: '/relatorios/pendentes',
      name: 'RelatoriosPendentes',
      component: RelatoriosPendentes,
      meta: { requiresAuth: true }
    },
    {
      path: '/envio-emails',
      name: 'EnvioEmails',
      component: () => import('../pages/EnvioEmails.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/envio-emails/:cursoId',
      name: 'EnvioEmailsDetalhes',
      component: () => import('../pages/EnvioEmailsDetalhes.vue'),
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
  const session = authDemo.getSession()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const isAuthRoute = to.matched.some(record => record.meta.isAuthRoute)

  // Verifica se é uma rota de autenticação (login)
  if (isAuthRoute) {
    if (session.isAuthenticated) {
      // Se já está logado e tenta acessar login, redireciona para a página inicial
      const intendedUrl = sessionStorage.getItem('intendedUrl')
      sessionStorage.removeItem('intendedUrl')
      next(intendedUrl || '/')
    } else {
      next()
    }
    return
  }

  // Verifica se a rota requer autenticação
  if (requiresAuth) {
    if (!session.isAuthenticated) {
      // Salva a URL tentada para redirect após login
      sessionStorage.setItem('intendedUrl', to.fullPath)
      next('/login')
    } else {
      // Se já está autenticado, permite o acesso
      next()
    }
    return
  }

  // Para rotas que não requerem autenticação
  next()
})

export default router
