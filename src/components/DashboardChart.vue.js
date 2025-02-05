/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
export default (await import('vue')).defineComponent({
    name: 'DashboardChart',
    components: { Bar },
    props: {
        matriculasPorCurso: {
            type: Object,
            required: true
        }
    },
    computed: {
        chartData() {
            return {
                labels: Object.keys(this.matriculasPorCurso),
                datasets: [{
                        label: 'Matrículas por Curso',
                        data: Object.values(this.matriculasPorCurso),
                        backgroundColor: '#3498db'
                    }]
            };
        },
        chartOptions() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: false }
                }
            };
        }
    }
}); /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_componentsOption = { Bar };
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("chart-wrapper") },
    });
    if (__VLS_ctx.chartData) {
        const __VLS_0 = {}.Bar;
        /** @type { [typeof __VLS_components.Bar, ] } */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            data: ((__VLS_ctx.chartData)),
            options: ((__VLS_ctx.chartOptions)),
        }));
        const __VLS_2 = __VLS_1({
            data: ((__VLS_ctx.chartData)),
            options: ((__VLS_ctx.chartOptions)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    ['chart-wrapper',];
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
