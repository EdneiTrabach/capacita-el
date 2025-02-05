/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref } from 'vue';
import { supabase } from '@/config/supabase';
import { sanitizeHTML } from '@/utils/sanitize';
import { certificateService } from '@/services/certificateService';
export default (await import('vue')).defineComponent({
    name: 'CertificadosAlunos',
    data() {
        return {
            certificados: [],
            alunos: [],
            cursos: [],
            searchTerm: '',
            statusFilter: '',
            sortBy: 'recent',
            dateFilter: '',
            showModal: false,
            novoCertificado: {
                alunoId: '',
                cursoId: '',
                dataConclusao: '',
                observacoes: ''
            },
            editingId: null,
            toast: {
                show: false,
                message: '',
                type: 'success'
            },
            showPreviewModal: false,
            previewUrl: ''
        };
    },
    computed: {
        certificadosFiltrados() {
            let filtered = this.certificados.filter(cert => {
                // Filtro por texto (nome do aluno ou curso)
                const matchSearch = !this.searchTerm ||
                    cert.usuario?.nome?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    cert.curso?.nome?.toLowerCase().includes(this.searchTerm.toLowerCase());
                // Filtro por status
                const matchStatus = !this.statusFilter ||
                    cert.status === this.statusFilter;
                // Filtro por data
                const matchDate = !this.dateFilter ||
                    this.formatDate(cert.data_conclusao) === this.formatDate(this.dateFilter);
                return matchSearch && matchStatus && matchDate;
            });
            // Aplicar ordenação
            switch (this.sortBy) {
                case 'recent':
                    return filtered.sort((a, b) => new Date(b.data_emissao || b.createdAt) - new Date(a.data_emissao || a.createdAt));
                case 'oldest':
                    return filtered.sort((a, b) => new Date(a.data_emissao || a.createdAt) - new Date(b.data_emissao || b.createdAt));
                case 'alpha':
                    return filtered.sort((a, b) => (a.usuario?.nome || '').localeCompare(b.usuario?.nome || ''));
                default:
                    return filtered;
            }
        }
    },
    methods: {
        showToast(message, type = 'success') {
            this.toast = {
                show: true,
                message,
                type
            };
            setTimeout(() => {
                this.toast.show = false;
            }, 3000);
        },
        async downloadCertificado(certificado) {
            try {
                const pdf = await certificateService.generateCertificatePDF(certificado);
                pdf.save(`certificado-${certificado.codigo}.pdf`);
            }
            catch (error) {
                console.error('Erro ao baixar certificado:', error);
                this.showToast('Erro ao baixar certificado', 'error');
            }
        },
        async visualizarCertificado(certificado) {
            try {
                const pdf = await certificateService.generateCertificatePDF(certificado);
                const blob = pdf.output('blob');
                const url = URL.createObjectURL(blob);
                // Abrir modal com preview
                this.previewUrl = url;
                this.showPreviewModal = true;
            }
            catch (error) {
                console.error('Erro ao visualizar certificado:', error);
                this.showToast('Erro ao visualizar certificado', 'error');
            }
        },
        formatDate(date) {
            if (!date)
                return '--';
            try {
                return date.split('T')[0].split('-').reverse().join('/');
            }
            catch (error) {
                console.error('Erro ao formatar data:', error);
                return '--';
            }
        },
        async loadData() {
            try {
                const { data, error } = await supabase
                    .from('certificados')
                    .select(`
            *,
            usuario:usuarios(*),
            curso:cursos(*)
          `);
                if (error)
                    throw error;
                this.certificados = data;
            }
            catch (error) {
                console.error('Erro ao carregar certificados:', error);
                this.showToast('Erro ao carregar certificados', 'error');
            }
        },
        async salvarCertificado() {
            try {
                const certificadoData = {
                    usuario_id: this.novoCertificado.alunoId,
                    curso_id: this.novoCertificado.cursoId,
                    data_conclusao: this.novoCertificado.dataConclusao,
                    observacoes: this.novoCertificado.observacoes,
                    updated_at: new Date().toISOString()
                };
                if (this.editingId) {
                    // Atualizar certificado existente
                    const { error } = await supabase
                        .from('certificados')
                        .update(certificadoData)
                        .eq('id', this.editingId);
                    if (error)
                        throw error;
                    this.showToast('Certificado atualizado com sucesso!', 'success');
                }
                else {
                    // Inserir novo certificado
                    certificadoData.status = 'pendente';
                    certificadoData.created_at = new Date().toISOString();
                    const { error } = await supabase
                        .from('certificados')
                        .insert([certificadoData]);
                    if (error)
                        throw error;
                    this.showToast('Certificado criado com sucesso!', 'success');
                }
                this.showModal = false;
                this.editingId = null;
                this.resetForm();
                await this.loadData();
            }
            catch (error) {
                console.error('Erro ao salvar certificado:', error);
                this.showToast('Erro ao salvar certificado', 'error');
            }
        },
        resetForm() {
            this.novoCertificado = {
                alunoId: '',
                cursoId: '',
                dataConclusao: '',
                observacoes: ''
            };
        },
        async deletarCertificado(id) {
            if (confirm('Tem certeza que deseja excluir este certificado?')) {
                try {
                    const { error } = await supabase
                        .from('certificados')
                        .delete()
                        .eq('id', id);
                    if (error)
                        throw error;
                    await this.loadData();
                    this.showToast('Certificado excluído com sucesso');
                }
                catch (error) {
                    console.error('Erro ao deletar certificado:', error);
                    this.showToast('Erro ao excluir certificado', 'error');
                }
            }
        },
        viewDetails(certificado) {
            // Implementar visualização detalhada do certificado
            console.log('Visualizar certificado:', certificado.codigo);
        },
        async editarCertificado(certificado) {
            try {
                if (certificado.status === 'emitido') {
                    this.showToast('Não é possível editar um certificado já emitido', 'error');
                    return;
                }
                // Carregar dados dos selects antes de abrir o modal
                await Promise.all([
                    this.carregarUsuariosAtivos(),
                    this.carregarCursosAtivos()
                ]);
                // Preencher o formulário com os dados existentes
                this.novoCertificado = {
                    alunoId: certificado.usuario_id,
                    cursoId: certificado.curso_id,
                    dataConclusao: certificado.data_conclusao?.split('T')[0],
                    observacoes: certificado.observacoes
                };
                this.editingId = certificado.id;
                this.showModal = true;
            }
            catch (error) {
                console.error('Erro ao editar certificado:', error);
                this.showToast('Erro ao editar certificado', 'error');
            }
        },
        async carregarUsuariosAtivos() {
            try {
                const { data, error } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('status', 'ativo');
                if (error)
                    throw error;
                this.alunos = data;
            }
            catch (error) {
                console.error('Erro ao carregar usuários:', error);
                this.showToast('Erro ao carregar lista de alunos', 'error');
            }
        },
        async carregarCursosAtivos() {
            try {
                const { data, error } = await supabase
                    .from('cursos')
                    .select('*')
                    .eq('status', 'Finalizado');
                if (error)
                    throw error;
                this.cursos = data;
                console.log('Cursos carregados:', this.cursos);
            }
            catch (error) {
                console.error('Erro ao carregar cursos:', error);
                this.showToast('Erro ao carregar lista de cursos', 'error');
            }
        },
        async abrirModal() {
            try {
                await Promise.all([
                    this.carregarUsuariosAtivos(),
                    this.carregarCursosAtivos()
                ]);
                this.editingId = null; // Garante que é um novo certificado
                this.resetForm(); // Limpa o formulário
                this.showModal = true;
            }
            catch (error) {
                console.error('Erro ao preparar modal:', error);
                this.showToast('Erro ao abrir formulário', 'error');
            }
        },
        fecharModal() {
            this.showModal = false;
            this.editingId = null;
            this.resetForm();
        },
        async loadCertificados() {
            try {
                const { data } = await api.certificados.getAll();
                this.certificados = data;
            }
            catch (error) {
                console.error('Erro ao carregar certificados:', error);
                this.showToast('Erro ao carregar certificados', 'error');
            }
        },
        async emitirCertificado(certificado) {
            try {
                const { error } = await supabase
                    .from('certificados')
                    .update({
                    status: 'emitido',
                    data_emissao: new Date().toISOString()
                })
                    .eq('id', certificado.id);
                if (error)
                    throw error;
                await this.loadData();
                this.showToast('Certificado emitido com sucesso!');
            }
            catch (error) {
                console.error('Erro ao emitir certificado:', error);
                this.showToast('Erro ao emitir certificado', 'error');
            }
        },
        closePreviewModal() {
            this.showPreviewModal = false;
            this.previewUrl = '';
        },
        sanitizeHTML
    },
    created() {
        console.log('Componente montado');
        this.loadData();
    }
}); /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['certificados-header', 'btn-novo', 'search-bar', 'search-bar', 'search-bar', 'search-bar', 'certificado-card', 'certificado-card', 'status-badge', 'certificado-card', 'status-badge', 'certificado-card', 'status-badge', 'certificado-body', 'info-item', 'btn-edit', 'btn-delete', 'btn-download', 'btn-view', 'btn-emit', 'btn-edit', 'btn-delete', 'btn-download', 'btn-view', 'btn-emit', 'toast', 'toast', 'modal-content', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'btn-cancelar', 'btn-salvar', 'btn-cancelar', 'btn-salvar', 'btn-cancelar', 'btn-salvar', 'modal-content', 'modal-actions', 'btn-cancelar', 'btn-salvar', 'certificados-container', 'certificados-header', 'search-bar', 'search-bar', 'search-bar', 'certificados-grid', 'close-btn',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("certificados-container") },
    });
    if (__VLS_ctx.toast.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("toast") },
            ...{ class: ((__VLS_ctx.toast.type)) },
        });
        (__VLS_ctx.toast.message);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: ("certificados-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.abrirModal) },
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
        placeholder: ("Buscar por aluno ou curso..."),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.statusFilter)),
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: ("cancelado"),
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: ("date"),
        placeholder: ("Filtrar por data"),
    });
    (__VLS_ctx.dateFilter);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("certificados-grid") },
    });
    for (const [certificado] of __VLS_getVForSourceType((__VLS_ctx.certificadosFiltrados))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((certificado.id)),
            ...{ class: ("certificado-card") },
            ...{ class: ((certificado.status)) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("certificado-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("status-badge") },
        });
        (certificado.status);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("actions") },
        });
        if (certificado.status === 'pendente') {
            __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!((certificado.status === 'pendente')))
                            return;
                        __VLS_ctx.emitirCertificado(certificado);
                    } },
                ...{ class: ("btn-emit") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
                src: ("/public/icons/imprimir.svg"),
                alt: ("Emitir"),
                ...{ class: ("icon") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!((certificado.status === 'pendente')))
                            return;
                        __VLS_ctx.editarCertificado(certificado);
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
                        if (!((certificado.status === 'pendente')))
                            return;
                        __VLS_ctx.deletarCertificado(certificado.id);
                    } },
                ...{ class: ("btn-delete") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
                src: ("/public/icons/lixeira.svg"),
                alt: ("Excluir"),
                ...{ class: ("icon") },
            });
        }
        if (certificado.status === 'emitido') {
            __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!((certificado.status === 'emitido')))
                            return;
                        __VLS_ctx.downloadCertificado(certificado);
                    } },
                ...{ class: ("btn-download") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!((certificado.status === 'emitido')))
                            return;
                        __VLS_ctx.visualizarCertificado(certificado);
                    } },
                ...{ class: ("btn-view") },
            });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("certificado-body") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.sanitizeHTML(certificado.usuario?.nome));
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
        (__VLS_ctx.sanitizeHTML(certificado.curso?.nome));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (certificado?.curso?.duracao_horas || '--');
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDate(certificado.data_conclusao));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (certificado.codigo);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDate(certificado.data_emissao));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (certificado?.usuario?.email || '--');
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("info-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.sanitizeHTML(certificado.observacoes));
    }
    if (__VLS_ctx.showModal) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-overlay") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (__VLS_ctx.editingId ? 'Editar Certificado' : 'Novo Certificado');
        __VLS_elementAsFunction(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
            ...{ onSubmit: (__VLS_ctx.salvarCertificado) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.novoCertificado.alunoId)),
            required: (true),
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
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.novoCertificado.cursoId)),
            required: (true),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (""),
        });
        for (const [curso] of __VLS_getVForSourceType((__VLS_ctx.cursos))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((curso.id)),
                value: ((curso.id)),
                disabled: ((curso.status !== 'Finalizado')),
            });
            (curso.nome);
            (curso.status);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            type: ("date"),
            required: (true),
        });
        (__VLS_ctx.novoCertificado.dataConclusao);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
            value: ((__VLS_ctx.novoCertificado.observacoes)),
            rows: ("3"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.fecharModal) },
            type: ("button"),
            ...{ class: ("btn-cancelar") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/fechar.svg"),
            alt: ("Cancelar"),
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
        (__VLS_ctx.editingId ? 'Atualizar' : 'Salvar');
    }
    if (__VLS_ctx.showPreviewModal) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (__VLS_ctx.closePreviewModal) },
            ...{ class: ("modal-overlay") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: () => { } },
            ...{ class: ("modal-content preview-modal") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closePreviewModal) },
            ...{ class: ("close-btn") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.iframe, __VLS_intrinsicElements.iframe)({
            src: ((__VLS_ctx.previewUrl)),
            ...{ class: ("preview-frame") },
        });
    }
    ['certificados-container', 'toast', 'certificados-header', 'btn-novo', 'icon-black', 'search-bar', 'certificados-grid', 'certificado-card', 'certificado-header', 'status-badge', 'actions', 'btn-emit', 'icon', 'btn-edit', 'icon', 'btn-delete', 'icon', 'btn-download', 'btn-view', 'certificado-body', 'info-grid', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'info-item', 'label', 'modal-overlay', 'modal-content', 'form-group', 'form-group', 'form-group', 'form-group', 'modal-actions', 'btn-cancelar', 'icon', 'btn-salvar', 'icon', 'modal-overlay', 'modal-content', 'preview-modal', 'close-btn', 'preview-frame',];
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
