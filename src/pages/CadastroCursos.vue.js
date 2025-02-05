/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { supabase } from '../config/supabase';
import { useRouter, useRoute } from 'vue-router';
import { sanitizeHTML } from '@/utils/sanitize';
const router = useRouter();
const route = useRoute();
const formData = ref({
    nome: '',
    descricao: '',
    duracao_horas: 0,
    data_inicio: '',
    professor_responsavel: '',
    status: 'Em andamento',
    modulos: []
});
const errors = ref({});
const isEditing = ref(false);
const validateForm = () => {
    errors.value = {};
    if (!formData.value.nome)
        errors.value.nome = 'Nome é obrigatório';
    if (!formData.value.duracao_horas)
        errors.value.duracao_horas = 'Carga horária é obrigatória';
    if (!formData.value.data_inicio)
        errors.value.data_inicio = 'Data de início é obrigatória';
    if (!formData.value.professor_responsavel)
        errors.value.professor_responsavel = 'Professor responsável é obrigatório';
    if (!formData.value.descricao)
        errors.value.descricao = 'Descrição é obrigatória';
    return Object.keys(errors.value).length === 0;
};
const handleSubmit = async () => {
    if (validateForm()) {
        try {
            if (isEditing.value) {
                // Update existing course
                const { error: updateError } = await supabase
                    .from('cursos')
                    .update({
                    nome: formData.value.nome,
                    descricao: formData.value.descricao,
                    duracao_horas: formData.value.duracao_horas,
                    data_inicio: formData.value.data_inicio,
                    professor_responsavel: formData.value.professor_responsavel,
                    status: formData.value.status
                })
                    .eq('id', route.params.id);
                if (updateError)
                    throw updateError;
                // Update modules
                for (const modulo of formData.value.modulos) {
                    if (modulo.id) {
                        // Update existing module
                        await supabase
                            .from('modulos')
                            .update({
                            nome: modulo.nome,
                            carga_horaria: modulo.carga_horaria
                        })
                            .eq('id', modulo.id);
                    }
                    else {
                        // Insert new module
                        await supabase
                            .from('modulos')
                            .insert({
                            curso_id: route.params.id,
                            nome: modulo.nome,
                            carga_horaria: modulo.carga_horaria
                        });
                    }
                }
            }
            else {
                // Insert new course
                const { data: newCourse, error: insertError } = await supabase
                    .from('cursos')
                    .insert([{
                        nome: formData.value.nome,
                        descricao: formData.value.descricao,
                        duracao_horas: formData.value.duracao_horas,
                        data_inicio: formData.value.data_inicio,
                        professor_responsavel: formData.value.professor_responsavel,
                        status: 'Em andamento'
                    }])
                    .select()
                    .single();
                if (insertError)
                    throw insertError;
                // Insert modules
                if (formData.value.modulos.length > 0) {
                    await supabase
                        .from('modulos')
                        .insert(formData.value.modulos.map(modulo => ({
                        curso_id: newCourse.id,
                        nome: modulo.nome,
                        carga_horaria: modulo.carga_horaria
                    })));
                }
            }
            router.push('/lista-cursos');
        }
        catch (err) {
            console.error('Error saving course:', err);
            alert('Erro ao salvar curso');
        }
    }
};
const loadCurso = async (id) => {
    try {
        const { data, error } = await supabase
            .from('cursos')
            .select(`
        *,
        modulos (
          id,
          nome,
          carga_horaria
        )
      `)
            .eq('id', id)
            .single();
        if (error)
            throw error;
        formData.value = {
            ...data,
            data_inicio: data.data_inicio?.split('T')[0],
            modulos: data.modulos || []
        };
    }
    catch (err) {
        console.error('Error loading course:', err);
        alert('Erro ao carregar curso');
    }
};
const adicionarModulo = () => {
    formData.value.modulos.push({
        nome: '',
        carga_horaria: 0
    });
};
const removerModulo = (index) => {
    formData.value.modulos.splice(index, 1);
};
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
onMounted(() => {
    isEditing.value = !!route.query.edit;
    if (isEditing.value && route.params.id) {
        loadCurso(route.params.id);
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['cadastro-header', 'form-group', 'error', 'error', 'modulos-section', 'modulo-header', 'btn-add-modulo', 'btn-remove', 'btn-cancelar', 'btn-salvar', 'btn-cancelar', 'btn-salvar', 'btn-add-modulo', 'btn-remove', 'btn-cancelar', 'btn-salvar', 'btn-cancelar', 'btn-salvar', 'cadastro-container', 'form-grid', 'modulo-form', 'form-actions', 'btn-cancelar', 'btn-salvar',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("cadastro-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("cadastro-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: ("cadastro-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.isEditing ? 'Editar Curso' : 'Novo Curso');
    __VLS_elementAsFunction(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.handleSubmit) },
        ...{ class: ("cadastro-form") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-grid") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("text"),
        value: ((__VLS_ctx.formData.nome)),
        ...{ class: (({ error: __VLS_ctx.errors.nome })) },
        placeholder: ("Digite o nome do curso"),
    });
    if (__VLS_ctx.errors.nome) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.nome);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("number"),
        ...{ class: (({ error: __VLS_ctx.errors.duracao_horas })) },
        min: ("1"),
    });
    (__VLS_ctx.formData.duracao_horas);
    if (__VLS_ctx.errors.duracao_horas) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.duracao_horas);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("date"),
        ...{ class: (({ error: __VLS_ctx.errors.data_inicio })) },
    });
    (__VLS_ctx.formData.data_inicio);
    if (__VLS_ctx.errors.data_inicio) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.data_inicio);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("text"),
        value: ((__VLS_ctx.formData.professor_responsavel)),
        ...{ class: (({ error: __VLS_ctx.errors.professor_responsavel })) },
        placeholder: ("Nome do professor responsável"),
    });
    if (__VLS_ctx.errors.professor_responsavel) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.professor_responsavel);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group full-width") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        value: ((__VLS_ctx.formData.descricao)),
        ...{ class: (({ error: __VLS_ctx.errors.descricao })) },
        rows: ("3"),
        placeholder: ("Descreva o curso"),
    });
    if (__VLS_ctx.errors.descricao) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.descricao);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("modulos-section") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    for (const [modulo, index] of __VLS_getVForSourceType((__VLS_ctx.formData.modulos))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((index)),
            ...{ class: ("modulo-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modulo-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (index + 1);
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.removerModulo(index);
                } },
            type: ("button"),
            ...{ class: ("btn-remove") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/lixeira.svg"),
            alt: ("Info"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modulo-form") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("text"),
            value: ((modulo.nome)),
            placeholder: ("Nome do módulo"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("number"),
            placeholder: ("Carga horária"),
            min: ("1"),
        });
        (modulo.carga_horaria);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.adicionarModulo) },
        type: ("button"),
        ...{ class: ("btn-add-modulo") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/adicao.svg"),
        alt: ("Info"),
        ...{ class: ("icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-actions") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/lista-cursos');
            } },
        type: ("button"),
        ...{ class: ("btn-cancelar") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/fechar.svg"),
        alt: ("Dashboard"),
        ...{ class: ("icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        type: ("submit"),
        ...{ class: ("btn-salvar") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/save-fill.svg"),
        alt: ("Salvar"),
        ...{ class: ("icon") },
    });
    (__VLS_ctx.isEditing ? 'Atualizar' : 'Salvar');
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("curso-info") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.sanitizeHTML(__VLS_ctx.formData.nome));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.sanitizeHTML(__VLS_ctx.formData.descricao));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.sanitizeHTML(__VLS_ctx.formData.professor_responsavel));
    ['cadastro-container', 'cadastro-card', 'cadastro-header', 'cadastro-form', 'form-grid', 'form-group', 'error', 'error-message', 'form-group', 'error', 'error-message', 'form-group', 'error', 'error-message', 'form-group', 'error', 'error-message', 'form-group', 'full-width', 'error', 'error-message', 'modulos-section', 'modulo-item', 'modulo-header', 'btn-remove', 'icon', 'modulo-form', 'btn-add-modulo', 'icon', 'form-actions', 'btn-cancelar', 'icon', 'btn-salvar', 'icon', 'curso-info',];
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
            sanitizeHTML: sanitizeHTML,
            formData: formData,
            errors: errors,
            isEditing: isEditing,
            handleSubmit: handleSubmit,
            adicionarModulo: adicionarModulo,
            removerModulo: removerModulo,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
