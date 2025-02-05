import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
  }
}

declare const router: import("vue-router").Router;
export default router;
