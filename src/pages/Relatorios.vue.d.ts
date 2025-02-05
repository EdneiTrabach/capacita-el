declare const _default: import("vue").DefineComponent<{}, {}, {
    showCertificadosReport: boolean;
    showAlunosReport: boolean;
    alunos: never[];
    cursos: never[];
    anos: never[];
    certificadosFilters: {
        alunoId: string;
        cursoId: string;
        status: string;
        dataInicio: string;
        dataFim: string;
        ano: string;
    };
    alunosFilters: {
        cursoId: string;
        status: string;
        dataInicio: string;
        dataFim: string;
        conclusao: string;
    };
}, {}, {
    loadData(): Promise<void>;
    gerarRelatorioCertificados(): Promise<any>;
    exportarCertificadosExcel(): Promise<void>;
    gerarRelatorioAlunos(): Promise<any>;
    exportarAlunosExcel(): Promise<void>;
    sanitizeHTML: (str: string | null | undefined) => string;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
