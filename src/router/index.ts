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
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
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
