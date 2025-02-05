/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { supabase } from '@/config/supabase';
const systemLogs = ref([]);
const loadSystemLogs = async () => {
    try {
        const { data, error } = await supabase
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (error)
            throw error;
        systemLogs.value = data || [];
    }
    catch (error) {
        console.error('Erro ao carregar logs:', error);
    }
};
// Função para registrar logs
const logSystemAction = async (action, details) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('system_logs').insert({
            action,
            details,
            user_id: user?.id
        });
    }
    catch (error) {
        console.error('Erro ao registrar log:', error);
    }
};
// Função para formatar data
const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR');
};
const handleSystemConfig = () => {
    // Implementar lógica de configurações
};
onMounted(() => {
    loadSystemLogs();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['admin-header', 'admin-card', 'admin-actions', 'admin-actions', 'admin-container', 'admin-grid',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("admin-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: ("admin-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("admin-content") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("admin-grid") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("admin-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("admin-actions") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/lista-usuarios');
            } },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../../public/icons/config-usuario.svg"),
        alt: ("Usuários"),
        ...{ class: ("icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("admin-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("admin-actions") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.handleSystemConfig) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../../public/icons/config-usuario.svg"),
        alt: ("Configurações"),
        ...{ class: ("icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("admin-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("logs-container") },
    });
    for (const [log] of __VLS_getVForSourceType((__VLS_ctx.systemLogs))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((log.id)),
            ...{ class: ("log-entry") },
        });
        (__VLS_ctx.formatDate(log.created_at));
        (log.action);
    }
    ['admin-container', 'admin-header', 'admin-content', 'admin-grid', 'admin-card', 'admin-actions', 'icon', 'admin-card', 'admin-actions', 'icon', 'admin-card', 'logs-container', 'log-entry',];
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
            systemLogs: systemLogs,
            formatDate: formatDate,
            handleSystemConfig: handleSystemConfig,
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
