declare const _default: import("vue").DefineComponent<{}, {
    cursos: import("vue").Ref<never[], never[]>;
    cursosFiltrados: import("vue").ComputedRef<never[]>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<null, null>;
    searchTerm: import("vue").Ref<string, string>;
    statusFilter: import("vue").Ref<string, string>;
    loadCursos: () => Promise<void>;
    toggleStatus: (curso: any, newStatus: any) => Promise<void>;
    deletarCurso: (id: any) => Promise<void>;
    editarCurso: (curso: any) => void;
    formatDate: (date: any) => any;
    sanitizeHTML: (str: string | null | undefined) => string;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
