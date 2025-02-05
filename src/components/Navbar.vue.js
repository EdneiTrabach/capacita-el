/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { supabase } from '@/config/supabase';
import { useRouter } from 'vue-router';
const router = useRouter();
const isAdmin = ref(false);
const isExpanded = ref(true);
const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        isAdmin.value = profile?.role === 'admin';
    }
};
const toggleSidebar = () => {
    isExpanded.value = !isExpanded.value;
};
const handleLogout = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error)
            throw error;
        // Clear any necessary storage
        localStorage.clear();
        // Navigate to login page
        await router.push('/login');
    }
    catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao sair do sistema. Tente novamente.');
    }
};
onMounted(() => {
    checkAdminStatus();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['sidebar', 'toggle-btn', 'sidebar', 'collapsed', 'toggle-btn', 'nav-links', 'nav-links', 'nav-links', 'nav-links', 'logout-btn', 'collapsed', 'link-text', 'sidebar', 'sidebar', 'collapsed', 'link-text', 'toggle-btn',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("sidebar-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
        ...{ class: ("sidebar") },
        ...{ class: (({ 'collapsed': !__VLS_ctx.isExpanded })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleSidebar) },
        ...{ class: ("toggle-btn") },
    });
    (__VLS_ctx.isExpanded ? '◀' : '▶');
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("logo-section") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../../public/icons/logo-itilh.svg"),
        alt: ("Logo"),
        ...{ class: ("logo") },
    });
    if (__VLS_ctx.isExpanded) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: ("nav-links") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    const __VLS_0 = {}.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: ("/"),
    }));
    const __VLS_2 = __VLS_1({
        to: ("/"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../../public/icons/home.svg"),
        alt: ("Home"),
        ...{ class: ("icon") },
    });
    if (__VLS_ctx.isExpanded) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("link-text") },
        });
    }
    __VLS_5.slots.default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    const __VLS_6 = {}.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
        to: ("/dashboard"),
    }));
    const __VLS_8 = __VLS_7({
        to: ("/dashboard"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../../public/icons/grafico.svg"),
        alt: ("Dashboard"),
        ...{ class: ("icon") },
    });
    if (__VLS_ctx.isExpanded) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("link-text") },
        });
    }
    __VLS_11.slots.default;
    var __VLS_11;
    __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    const __VLS_12 = {}.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        to: ("/usuarios"),
    }));
    const __VLS_14 = __VLS_13({
        to: ("/usuarios"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../../public/icons/add-usuario.svg"),
        alt: ("Cadastro de Usuário"),
        ...{ class: ("icon") },
    });
    if (__VLS_ctx.isExpanded) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("link-text") },
        });
    }
    __VLS_17.slots.default;
    var __VLS_17;
    __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    const __VLS_18 = {}.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
        to: ("/lista-usuarios"),
    }));
    const __VLS_20 = __VLS_19({
        to: ("/lista-usuarios"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../../public/icons/config-usuario.svg"),
        alt: ("Configuracoes de Usuário"),
        ...{ class: ("icon") },
    });
    if (__VLS_ctx.isExpanded) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("link-text") },
        });
    }
    __VLS_23.slots.default;
    var __VLS_23;
    __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    const __VLS_24 = {}.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        to: ("/certificados"),
    }));
    const __VLS_26 = __VLS_25({
        to: ("/certificados"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../../public/icons/certificado.svg"),
        alt: ("Certificados"),
        ...{ class: ("icon") },
    });
    if (__VLS_ctx.isExpanded) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("link-text") },
        });
    }
    __VLS_29.slots.default;
    var __VLS_29;
    __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    const __VLS_30 = {}.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
        to: ("/lista-cursos"),
    }));
    const __VLS_32 = __VLS_31({
        to: ("/lista-cursos"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../../public/icons/livros.svg"),
        alt: ("Cursos"),
        ...{ class: ("icon") },
    });
    if (__VLS_ctx.isExpanded) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("link-text") },
        });
    }
    __VLS_35.slots.default;
    var __VLS_35;
    if (__VLS_ctx.isAdmin) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
        const __VLS_36 = {}.RouterLink;
        /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            to: ("/admin"),
        }));
        const __VLS_38 = __VLS_37({
            to: ("/admin"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/config-usuario.svg"),
            alt: ("Admin"),
            ...{ class: ("icon") },
        });
        if (__VLS_ctx.isExpanded) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: ("link-text") },
            });
        }
        __VLS_41.slots.default;
        var __VLS_41;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("logout-section") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.handleLogout) },
        ...{ class: ("logout-btn") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../../public/icons/sair.svg"),
        alt: ("Sair"),
        ...{ class: ("icon") },
    });
    if (__VLS_ctx.isExpanded) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("link-text") },
        });
    }
    ['sidebar-container', 'sidebar', 'collapsed', 'toggle-btn', 'logo-section', 'logo', 'nav-links', 'icon', 'link-text', 'icon', 'link-text', 'icon', 'link-text', 'icon', 'link-text', 'icon', 'link-text', 'icon', 'link-text', 'icon', 'link-text', 'logout-section', 'logout-btn', 'icon', 'link-text',];
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
            isAdmin: isAdmin,
            isExpanded: isExpanded,
            toggleSidebar: toggleSidebar,
            handleLogout: handleLogout,
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
