import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { reporteService } from '../../services/reportesService';

const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const COLORES_TIPOS: Record<string, string> = {
    'accidente_menor': '#EF4444',
    'falla_mecanica': '#F59E0B',
    'congestion_inesperada': '#3C50E0',
    'problema_pasajeros': '#10B981',
};

const ETIQUETAS_TIPOS: Record<string, string> = {
    'accidente_menor': 'Accidente Menor',
    'falla_mecanica': 'Falla Mecánica',
    'congestion_inesperada': 'Congestión Inesperada',
    'problema_pasajeros': 'Problema con Pasajeros',
};

const PERIODOS = [
    { label: '3 meses', value: 3 },
    { label: '6 meses', value: 6 },
    { label: '12 meses', value: 12 },
];

const TendenciaIncidentes = () => {
    const [datos, setDatos] = useState<any[]>([]);
    const [meses, setMeses] = useState(6);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const response = await reporteService.getTendenciaIncidentes(meses);
                setDatos(response);
            } catch (error) {
                console.error('Error cargando tendencia incidentes:', error);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [meses]);

    const { categories, series, totalIncidentes } = useMemo(() => {
        const categories = [...new Set(datos.map((item) => `${nombresMeses[item.mes - 1]} ${item.anio}`))];
        const tipos = [...new Set(datos.map((item) => item.tipo))];
        const series = tipos.map((tipo) => ({
            name: ETIQUETAS_TIPOS[tipo] || tipo,
            data: categories.map((categoria) => {
                const registro = datos.find((item) => {
                    const nombreMes = `${nombresMeses[item.mes - 1]} ${item.anio}`;
                    return item.tipo === tipo && nombreMes === categoria;
                });
                return registro ? Number(registro.cantidad) : 0;
            }),
        }));
        const totalIncidentes = datos.reduce((acc, item) => acc + Number(item.cantidad), 0);
        return { categories, series, totalIncidentes };
    }, [datos]);

    const chartOptions: ApexCharts.ApexOptions = {
        chart: { type: 'line', toolbar: { show: false }, fontFamily: 'inherit', zoom: { enabled: false } },
        colors: [...new Set(datos.map(d => d.tipo))].map(t => COLORES_TIPOS[t] || '#94A3B8'),
        xaxis: { categories, labels: { style: { colors: '#64748b', fontSize: '12px' } } },
        yaxis: {
            min: 0,
            labels: { formatter: (value) => Math.round(value).toString(), style: { colors: '#64748b' } }
        },
        legend: { position: 'top', horizontalAlign: 'left', fontSize: '13px' },
        stroke: { curve: 'smooth', width: 2.5 },
        markers: { size: 5, hover: { size: 7 } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
        tooltip: { y: { formatter: (value) => `${value} incidente(s)` } },
    };

    const tiposUnicos = [...new Set(datos.map(d => d.tipo))];

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-title-md2 font-bold text-black dark:text-white">
                        Tendencia de Incidentes
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Evolución temporal de incidentes reportados por tipo
                    </p>
                </div>
                <div className="flex gap-2">
                    {PERIODOS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setMeses(p.value)}
                            className={`rounded px-4 py-2 text-sm font-medium transition-all ${
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

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
                <div className="rounded-sm border border-stroke bg-white px-6 py-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <p className="text-sm text-gray-500">Total incidentes</p>
                    <p className="text-2xl font-bold text-black dark:text-white mt-1">{totalIncidentes}</p>
                </div>
                {tiposUnicos.slice(0, 3).map((tipo) => {
                    const cantidad = datos.filter(d => d.tipo === tipo).reduce((acc, d) => acc + Number(d.cantidad), 0);
                    return (
                        <div key={tipo} className="rounded-sm border border-stroke bg-white px-6 py-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORES_TIPOS[tipo] || '#94A3B8' }} />
                                <p className="text-xs text-gray-500">{ETIQUETAS_TIPOS[tipo] || tipo}</p>
                            </div>
                            <p className="text-2xl font-bold text-black dark:text-white">{cantidad}</p>
                        </div>
                    );
                })}
            </div>

            {/* Chart */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">Evolución por Tipo de Incidente</h3>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : datos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>No hay incidentes registrados en este período</p>
                        </div>
                    ) : (
                        <Chart options={chartOptions} series={series} type="line" height={400} />
                    )}
                </div>
            </div>

            {/* Leyenda de tipos */}
            <div className="mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4">
                <div className="flex flex-wrap gap-4">
                    {Object.entries(ETIQUETAS_TIPOS).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORES_TIPOS[key] }} />
                            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TendenciaIncidentes;
