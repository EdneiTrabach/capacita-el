/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, computed, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import DashboardChart from '../components/DashboardChart.vue';
import { supabase } from '../config/supabase';
import { sanitizeHTML } from '@/utils/sanitize';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const totalUsuarios = ref(0);
const cursosAtivos = ref(0);
const matriculasMes = ref(0);
const matriculasPorCurso = ref({});
const professores = ref([]);
const usuariosTendencia = ref(0);
const cursosConcluidos = ref(0);
const matriculasTotal = ref(0);
const alunosAtivos = ref(0);
const alunosCursando = ref(0);
const loading = ref(false);
const error = ref(null);
const filtros = ref({
    dataInicio: '',
    dataFim: '',
    statusCurso: '',
    statusAluno: '',
    professor: ''
});
const showCursosDetails = ref(false);
const cursos = ref([]);
const cursosFilters = ref({
    dataInicio: '',
    dataFim: '',
    status: ''
});
const totalCursos = ref(0);
const cursosEmAndamento = ref(0);
const cursosCancelados = ref(0);
const carregarEstatisticas = async () => {
    try {
        // Get users data
        const { data: usuarios, error: usersError } = await supabase
            .from('usuarios')
            .select('*');
        if (usersError)
            throw usersError;
        totalUsuarios.value = usuarios.length;
        alunosAtivos.value = usuarios.filter(u => u.status === 'ativo').length;
        alunosCursando.value = usuarios.filter(u => u.status === 'cursando').length;
        // Get courses data
        const { data: cursos, error: coursesError } = await supabase
            .from('cursos')
            .select('*');
        if (coursesError)
            throw coursesError;
        // Extract unique professor names
        professores.value = [...new Set(cursos.map(curso => curso.professor_responsavel))];
        if (coursesError)
            throw coursesError;
        const hoje = new Date();
        cursosAtivos.value = cursos.filter(curso => new Date(curso.data_fim) > hoje).length;
        cursosConcluidos.value = cursos.filter(curso => new Date(curso.data_fim) <= hoje).length;
        // Get enrollments data
        const { data: matriculas, error: enrollmentsError } = await supabase
            .from('matriculas')
            .select('*, curso:cursos(*)');
        if (enrollmentsError)
            throw enrollmentsError;
        const currentMonth = hoje.getMonth();
        const currentYear = hoje.getFullYear();
        matriculasMes.value = matriculas.filter(matricula => {
            const dataMatricula = new Date(matricula.data_matricula);
            return dataMatricula.getMonth() === currentMonth &&
                dataMatricula.getFullYear() === currentYear;
        }).length;
        matriculasTotal.value = matriculas.filter(matricula => matricula.status === 'ativo').length;
        matriculasPorCurso.value = matriculas.reduce((acc, matricula) => {
            if (matricula.curso) {
                const cursoNome = matricula.curso.nome;
                acc[cursoNome] = (acc[cursoNome] || 0) + 1;
            }
            return acc;
        }, {});
    }
    catch (err) {
        console.error('Error loading statistics:', err);
        error.value = 'Erro ao carregar estatísticas';
    }
};
const atualizarDados = async () => {
    await carregarEstatisticas();
};
const toggleCursosDetails = () => {
    showCursosDetails.value = !showCursosDetails.value;
};
const carregarCursos = async () => {
    try {
        const { data, error } = await supabase
            .from('cursos')
            .select('*')
            .order('data_inicio', { ascending: false });
        if (error)
            throw error;
        cursos.value = data;
        atualizarContadores();
    }
    catch (error) {
        console.error('Erro ao carregar cursos:', error);
    }
};
const atualizarContadores = () => {
    totalCursos.value = cursos.value.length;
    cursosEmAndamento.value = cursos.value.filter(c => c.status === 'Em andamento').length;
    cursosConcluidos.value = cursos.value.filter(c => c.status === 'Finalizado').length;
    cursosCancelados.value = cursos.value.filter(c => c.status === 'Cancelado').length;
};
const cursosFiltrados = computed(() => {
    return cursos.value.filter(curso => {
        const matchStatus = !cursosFilters.value.status ||
            curso.status === cursosFilters.value.status;
        const matchDates = checkDateRange(curso.data_inicio, cursosFilters.value.dataInicio, cursosFilters.value.dataFim);
        return matchStatus && matchDates;
    });
});
const formatDate = (date) => {
    if (!date)
        return '--';
    return new Date(date).toLocaleDateString('pt-BR');
};
onMounted(() => {
    carregarEstatisticas();
    carregarCursos();
    loadUserData();
});
const exportarPDF = () => {
    // Implement PDF export logic here
    console.log('Exportando PDF...');
};
const exportarExcel = () => {
    // Implement Excel export logic here
    console.log('Exportando Excel...');
};
const filtrarCursos = () => {
    // The filtering is already handled by the computed property cursosFiltrados
    // This function is just a handler for the @change event
    console.log('Filtros atualizados');
};
const aplicarFiltros = async () => {
    try {
        loading.value = true;
        error.value = null;
        let query = supabase
            .from('cursos')
            .select(`
        *,
        matriculas (
          id,
          status,
          data_matricula,
          usuario:usuarios(
            id,
            nome,
            status
          )
        )
      `);
        // Aplicar filtros
        if (filtros.value.statusCurso) {
            query = query.eq('status', filtros.value.statusCurso);
        }
        if (filtros.value.dataInicio) {
            query = query.gte('data_inicio', filtros.value.dataInicio);
        }
        if (filtros.value.dataFim) {
            query = query.lte('data_inicio', filtros.value.dataFim);
        }
        if (filtros.value.professor) {
            query = query.eq('professor_responsavel', filtros.value.professor);
        }
        const { data, error: queryError } = await query;
        if (queryError)
            throw queryError;
        cursos.value = data;
        atualizarContadores();
        atualizarEstatisticas();
    }
    catch (err) {
        console.error('Erro ao aplicar filtros:', err);
        error.value = 'Erro ao filtrar dados';
    }
    finally {
        loading.value = false;
    }
};
// Adicione watchers para filtros automáticos
watch(() => filtros.value, async (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        await aplicarFiltros();
    }
}, { deep: true });
function checkDateRange(data_inicio, dataInicio, dataFim) {
    // If no dates are specified, return true
    if (!dataInicio && !dataFim)
        return true;
    const cursoDate = new Date(data_inicio);
    // Check start date if specified
    if (dataInicio && cursoDate < new Date(dataInicio)) {
        return false;
    }
    // Check end date if specified
    if (dataFim && cursoDate > new Date(dataFim)) {
        return false;
    }
    // Update/add type annotations
    const cursos = ref([]);
    const cursosFilters = ref({
        dataInicio: '',
        dataFim: '',
        status: ''
    });
    const matriculasPorCurso = ref({});
    const error = ref(null);
    const formatDate = (date) => {
        if (!date)
            return '--';
        return new Date(date).toLocaleDateString('pt-BR');
    };
    return true;
}
function atualizarEstatisticas() {
    // Update statistics based on filtered courses
    cursosEmAndamento.value = cursos.value.filter(c => c.status === 'Em andamento').length;
    cursosConcluidos.value = cursos.value.filter(c => c.status === 'Finalizado').length;
    cursosCancelados.value = cursos.value.filter(c => c.status === 'Cancelado').length;
    totalCursos.value = cursos.value.length;
    // Update matriculas statistics
    const matriculasFiltered = cursos.value.flatMap(curso => curso.matriculas?.filter(m => m.status === 'ativo') ?? []);
    matriculasTotal.value = matriculasFiltered.length;
    // Update alunos statistics
    const alunosSet = new Set(matriculasFiltered.map(m => m.usuario?.id));
    alunosAtivos.value = [...alunosSet].length;
    alunosCursando.value = matriculasFiltered.filter(m => m.usuario?.status === 'cursando').length;
}
const userData = ref({
    nome: '',
    email: ''
});
// Função para carregar dados do usuário
const loadUserData = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error)
                throw error;
            userData.value = profile;
        }
    }
    catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
}; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['refresh-btn', 'dashboard-header', 'stat-card', 'stat-info', 'stat-trend', 'stats-grid', 'date-range', 'dashboard', 'dashboard-header', 'stats-grid', 'cursos-grid', 'stat-card', 'stat-icon', 'stat-number', 'chart-container', 'dashboard-header', 'refresh-btn', 'stat-card', 'stat-icon', 'curso-header', 'dashboard', 'dashboard-header', 'stats-grid', 'stat-card', 'stat-number', 'stat-card', 'stat-card', 'expandable', 'filter-group', 'date-range', 'status-badge', 'status-badge', 'status-badge', 'curso-info', 'export-actions', 'btn-export', 'btn-export', 'filters-row', 'filter-group', 'filter-group', 'filter-group', 'filter-group', 'date-range', 'date-range', 'cursos-grid', 'curso-card', 'curso-card', 'curso-header', 'curso-header', 'curso-info', 'curso-stats', 'status-badge', 'status-badge', 'em-andamento', 'status-badge', 'status-badge', 'curso-content', 'info-item', 'curso-stats', 'stat-item', 'filters-row', 'filter-group', 'filter-group', 'date-range', 'filters-row', 'date-range', 'date-separator',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("dashboard") },
    });
    if (__VLS_ctx.error) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("toast-error") },
        });
        (__VLS_ctx.error);
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.error)))
                        return;
                    __VLS_ctx.error = null;
                } },
            ...{ class: ("close-btn") },
        });
    }
    else if (__VLS_ctx.loading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("loading") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: ("dashboard-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.atualizarDados) },
        ...{ class: ("refresh-btn") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/cursando.svg"),
        alt: ("Atualizar"),
        ...{ class: ("icon-black") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filters-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: ("filters-title") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filters-row") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("date-range") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("date-input") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("date-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: ("date"),
        max: ((__VLS_ctx.filtros.dataFim || undefined)),
    });
    (__VLS_ctx.filtros.dataInicio);
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("date-separator") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("date-input") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("date-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: ("date"),
        min: ((__VLS_ctx.filtros.dataInicio || undefined)),
    });
    (__VLS_ctx.filtros.dataFim);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("select-wrapper") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.filtros.statusCurso)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: ("Em andamento"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: ("Finalizado"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: ("Cancelado"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("select-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("select-wrapper") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.filtros.statusAluno)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: ("ativo"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: ("cursando"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: ("inativo"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("select-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("select-wrapper") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.filtros.professor)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [prof] of __VLS_getVForSourceType((__VLS_ctx.professores))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((prof)),
            value: ((prof)),
        });
        (prof);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("select-icon") },
    });
    if (__VLS_ctx.loading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filters-loading") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("loading-spinner") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stats-grid") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-info") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("stat-number") },
    });
    (__VLS_ctx.totalUsuarios);
    __VLS_elementAsFunction(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({
        ...{ class: ("stat-trend") },
        ...{ class: (({ positive: __VLS_ctx.usuariosTendencia > 0 })) },
    });
    (__VLS_ctx.usuariosTendencia);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-info") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("stat-number") },
    });
    (__VLS_ctx.matriculasMes);
    __VLS_elementAsFunction(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (__VLS_ctx.matriculasTotal);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-info") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("stat-number") },
    });
    (__VLS_ctx.alunosAtivos);
    __VLS_elementAsFunction(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (__VLS_ctx.alunosCursando);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card expandable") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-info") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("stat-number") },
    });
    (__VLS_ctx.totalCursos);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-details") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("status-badge em-andamento") },
    });
    (__VLS_ctx.cursosEmAndamento);
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("status-badge finalizados") },
    });
    (__VLS_ctx.cursosConcluidos);
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("status-badge cancelados") },
    });
    (__VLS_ctx.cursosCancelados);
    if (__VLS_ctx.showCursosDetails) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("stat-expanded") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filters-section") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("date-range") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            ...{ onChange: (__VLS_ctx.filtrarCursos) },
            type: ("date"),
        });
        (__VLS_ctx.cursosFilters.dataInicio);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            ...{ onChange: (__VLS_ctx.filtrarCursos) },
            type: ("date"),
        });
        (__VLS_ctx.cursosFilters.dataFim);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("filter-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            ...{ onChange: (__VLS_ctx.filtrarCursos) },
            value: ((__VLS_ctx.cursosFilters.status)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("Em andamento"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("Finalizado"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("Cancelado"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("cursos-list") },
        });
        for (const [curso] of __VLS_getVForSourceType((__VLS_ctx.cursosFiltrados))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: ((curso.id)),
                ...{ class: ("curso-item") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            (curso.nome);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("curso-info") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (curso.professor_responsavel);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.formatDate(curso.data_inicio));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: (('status-' + curso.status.toLowerCase())) },
            });
            (curso.status);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("export-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.exportarPDF) },
            ...{ class: ("btn-export") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/pdf.svg"),
            alt: ("PDF"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.exportarExcel) },
            ...{ class: ("btn-export") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/excel.svg"),
            alt: ("Excel"),
            ...{ class: ("icon") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("chart-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: ("chart-title") },
    });
    // @ts-ignore
    /** @type { [typeof DashboardChart, ] } */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(DashboardChart, new DashboardChart({
        matriculasPorCurso: ((__VLS_ctx.matriculasPorCurso)),
    }));
    const __VLS_1 = __VLS_0({
        matriculasPorCurso: ((__VLS_ctx.matriculasPorCurso)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    if (__VLS_ctx.userData) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("user-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.userData.nome ? __VLS_ctx.sanitizeHTML(__VLS_ctx.userData.nome) : 'Usuário');
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.userData.email ? __VLS_ctx.sanitizeHTML(__VLS_ctx.userData.email) : 'Email não disponível');
    }
    ['dashboard', 'toast-error', 'close-btn', 'loading', 'dashboard-header', 'refresh-btn', 'icon-black', 'filters-container', 'filters-title', 'filters-row', 'filter-group', 'date-range', 'date-input', 'date-icon', 'date-separator', 'date-input', 'date-icon', 'filter-group', 'select-wrapper', 'select-icon', 'filter-group', 'select-wrapper', 'select-icon', 'filter-group', 'select-wrapper', 'select-icon', 'filters-loading', 'loading-spinner', 'stats-grid', 'stat-card', 'stat-icon', 'stat-info', 'stat-number', 'stat-trend', 'positive', 'stat-card', 'stat-icon', 'stat-info', 'stat-number', 'stat-card', 'stat-icon', 'stat-info', 'stat-number', 'stat-card', 'expandable', 'stat-header', 'stat-icon', 'stat-info', 'stat-number', 'stat-details', 'status-badge', 'em-andamento', 'status-badge', 'finalizados', 'status-badge', 'cancelados', 'stat-expanded', 'filters-section', 'filter-group', 'date-range', 'filter-group', 'cursos-list', 'curso-item', 'curso-info', 'export-actions', 'btn-export', 'icon', 'btn-export', 'icon', 'chart-container', 'chart-title', 'user-info',];
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
            DashboardChart: DashboardChart,
            sanitizeHTML: sanitizeHTML,
            totalUsuarios: totalUsuarios,
            matriculasMes: matriculasMes,
            matriculasPorCurso: matriculasPorCurso,
            professores: professores,
            usuariosTendencia: usuariosTendencia,
            cursosConcluidos: cursosConcluidos,
            matriculasTotal: matriculasTotal,
            alunosAtivos: alunosAtivos,
            alunosCursando: alunosCursando,
            loading: loading,
            error: error,
            filtros: filtros,
            showCursosDetails: showCursosDetails,
            cursosFilters: cursosFilters,
            totalCursos: totalCursos,
            cursosEmAndamento: cursosEmAndamento,
            cursosCancelados: cursosCancelados,
            atualizarDados: atualizarDados,
            cursosFiltrados: cursosFiltrados,
            formatDate: formatDate,
            exportarPDF: exportarPDF,
            exportarExcel: exportarExcel,
            filtrarCursos: filtrarCursos,
            userData: userData,
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
