/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
export default (await import('vue')).defineComponent({
    name: 'ConfirmDialog',
    props: {
        show: Boolean,
        title: String,
        message: String,
        button: {
            type: Object,
            default: () => ({
                yes: 'Confirmar',
                no: 'Cancelar'
            })
        }
    }
}); /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['confirm-dialog', 'confirm-dialog', 'btn-cancelar', 'btn-confirmar', 'btn-cancelar', 'btn-confirmar',];
    // CSS variable injection 
    // CSS variable injection end 
    if (__VLS_ctx.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("confirm-dialog-overlay") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("confirm-dialog") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (__VLS_ctx.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.message);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("confirm-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.show)))
                        return;
                    __VLS_ctx.$emit('cancel');
                } },
            ...{ class: ("btn-cancelar") },
        });
        (__VLS_ctx.button.no);
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.show)))
                        return;
                    __VLS_ctx.$emit('confirm');
                } },
            ...{ class: ("btn-confirmar") },
        });
        (__VLS_ctx.button.yes);
    }
    ['confirm-dialog-overlay', 'confirm-dialog', 'confirm-actions', 'btn-cancelar', 'btn-confirmar',];
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
