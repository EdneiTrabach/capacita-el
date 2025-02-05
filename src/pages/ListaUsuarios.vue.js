/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../config/supabase';
import { sanitizeHTML } from '@/utils/sanitize';
const router = useRouter();
const usuarios = ref([]);
const setores = ref([]);
const searchTerm = ref('');
const setorFilter = ref('');
const loading = ref(false);
const error = ref(null);
const statusFilter = ref('');
const sortBy = ref('recent');
const showEditModal = ref(false);
const municipios = ref([]);
const toast = ref({
    show: false,
    message: '',
    type: 'success'
});
const editingUser = ref({
    id: null,
    nome: '',
    email: '',
    data_nascimento: '',
    telefone: '',
    cidade: '',
    estado: '',
    setor: ''
});
// Computed properties
const setoresUnicos = computed(() => {
    return [...new Set(usuarios.value.map(u => u.setor))].filter(Boolean);
});
const usuariosFiltrados = computed(() => {
    let filtered = usuarios.value.filter(usuario => {
        const matchSearch = !searchTerm.value ||
            usuario.nome?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            usuario.email?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            usuario.setor?.toLowerCase().includes(searchTerm.value.toLowerCase());
        const matchSetor = !setorFilter.value || usuario.setor === setorFilter.value;
        const matchStatus = !statusFilter.value || usuario.status === statusFilter.value;
        return matchSearch && matchSetor && matchStatus;
    });
    // Apply sorting
    switch (sortBy.value) {
        case 'recent':
            return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        case 'oldest':
            return filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        case 'alpha':
            return filtered.sort((a, b) => a.nome.localeCompare(b.nome));
        default:
            return filtered;
    }
});
// Methods
const loadUsuarios = async () => {
    try {
        loading.value = true;
        const { data: users, error: err } = await supabase
            .from('usuarios')
            .select('*')
            .order('created_at', { ascending: false });
        if (err)
            throw err;
        usuarios.value = users.map(user => ({
            ...user,
            status: user.status || 'ativo'
        }));
    }
    catch (err) {
        console.error('Erro ao carregar usuários:', err);
        error.value = 'Erro ao carregar usuários';
    }
    finally {
        loading.value = false;
    }
};
const loadSetores = async () => {
    try {
        const { data: setoresList, error } = await supabase
            .from('setores')
            .select('*')
            .order('nome');
        if (error)
            throw error;
        setores.value = setoresList;
    }
    catch (error) {
        console.error('Erro ao carregar setores:', error);
        showToast('Erro ao carregar setores', 'error');
    }
};
const showToast = (message, type = 'success') => {
    toast.value = {
        show: true,
        message,
        type
    };
    setTimeout(() => {
        toast.value.show = false;
    }, 3000);
};
const formatDate = (date) => {
    if (!date)
        return '--';
    try {
        const [year, month, day] = date.split('-');
        return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
    }
    catch (error) {
        console.error('Erro ao formatar data:', error);
        return '--';
    }
};
const getInitials = (name) => {
    return name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || '??';
};
const toggleStatus = async (usuario, status) => {
    if (usuario.status !== status) {
        try {
            const { error } = await supabase
                .from('usuarios')
                .update({ status })
                .eq('id', usuario.id);
            if (error)
                throw error;
            // Update local state
            const index = usuarios.value.findIndex(u => u.id === usuario.id);
            if (index !== -1) {
                usuarios.value[index] = { ...usuarios.value[index], status };
            }
        }
        catch (error) {
            console.error('Erro ao atualizar status:', error);
            showToast('Erro ao atualizar status do usuário', 'error');
        }
    }
};
// Função de atualização de status
const atualizarStatusUsuario = async (id, status) => {
    try {
        const { error } = await supabase
            .from('usuarios')
            .update({ status })
            .eq('id', id);
        if (error)
            throw error;
        const index = usuarios.value.findIndex(u => u.id === id);
        if (index !== -1) {
            usuarios.value[index] = { ...usuarios.value[index], status };
            showToast(`Status do usuário atualizado para ${status}`, 'success');
        }
    }
    catch (error) {
        console.error('Erro ao atualizar status:', error);
        showToast('Não foi possível atualizar o status do usuário. Tente novamente.', 'error');
    }
};
// Função de exclusão
const deletarUsuario = async (id) => {
    const usuario = usuarios.value.find(u => u.id === id);
    if (!usuario)
        return;
    if (confirm(`Deseja realmente excluir o usuário ${usuario.nome}?\nEsta ação não poderá ser desfeita.`)) {
        try {
            const { error } = await supabase
                .from('usuarios')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
            usuarios.value = usuarios.value.filter(u => u.id !== id);
            showToast('Usuário excluído com sucesso!', 'success');
        }
        catch (error) {
            console.error('Erro ao excluir usuário:', error);
            showToast('Não foi possível excluir o usuário. Tente novamente.', 'error');
        }
    }
};
const editarUsuario = async (usuario) => {
    try {
        editingUser.value = { ...usuario };
        showEditModal.value = true;
    }
    catch (error) {
        console.error('Erro ao preparar edição:', error);
        showToast('Erro ao abrir formulário de edição', 'error');
    }
};
const handleEditSubmit = async () => {
    try {
        const { error } = await supabase
            .from('usuarios')
            .update({
            nome: editingUser.value.nome,
            email: editingUser.value.email,
            data_nascimento: editingUser.value.data_nascimento,
            telefone: editingUser.value.telefone,
            cidade: editingUser.value.cidade,
            estado: editingUser.value.estado,
            setor: editingUser.value.setor,
            updated_at: new Date().toISOString()
        })
            .eq('id', editingUser.value.id);
        if (error)
            throw error;
        // Atualiza o usuário na lista local
        const index = usuarios.value.findIndex(u => u.id === editingUser.value.id);
        if (index !== -1) {
            usuarios.value[index] = { ...usuarios.value[index], ...editingUser.value };
        }
        showEditModal.value = false;
        showToast('Usuário atualizado com sucesso', 'success');
    }
    catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        showToast('Erro ao atualizar usuário', 'error');
    }
};
const closeEditModal = () => {
    showEditModal.value = false;
    editingUser.value = {
        id: null,
        nome: '',
        email: '',
        data_nascimento: '',
        telefone: '',
        cidade: '',
        estado: '',
        setor: ''
    };
};
// Lifecycle hooks
onMounted(async () => {
    try {
        await Promise.all([
            loadUsuarios(),
            loadSetores()
        ]);
    }
    catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados', 'error');
    }
});
// Expose necessary functions and variables to template
const utils = {
    formatDate,
    getInitials,
    sanitizeHTML,
    toggleStatus,
    showToast
};
const __VLS_exposed = {
    deletarUsuario,
    editarUsuario,
    handleEditSubmit,
    closeEditModal
};
defineExpose({
    deletarUsuario,
    editarUsuario,
    handleEditSubmit,
    closeEditModal
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['usuarios-header', 'btn-novo', 'search-bar', 'search-bar', 'search-bar', 'search-bar', 'search-bar', 'search-bar', 'usuario-card', 'usuario-body', 'info-item', 'info-item', 'btn-edit', 'btn-delete', 'btn-edit', 'btn-delete', 'status-btn', 'status-btn', 'status-btn', 'active', 'status-btn', 'active', 'status-btn', 'active', 'info-grid', 'status-toggle', 'status-btn', 'usuarios-container', 'usuarios-header', 'search-bar', 'search-bar', 'search-bar', 'usuarios-grid', 'certificados-header', 'btn-novo', 'btn-novo', 'search-bar', 'search-bar', 'search-bar', 'search-bar', 'search-bar', 'certificado-card', 'certificado-card', 'status-badge', 'certificado-card', 'status-badge', 'certificado-card', 'status-badge', 'btn-edit', 'btn-delete', 'btn-edit', 'btn-delete', 'btn-download', 'btn-view', 'btn-emit', 'btn-edit', 'btn-delete', 'btn-download', 'btn-view', 'btn-emit', 'toast', 'toast', 'certificados-container', 'certificados-header', 'search-bar', 'search-bar', 'search-bar', 'certificados-grid', 'modal-content', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'btn-cancelar', 'btn-salvar', 'btn-cancelar', 'btn-salvar', 'btn-cancelar', 'btn-salvar', 'modal-content', 'edit-form', 'form-grid', 'modal-actions', 'btn-cancelar', 'btn-salvar',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("usuarios-container") },
    });
    if (__VLS_ctx.toast.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ((['toast', __VLS_ctx.toast.type])) },
        });
        (__VLS_ctx.toast.message);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: ("usuarios-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/usuarios');
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
        placeholder: ("Buscar por nome, email ou setor..."),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.setorFilter)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [setor] of __VLS_getVForSourceType((__VLS_ctx.setoresUnicos))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((setor)),
            value: ((setor)),
        });
        (setor);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.statusFilter)),
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.sortBy)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: ("recent"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: ("oldest"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: ("alpha"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("usuarios-grid") },
    });
    for (const [usuario] of __VLS_getVForSourceType((__VLS_ctx.usuariosFiltrados))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((usuario.id)),
            ...{ class: ("usuario-card") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("usuario-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("usuario-avatar") },
        });
        (__VLS_ctx.getInitials(usuario.nome));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.editarUsuario(usuario);
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
                    __VLS_ctx.deletarUsuario(usuario.id);
                } },
            ...{ class: ("btn-delete") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/lixeira.svg"),
            alt: ("Excluir"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("usuario-body") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.sanitizeHTML(usuario.nome));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-grid") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.sanitizeHTML(usuario.email));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (usuario.telefone);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (usuario.setor);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (usuario.cidade);
        (usuario.estado);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDate(usuario.data_nascimento));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (('status-' + usuario.status)) },
        });
        (usuario.status);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("card-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("status-toggle") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toggleStatus(usuario, 'ativo');
                } },
            ...{ class: ((['status-btn', { active: usuario.status === 'ativo' }])) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/check.svg"),
            alt: ("Ativo"),
            ...{ class: ("icon-black") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toggleStatus(usuario, 'cursando');
                } },
            ...{ class: ((['status-btn', { active: usuario.status === 'cursando' }])) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/cursando.svg"),
            alt: ("Cursando"),
            ...{ class: ("icon-black") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toggleStatus(usuario, 'inativo');
                } },
            ...{ class: ((['status-btn', { active: usuario.status === 'inativo' }])) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/fechar.svg"),
            alt: ("Editar"),
            ...{ class: ("icon-black") },
        });
    }
    if (__VLS_ctx.showEditModal) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-overlay") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
            ...{ onSubmit: (__VLS_ctx.handleEditSubmit) },
            ...{ class: ("edit-form") },
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
            value: ((__VLS_ctx.editingUser.nome)),
            placeholder: ("Digite o nome completo"),
            required: (true),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("email"),
            placeholder: ("Digite o email"),
        });
        (__VLS_ctx.editingUser.email);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("date"),
        });
        (__VLS_ctx.editingUser.data_nascimento);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("tel"),
            placeholder: ("(00) 00000-0000"),
        });
        (__VLS_ctx.editingUser.telefone);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            ...{ onChange: (...[$event]) => {
                    if (!((__VLS_ctx.showEditModal)))
                        return;
                    __VLS_ctx.buscarMunicipios(__VLS_ctx.editingUser.estado);
                } },
            value: ((__VLS_ctx.editingUser.estado)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        for (const [estado] of __VLS_getVForSourceType((__VLS_ctx.estados))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((estado.uf)),
                value: ((estado.uf)),
            });
            (estado.nome);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.editingUser.cidade)),
            disabled: ((!__VLS_ctx.editingUser.estado)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        for (const [municipio] of __VLS_getVForSourceType((__VLS_ctx.municipios))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((municipio.id)),
                value: ((municipio.nome)),
            });
            (municipio.nome);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("setor-input-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.editingUser.setor)),
            required: (true),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        for (const [setor] of __VLS_getVForSourceType((__VLS_ctx.setores))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((setor.id)),
                value: ((setor.nome)),
            });
            (setor.nome);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closeEditModal) },
            type: ("button"),
            ...{ class: ("btn-cancelar") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/icons/fechar.svg"),
            alt: ("Cancelar"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            type: ("submit"),
            ...{ class: ("btn-salvar") },
            disabled: ((__VLS_ctx.loading)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/icons/save-fill.svg"),
            alt: ("Salvar"),
            ...{ class: ("icon") },
        });
        (__VLS_ctx.loading ? 'Salvando...' : 'Salvar');
    }
    ['usuarios-container', 'toast', 'usuarios-header', 'btn-novo', 'icon-black', 'search-bar', 'usuarios-grid', 'usuario-card', 'usuario-header', 'usuario-avatar', 'actions', 'btn-edit', 'icon', 'btn-delete', 'icon', 'usuario-body', 'info-grid', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'card-actions', 'status-toggle', 'active', 'status-btn', 'icon-black', 'active', 'status-btn', 'icon-black', 'active', 'status-btn', 'icon-black', 'modal-overlay', 'modal-content', 'edit-form', 'form-grid', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'setor-input-group', 'modal-actions', 'btn-cancelar', 'icon', 'btn-salvar', 'icon',];
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
            setores: setores,
            searchTerm: searchTerm,
            setorFilter: setorFilter,
            loading: loading,
            statusFilter: statusFilter,
            sortBy: sortBy,
            showEditModal: showEditModal,
            municipios: municipios,
            toast: toast,
            editingUser: editingUser,
            setoresUnicos: setoresUnicos,
            usuariosFiltrados: usuariosFiltrados,
            formatDate: formatDate,
            getInitials: getInitials,
            toggleStatus: toggleStatus,
            deletarUsuario: deletarUsuario,
            editarUsuario: editarUsuario,
            handleEditSubmit: handleEditSubmit,
            closeEditModal: closeEditModal,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
