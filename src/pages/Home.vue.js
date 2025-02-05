/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { supabase } from '../config/supabase';
export default (await import('vue')).defineComponent({
    name: 'Home',
    methods: {
        async handleLogout() {
            try {
                const { error } = await supabase.auth.signOut();
                if (error)
                    throw error;
                // Clear local storage
                localStorage.removeItem('isAuthenticated');
                // Redirect to login
                this.$router.push('/login');
            }
            catch (error) {
                console.error('Erro ao sair:', error);
                alert('Erro ao sair do sistema. Tente novamente.');
            }
        }
    }
}); /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['home-header', 'logout-btn', 'nav-card', 'nav-card', 'nav-card', 'nav-card', 'card-icon', 'nav-card', 'nav-card', 'nav-card', 'card-action', 'info-card', 'info-card', 'info-card', 'info-card', 'version', 'home', 'home-header', 'home-header', 'cards-grid', 'nav-card',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("home") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: ("home-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("cards-grid") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/dashboard');
            } },
        ...{ class: ("nav-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/grafico.svg"),
        alt: ("Dashboard"),
        ...{ class: ("icon-home") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-action") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/usuarios');
            } },
        ...{ class: ("nav-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/add-usuario.svg"),
        alt: ("Cadastro de Alunos"),
        ...{ class: ("icon-home") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-action") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/lista-usuarios');
            } },
        ...{ class: ("nav-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/config-usuario.svg"),
        alt: ("Gestao de Alunos"),
        ...{ class: ("icon-home") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-action") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/certificados');
            } },
        ...{ class: ("nav-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/certificado.svg"),
        alt: ("Certificados"),
        ...{ class: ("icon-home") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-action") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/lista-cursos');
            } },
        ...{ class: ("nav-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/livros.svg"),
        alt: ("Cursos"),
        ...{ class: ("icon-home") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-action") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("nav-card info-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/informacao.svg"),
        alt: ("Info"),
        ...{ class: ("icon-home") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: ("about") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("version") },
    });
    ['home', 'home-header', 'cards-grid', 'nav-card', 'card-icon', 'icon-home', 'card-action', 'nav-card', 'card-icon', 'icon-home', 'card-action', 'nav-card', 'card-icon', 'icon-home', 'card-action', 'nav-card', 'card-icon', 'icon-home', 'card-action', 'nav-card', 'card-icon', 'icon-home', 'card-action', 'nav-card', 'info-card', 'card-icon', 'icon-home', 'about', 'version',];
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
let __VLS_self;
