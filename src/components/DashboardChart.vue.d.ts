declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    matriculasPorCurso: {
        type: ObjectConstructor;
        required: true;
    };
}>, {}, {}, {
    chartData(): {
        labels: string[];
        datasets: {
            label: string;
            data: any[];
            backgroundColor: string;
        }[];
    };
    chartOptions(): {
        responsive: boolean;
        maintainAspectRatio: boolean;
        plugins: {
            legend: {
                position: string;
            };
            title: {
                display: boolean;
            };
        };
    };
}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    matriculasPorCurso: {
        type: ObjectConstructor;
        required: true;
    };
}>> & Readonly<{}>, {}, {}, {
    Bar: import("node_modules/vue-chartjs/dist/types").TypedChartComponent<"bar", (number | [number, number] | null)[] | import("node_modules/vue-chartjs/dist/typedCharts").ExtendedDataPoint[], unknown>;
}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
