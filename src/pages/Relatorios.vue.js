/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import axios from 'axios';
import API_URL from '../config/api';
import { sanitizeHTML } from '@/utils/sanitize';
export default (await import('vue')).defineComponent({
    name: 'Relatorios',
    data() {
        return {
            showCertificadosReport: false,
            showAlunosReport: false,
            alunos: [],
            cursos: [],
            anos: [],
            certificadosFilters: {
                alunoId: '',
                cursoId: '',
                status: '',
                dataInicio: '',
                dataFim: '',
                ano: ''
            },
            alunosFilters: {
                cursoId: '',
                status: '',
                dataInicio: '',
                dataFim: '',
                conclusao: ''
            }
        };
    },
    methods: {
        async loadData() {
            try {
                const [{ data: alunos }, { data: cursos }] = await Promise.all([
                    supabase.from('usuarios').select('*'),
                    supabase.from('cursos').select('*')
                ]);
                this.alunos = alunos || [];
                this.cursos = cursos || [];
                // Generate years for filter (last 5 years)
                const currentYear = new Date().getFullYear();
                this.anos = Array.from({ length: 5 }, (_, i) => currentYear - i);
            }
            catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        },
        async gerarRelatorioCertificados() {
            try {
                const response = await axios.get(`${API_URL}/relatorios/certificados`, {
                    params: this.certificadosFilters
                });
                // Process the data for PDF generation
                return response.data;
            }
            catch (error) {
                console.error('Erro ao gerar relatório:', error);
                throw error;
            }
        },
        async exportarCertificadosExcel() {
            // Implementar exportação Excel
        },
        async gerarRelatorioAlunos() {
            try {
                const response = await axios.get(`${API_URL}/relatorios/alunos-por-curso`, {
                    params: this.alunosFilters
                });
                // Process the data for PDF generation
                return response.data;
            }
            catch (error) {
                console.error('Erro ao gerar relatório:', error);
                throw error;
            }
        },
        async exportarAlunosExcel() {
            // Implementar exportação Excel
        },
        sanitizeHTML
    },
    created() {
        this.loadData();
    }
}); /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['relatorios-header', 'relatorio-card', 'relatorio-card', 'relatorio-card', 'btn-gerar', 'btn-gerar', 'relatorios-container', 'relatorios-header', 'relatorios-grid', 'relatorio-card', 'card-icon', 'btn-gerar', 'report-header', 'filter-group', 'filter-group', 'filter-group', 'date-range', 'btn-voltar', 'btn-gerar-pdf', 'btn-export-excel', 'btn-voltar', 'btn-gerar-pdf', 'btn-export-excel', 'filters-grid', 'actions-bar', 'btn-voltar', 'btn-gerar-pdf', 'btn-export-excel',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("relatorios-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: ("relatorios-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    if (__VLS_ctx.showCertificadosReport) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("report-section") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("report-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.showCertificadosReport)))
                        return;
                    __VLS_ctx.showCertificadosReport = false;
                } },
            ...{ class: ("btn-voltar") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/voltar.svg"),
            alt: ("Voltar"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filters-grid") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.certificadosFilters.alunoId)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        for (const [aluno] of __VLS_getVForSourceType((__VLS_ctx.alunos))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((aluno.id)),
                value: ((aluno.id)),
            });
            (aluno.nome);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.certificadosFilters.cursoId)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        for (const [curso] of __VLS_getVForSourceType((__VLS_ctx.cursos))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((curso.id)),
                value: ((curso.id)),
            });
            (curso.nome);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.certificadosFilters.status)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("emitido"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("pendente"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("date-range") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            type: ("date"),
        });
        (__VLS_ctx.certificadosFilters.dataInicio);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            type: ("date"),
        });
        (__VLS_ctx.certificadosFilters.dataFim);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.certificadosFilters.ano)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        for (const [ano] of __VLS_getVForSourceType((__VLS_ctx.anos))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((ano)),
                value: ((ano)),
            });
            (ano);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("actions-bar") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.gerarRelatorioCertificados) },
            ...{ class: ("btn-gerar-pdf") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/pdf.svg"),
            alt: ("PDF"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.exportarCertificadosExcel) },
            ...{ class: ("btn-export-excel") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/excel.svg"),
            alt: ("EXCEL"),
            ...{ class: ("icon") },
        });
    }
    if (__VLS_ctx.showAlunosReport) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("report-section") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("report-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.showAlunosReport)))
                        return;
                    __VLS_ctx.showAlunosReport = false;
                } },
            ...{ class: ("btn-voltar") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/voltar.svg"),
            alt: ("Voltar"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filters-grid") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.alunosFilters.cursoId)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        for (const [curso] of __VLS_getVForSourceType((__VLS_ctx.cursos))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((curso.id)),
                value: ((curso.id)),
            });
            (curso.nome);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.alunosFilters.status)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("ativo"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("inativo"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("cursando"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("date-range") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            type: ("date"),
        });
        (__VLS_ctx.alunosFilters.dataInicio);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            type: ("date"),
        });
        (__VLS_ctx.alunosFilters.dataFim);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.alunosFilters.conclusao)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("concluido"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("emAndamento"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("actions-bar") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.gerarRelatorioAlunos) },
            ...{ class: ("btn-gerar-pdf") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/pdf.svg"),
            alt: ("PDF"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.exportarAlunosExcel) },
            ...{ class: ("btn-export-excel") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/excel.svg"),
            alt: ("EXCEL"),
            ...{ class: ("icon") },
        });
    }
    if (!__VLS_ctx.showCertificadosReport && !__VLS_ctx.showAlunosReport) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("relatorios-grid") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.showCertificadosReport && !__VLS_ctx.showAlunosReport)))
                        return;
                    __VLS_ctx.showAlunosReport = true;
                } },
            ...{ class: ("relatorio-card") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("card-icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/relatorio.svg"),
            alt: ("Alunos por Curso"),
            ...{ class: ("icon-black") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ class: ("btn-gerar") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.showCertificadosReport && !__VLS_ctx.showAlunosReport)))
                        return;
                    __VLS_ctx.showCertificadosReport = true;
                } },
            ...{ class: ("relatorio-card") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("card-icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/grafico-linha.svg"),
            alt: ("Certificados Emitidos"),
            ...{ class: ("icon-black") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ class: ("btn-gerar") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("report-data") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.sanitizeHTML(__VLS_ctx.certificado.aluno_nome));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.sanitizeHTML(__VLS_ctx.certificado.curso_nome));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.sanitizeHTML(__VLS_ctx.certificado.observacoes));
    ['relatorios-container', 'relatorios-header', 'report-section', 'report-header', 'btn-voltar', 'icon', 'filters-grid', 'filter-group', 'filter-group', 'filter-group', 'filter-group', 'date-range', 'filter-group', 'actions-bar', 'btn-gerar-pdf', 'icon', 'btn-export-excel', 'icon', 'report-section', 'report-header', 'btn-voltar', 'icon', 'filters-grid', 'filter-group', 'filter-group', 'filter-group', 'date-range', 'filter-group', 'actions-bar', 'btn-gerar-pdf', 'icon', 'btn-export-excel', 'icon', 'relatorios-grid', 'relatorio-card', 'card-icon', 'icon-black', 'btn-gerar', 'relatorio-card', 'card-icon', 'icon-black', 'btn-gerar', 'report-data',];
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
