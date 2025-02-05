/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
export default (await import('vue')).defineComponent({
    props: {
        headers: { type: Array, required: true },
        rows: { type: Array, required: true },
    },
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
        ...{ class: ("data-table") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    for (const [header] of __VLS_getVForSourceType((__VLS_ctx.headers))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
            key: ((header)),
        });
        (header);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [row] of __VLS_getVForSourceType((__VLS_ctx.rows))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            key: ((row.id)),
        });
        for (const [value] of __VLS_getVForSourceType((row))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                key: ((value)),
            });
            (value);
        }
    }
    ['data-table',];
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
