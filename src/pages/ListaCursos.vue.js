/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../config/supabase';
import { useRouter } from 'vue-router';
import { sanitizeHTML } from '@/utils/sanitize';
export default (await import('vue')).defineComponent({
    name: 'ListaCursos',
    setup() {
        const cursos = ref([]);
        const loading = ref(false);
        const error = ref(null);
        const searchTerm = ref('');
        const statusFilter = ref('');
        const router = useRouter();
        // Load courses from Supabase
        const loadCursos = async () => {
            try {
                loading.value = true;
                const { data, error: supabaseError } = await supabase
                    .from('cursos')
                    .select(`
            *,
            modulos (
              id,
              nome,
              carga_horaria
            ),
            matriculas (
              id,
              status
            )
          `)
                    .order('created_at', { ascending: false });
                if (supabaseError)
                    throw supabaseError;
                cursos.value = data;
            }
            catch (err) {
                console.error('Error loading courses:', err);
                error.value = 'Erro ao carregar cursos';
            }
            finally {
                loading.value = false;
            }
        };
        // Toggle course status
        const toggleStatus = async (curso, newStatus) => {
            try {
                // Only send the status field for update
                const { error: updateError } = await supabase
                    .from('cursos')
                    .update({ status: newStatus })
                    .eq('id', curso.id);
                if (updateError)
                    throw updateError;
                // Reload courses after successful update
                await loadCursos();
            }
            catch (err) {
                console.error('Error updating course status:', err);
                alert('Erro ao atualizar status do treinamento');
            }
        };
        // Delete course
        const deletarCurso = async (id) => {
            if (confirm('ATENÇÃO: Esta ação excluirá permanentemente o curso. Esta ação não pode ser desfeita. Você tem certeza que deseja continuar?')) {
                try {
                    const { error: deleteError } = await supabase
                        .from('cursos')
                        .delete()
                        .eq('id', id);
                    if (deleteError)
                        throw deleteError;
                    await loadCursos();
                    alert('Curso excluído com sucesso');
                }
                catch (err) {
                    console.error('Error deleting course:', err);
                    alert('Erro ao excluir curso');
                }
            }
        };
        // Edit course
        const editarCurso = (curso) => {
            router.push({
                name: 'CadastroCursos', // Use o name em vez do path
                params: { id: curso.id },
                query: { edit: 'true' }
            });
        };
        // Format date helper
        const formatDate = (date) => {
            if (!date)
                return '--';
            try {
                return date.split('T')[0].split('-').reverse().join('/');
            }
            catch (error) {
                console.error('Erro ao formatar data:', error);
                return '--';
            }
        };
        // Computed property for filtered courses
        const cursosFiltrados = computed(() => {
            return cursos.value.filter(curso => {
                const matchSearch = !searchTerm.value ||
                    curso.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                    curso.descricao?.toLowerCase().includes(searchTerm.value.toLowerCase());
                const matchStatus = !statusFilter.value || curso.status === statusFilter.value;
                return matchSearch && matchStatus;
            });
        });
        // Load courses on component mount
        onMounted(() => {
            loadCursos();
        });
        return {
            cursos,
            cursosFiltrados,
            loading,
            error,
            searchTerm,
            statusFilter,
            loadCursos,
            toggleStatus,
            deletarCurso,
            editarCurso,
            formatDate,
            sanitizeHTML
        };
    }
}); /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['cursos-header', 'btn-novo', 'search-bar', 'search-bar', 'search-bar', 'search-bar', 'curso-card', 'curso-header', 'btn-edit', 'btn-delete', 'btn-edit', 'btn-delete', 'info-item', 'modulos-section', 'modulos-section', 'modulos-section', 'status-btn', 'status-btn', 'status-btn', 'active', 'status-btn', 'active', 'status-btn', 'active', 'status-cancelado', 'status-Em_andamento', 'status-Finalizado', 'status-Cancelado', 'cursos-container', 'search-bar', 'info-grid', 'btn-edit', 'btn-delete', 'btn-edit', 'btn-delete', 'btn-edit', 'btn-delete', 'status-badge', 'status-badge', 'certificado-card', 'status-badge', 'certificado-card', 'status-badge', 'actions', 'btn-edit', 'btn-delete', 'btn-edit', 'btn-delete', 'btn-download', 'btn-view', 'btn-emit', 'btn-edit', 'btn-delete', 'btn-download', 'btn-view', 'btn-emit', 'certificado-body', 'info-grid', 'cursos-grid', 'info-item', 'label', 'info-item',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("cursos-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: ("cursos-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/cursos');
            } },
        ...{ class: ("btn-novo") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/adicao.svg"),
        alt: ("Novo"),
        ...{ class: ("icon-black") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("search-bar") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: ("text"),
        value: ((__VLS_ctx.searchTerm)),
        placeholder: ("Buscar por nome ou descrição..."),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.statusFilter)),
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
        ...{ class: ("cursos-grid") },
    });
    for (const [curso] of __VLS_getVForSourceType((__VLS_ctx.cursosFiltrados))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((curso.id)),
            ...{ class: ("curso-card") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("curso-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.sanitizeHTML(curso.nome));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.editarCurso(curso);
                } },
            ...{ class: ("btn-edit") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/edicao.svg"),
            alt: ("Editar"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.deletarCurso(curso.id);
                } },
            ...{ class: ("btn-delete") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/lixeira.svg"),
            alt: ("Excluir"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("curso-body") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.sanitizeHTML(curso.descricao));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-grid") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (('status-' + curso.status.replace(' ', '_'))) },
        });
        (curso.status);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (curso.professor_responsavel);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (curso.duracao_horas);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDate(curso.data_inicio));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("card-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("status-toggle") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toggleStatus(curso, 'Em andamento');
                } },
            ...{ class: ((['status-btn', { active: curso.status === 'Em andamento' }])) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/cursando.svg"),
            alt: ("Em Andamento"),
            ...{ class: ("icon-black") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toggleStatus(curso, 'Finalizado');
                } },
            ...{ class: ((['status-btn', { active: curso.status === 'Finalizado' }])) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/check.svg"),
            alt: ("Finalizado"),
            ...{ class: ("icon-black") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toggleStatus(curso, 'Cancelado');
                } },
            ...{ class: ((['status-btn', { active: curso.status === 'Cancelado' }])) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/fechar.svg"),
            alt: ("Cancelado"),
            ...{ class: ("icon-black") },
        });
    }
    ['cursos-container', 'cursos-header', 'btn-novo', 'icon-black', 'search-bar', 'cursos-grid', 'curso-card', 'curso-header', 'actions', 'btn-edit', 'icon', 'btn-delete', 'icon', 'curso-body', 'info-grid', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'card-actions', 'status-toggle', 'active', 'status-btn', 'icon-black', 'active', 'status-btn', 'icon-black', 'active', 'status-btn', 'icon-black',];
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
