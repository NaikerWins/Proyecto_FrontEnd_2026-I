import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { reporteService } from '../../services/reportesService';

const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const PERIODOS = [
    { label: 'Últimos 3 meses', value: 3 },
    { label: 'Últimos 6 meses', value: 6 },
    { label: 'Últimos 12 meses', value: 12 },
];

const IngresosPorMetodo = () => {
    const [datos, setDatos] = useState<any[]>([]);
    const [meses, setMeses] = useState(6);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const response = await reporteService.getIngresosPorMetodo(meses);
                setDatos(response);
            } catch (error) {
                console.error('Error cargando reporte:', error);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [meses]);

    const handleExportar = async () => {
        const csv = await reporteService.exportarIngresos(meses);
        const blob = new Blob([csv as unknown as string], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ingresos_${meses}_meses.csv`;
        link.click();
    };

    const { categories, series, totalGeneral } = useMemo(() => {
        const categories = [...new Set(datos.map((item) => `${nombresMeses[item.mes - 1]} ${item.anio}`))];
        const tipos = [...new Set(datos.map((item) => item.tipo))];
        const series = tipos.map((tipo) => ({
            name: tipo,
            data: categories.map((categoria) => {
                const registro = datos.find((item) => {
                    const nombreMes = `${nombresMeses[item.mes - 1]} ${item.anio}`;
                    return item.tipo === tipo && nombreMes === categoria;
                });
                return registro ? Number(registro.total) : 0;
            }),
        }));
        const totalGeneral = datos.reduce((acc, item) => acc + Number(item.total), 0);
        return { categories, series, totalGeneral };
    }, [datos]);

    const chartOptions: ApexCharts.ApexOptions = {
        chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
        colors: ['#3C50E0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        xaxis: { categories, labels: { style: { colors: '#64748b', fontSize: '12px' } } },
        yaxis: { labels: { formatter: (value) => `$${value.toLocaleString('es-CO')}`, style: { colors: '#64748b' } } },
        legend: { position: 'top', horizontalAlign: 'left', fontSize: '13px' },
        tooltip: { y: { formatter: (value) => `$${value.toLocaleString('es-CO')}` } },
        plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '50%' } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
        fill: { opacity: 1 },
    };

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-title-md2 font-bold text-black dark:text-white">
                        Ingresos por Método de Pago
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Evolución mensual de ingresos por tipo de pago
                    </p>
                </div>
                <button
                    onClick={handleExportar}
                    className="inline-flex items-center gap-2 rounded-md border border-stroke px-5 py-2.5 text-sm font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                <div className="rounded-sm border border-stroke bg-white px-6 py-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <p className="text-sm text-gray-500">Total del período</p>
                    <p className="text-2xl font-bold text-black dark:text-white mt-1">
                        ${totalGeneral.toLocaleString('es-CO')}
                    </p>
                </div>
                <div className="rounded-sm border border-stroke bg-white px-6 py-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <p className="text-sm text-gray-500">Métodos activos</p>
                    <p className="text-2xl font-bold text-black dark:text-white mt-1">
                        {[...new Set(datos.map(d => d.tipo))].length}
                    </p>
                </div>
                <div className="rounded-sm border border-stroke bg-white px-6 py-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <p className="text-sm text-gray-500">Transacciones</p>
                    <p className="text-2xl font-bold text-black dark:text-white mt-1">{datos.length}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6 py-4 dark:border-strokedark flex items-center justify-between">
                    <h3 className="font-medium text-black dark:text-white">Evolución Mensual</h3>
                    <div className="flex gap-2">
                        {PERIODOS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setMeses(p.value)}
                                className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                                    meses === p.value
                                        ? 'bg-primary text-white'
                                        : 'border border-stroke text-black hover:border-primary dark:border-strokedark dark:text-white'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : datos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p>No hay datos para el período seleccionado</p>
                        </div>
                    ) : (
                        <Chart options={chartOptions} series={series} type="bar" height={400} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default IngresosPorMetodo;
