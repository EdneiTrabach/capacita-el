declare const _default: import("vue").DefineComponent<{}, {}, {
    certificados: never[];
    alunos: never[];
    cursos: never[];
    searchTerm: string;
    statusFilter: string;
    sortBy: string;
    dateFilter: string;
    showModal: boolean;
    novoCertificado: {
        alunoId: string;
        cursoId: string;
        dataConclusao: string;
        observacoes: string;
    };
    editingId: null;
    toast: {
        show: boolean;
        message: string;
        type: string;
    };
    showPreviewModal: boolean;
    previewUrl: string;
}, {
    certificadosFiltrados(): any[];
}, {
    showToast(message: any, type?: string): void;
    downloadCertificado(certificado: any): Promise<void>;
    visualizarCertificado(certificado: any): Promise<void>;
    formatDate(date: any): any;
    loadData(): Promise<void>;
    salvarCertificado(): Promise<void>;
    resetForm(): void;
    deletarCertificado(id: any): Promise<void>;
    viewDetails(certificado: any): void;
    editarCertificado(certificado: any): Promise<void>;
    carregarUsuariosAtivos(): Promise<void>;
    carregarCursosAtivos(): Promise<void>;
    abrirModal(): Promise<void>;
    fecharModal(): void;
    loadCertificados(): Promise<void>;
    emitirCertificado(certificado: any): Promise<void>;
    closePreviewModal(): void;
    sanitizeHTML: (str: string | null | undefined) => string;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
