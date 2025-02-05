/// <reference types="../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { RouterView } from 'vue-router';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from './config/supabase';
import Navbar from './components/Navbar.vue';
const route = useRoute();
const isSidebarCollapsed = ref(false);
// Use Supabase session for authentication
const isAuthenticated = computed(() => {
    return !!supabase.auth.getSession();
});
const showNavbar = computed(() => isAuthenticated.value && route.path !== '/login');
const handleSidebarToggle = (collapsed) => {
    isSidebarCollapsed.value = collapsed;
};
// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        // Handle sign in
        console.log('User signed in:', session);
    }
    else if (event === 'SIGNED_OUT') {
        // Handle sign out
        console.log('User signed out');
    }
});
// Computed property para controlar visibilidade do Navbar
const shouldShowNavbar = computed(() => {
    // Não mostra o navbar em rotas de autenticação
    if (route.meta.isAuthRoute)
        return false;
    // Não mostra o navbar em rotas que não requerem autenticação
    if (!route.meta.requiresAuth)
        return false;
    return true;
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['router-link-exact-active', 'logo', 'with-sidebar', 'with-sidebar', 'with-sidebar', 'with-sidebar', 'sidebar-collapsed', 'main-content', 'with-sidebar', 'main-content', 'with-sidebar', 'sidebar-collapsed',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: ("app"),
        ...{ class: ("app-container") },
    });
    if (__VLS_ctx.shouldShowNavbar) {
        // @ts-ignore
        /** @type { [typeof Navbar, ] } */ ;
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(Navbar, new Navbar({
            ...{ 'onSidebarToggle': {} },
        }));
        const __VLS_1 = __VLS_0({
            ...{ 'onSidebarToggle': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        let __VLS_5;
        const __VLS_6 = {
            onSidebarToggle: (__VLS_ctx.handleSidebarToggle)
        };
        let __VLS_2;
        let __VLS_3;
        var __VLS_4;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
        ...{ class: ("main-content") },
        ...{ class: (({ 'with-sidebar': __VLS_ctx.shouldShowNavbar, 'sidebar-collapsed': __VLS_ctx.isSidebarCollapsed })) },
    });
    const __VLS_7 = {}.RouterView;
    /** @type { [typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ] } */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({}));
    const __VLS_9 = __VLS_8({}, ...__VLS_functionalComponentArgsRest(__VLS_8));
    ['app-container', 'main-content', 'with-sidebar', 'sidebar-collapsed',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {};
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterView: RouterView,
            Navbar: Navbar,
            isSidebarCollapsed: isSidebarCollapsed,
            handleSidebarToggle: handleSidebarToggle,
            shouldShowNavbar: shouldShowNavbar,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
