
import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

import { reporteService } from '../../services/reportesService';

const COLORES_RANGOS: Record<string, string> = {
    '0-17': '#3C50E0',
    '18-25': '#10B981',
    '26-40': '#F59E0B',
    '41-60': '#EF4444',
    '60+': '#8B5CF6',
    'Sin información': '#94A3B8',
};

const DistribucionEtaria = () => {
    const [datos, setDatos] = useState<any>(null);

    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const [rutaId, setRutaId] = useState('');

    const [loading, setLoading] = useState(false);

    const [rutas, setRutas] = useState<any[]>([]);

    const chartRef = useRef<HTMLDivElement>(null);

    const cargarDatos = async () => {
        setLoading(true);

        try {
            const response = await reporteService.getDistribucionEtaria(
                fechaInicio || undefined,
                fechaFin || undefined,
                //rutaId || undefined
            );

            setDatos(response);

        } catch (error) {

            console.error('Error cargando distribución etaria:', error);

        } finally {

            setLoading(false);
        }
    };

    const cargarRutas = async () => {
        try {

            if (!reporteService.getRutas) return;

            const response = await reporteService.getRutas();

            setRutas(response || []);

        } catch (error) {

            console.error('Error cargando rutas:', error);
        }
    };

    const exportarExcel = () => {
        if (!datos) return;

        const data = labels.map((rango) => ({
            Rango: rango,
            Cantidad: datos.rangos[rango],
            Porcentaje: datos.porcentajes[rango],
            Variacion: datos.variaciones?.[rango] || '0%',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Distribucion Etaria'
        );

        XLSX.writeFile(workbook, 'distribucion_etaria.xlsx');
    };

    const exportarPNG = async () => {

        if (!chartRef.current) return;

        const canvas = await html2canvas(chartRef.current);

        const link = document.createElement('a');

        link.download = 'distribucion-etaria.png';

        link.href = canvas.toDataURL();

        link.click();
    };

    useEffect(() => {

        cargarDatos();
        cargarRutas();

    }, []);

    const { labels, series, segmentoPredominante } = useMemo(() => {

        if (!datos?.rangos) {

            return {
                labels: [],
                series: [],
                segmentoPredominante: '',
            };
        }

        const labels = Object.keys(datos.rangos);

        const series = Object.values(datos.rangos) as number[];

        const segmentoPredominante = labels.reduce(
            (a, b) =>
                datos.rangos[a] > datos.rangos[b]
                    ? a
                    : b,
            labels[0]
        );

        return {
            labels,
            series,
            segmentoPredominante,
        };

    }, [datos]);

    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'pie',
            fontFamily: 'inherit',
        },

        labels,

        colors: labels.map(
            (l) => COLORES_RANGOS[l] || '#94A3B8'
        ),

        legend: {
            position: 'bottom',
            fontSize: '13px',
        },

        tooltip: {
            y: {
                formatter: (value) => `${value} usuarios`,
            },
        },

        dataLabels: {
            formatter: (val: number) =>
                `${val.toFixed(1)}%`,

            style: {
                fontSize: '13px',
                fontWeight: '600',
            },
        },

        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: {
                        width: '100%',
                    },
                },
            },
        ],
    };

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">

            {/* Header */}
            <div className="mb-6">

                <h2 className="text-title-md2 font-bold text-black dark:text-white">
                    Distribución Etaria de Pasajeros
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Análisis porcentual por rango de edad
                </p>

            </div>

            {/* Filtros */}
            <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">

                <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">

                    <h3 className="font-medium text-black dark:text-white">
                        Filtros
                    </h3>

                </div>

                <div className="p-6">

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">

                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Fecha inicio
                            </label>

                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) =>
                                    setFechaInicio(e.target.value)
                                }
                                className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Fecha fin
                            </label>

                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) =>
                                    setFechaFin(e.target.value)
                                }
                                className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            />
                        </div>

                        {/* Filtro ruta */}
                        <div>

                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Ruta
                            </label>

                            <select
                                value={rutaId}
                                onChange={(e) =>
                                    setRutaId(e.target.value)
                                }
                                className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            >

                                <option value="">
                                    Todas
                                </option>

                                {rutas.map((ruta) => (
                                    <option
                                        key={ruta.id}
                                        value={ruta.id}
                                    >
                                        {ruta.nombre}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="flex items-end">

                            <button
                                onClick={cargarDatos}
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 transition-all disabled:opacity-60"
                            >

                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                                        />
                                    </svg>
                                )}

                                Consultar

                            </button>

                        </div>

                    </div>

                </div>

            </div>

            {datos && (

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                    {/* Gráfico */}
                    <div className="xl:col-span-2 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">

                        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">

                            <h3 className="font-medium text-black dark:text-white">
                                Distribución por Rango Etario
                            </h3>

                            <div className="flex items-center gap-2">

                                <button
                                    onClick={exportarPNG}
                                    className="rounded bg-success px-3 py-2 text-sm text-white hover:bg-opacity-90"
                                >
                                    PNG
                                </button>

                                <button
                                    onClick={exportarExcel}
                                    className="rounded bg-primary px-3 py-2 text-sm text-white hover:bg-opacity-90"
                                >
                                    Excel
                                </button>

                                <span className="text-sm text-gray-500">
                                    {datos.total} usuarios
                                </span>

                            </div>

                        </div>

                        <div
                            className="p-6"
                            ref={chartRef}
                        >

                            {loading ? (

                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>

                            ) : (

                                <Chart
                                    options={chartOptions}
                                    series={series}
                                    type="pie"
                                    height={380}
                                />

                            )}

                        </div>

                    </div>

                    {/* Panel lateral */}
                    <div className="space-y-4">

                        {/* Segmento predominante */}
                        {segmentoPredominante && (

                            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">

                                <p className="text-sm text-gray-500 mb-1">
                                    Segmento predominante
                                </p>

                                <div className="flex items-center gap-3 mt-2">

                                    <div
                                        className="h-4 w-4 rounded-full flex-shrink-0"
                                        style={{
                                            backgroundColor:
                                                COLORES_RANGOS[
                                                    segmentoPredominante
                                                ],
                                        }}
                                    />

                                    <p className="text-xl font-bold text-black dark:text-white">
                                        {segmentoPredominante} años
                                    </p>

                                </div>

                                <p className="text-2xl font-bold text-primary mt-1">
                                    {
                                        datos.porcentajes[
                                            segmentoPredominante
                                        ]
                                    }
                                </p>

                            </div>

                        )}

                        {/* Tabla */}
                        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">

                            <div className="border-b border-stroke px-4 py-3 dark:border-strokedark">

                                <h4 className="font-medium text-black dark:text-white text-sm">
                                    Detalle por rango
                                </h4>

                            </div>

                            <div className="p-4">

                                <table className="w-full text-sm">

                                    <thead>

                                        <tr className="text-left text-xs text-gray-400">

                                            <th className="pb-2">
                                                Rango
                                            </th>

                                            <th className="pb-2 text-right">
                                                Cant.
                                            </th>

                                            <th className="pb-2 text-right">
                                                %
                                            </th>

                                            <th className="pb-2 text-right">
                                                Var.
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-stroke dark:divide-strokedark">

                                        {labels.map((rango) => (

                                            <tr key={rango}>

                                                <td className="py-2">

                                                    <div className="flex items-center gap-2">

                                                        <div
                                                            className="h-2.5 w-2.5 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    COLORES_RANGOS[
                                                                        rango
                                                                    ],
                                                            }}
                                                        />

                                                        <span className="text-black dark:text-white">
                                                            {rango}
                                                        </span>

                                                    </div>

                                                </td>

                                                <td className="py-2 text-right font-medium text-black dark:text-white">
                                                    {
                                                        datos.rangos[
                                                            rango
                                                        ]
                                                    }
                                                </td>

                                                <td className="py-2 text-right text-primary font-medium">
                                                    {
                                                        datos.porcentajes[
                                                            rango
                                                        ]
                                                    }
                                                </td>

                                                <td className="py-2 text-right font-medium">

                                                    <span
                                                        className={
                                                            (
                                                                datos
                                                                    .variaciones?.[
                                                                    rango
                                                                ] || ''
                                                            ).includes('-')
                                                                ? 'text-danger'
                                                                : 'text-success'
                                                        }
                                                    >

                                                        {
                                                            datos
                                                                .variaciones?.[
                                                                rango
                                                            ] || '0%'
                                                        }

                                                    </span>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default DistribucionEtaria;
