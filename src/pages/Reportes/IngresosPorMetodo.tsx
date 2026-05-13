import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { reporteService } from '../../services/reportesService';

const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const IngresosPorMetodo = () => {
    const [datos, setDatos] = useState<any[]>([]);
    const [meses, setMeses] = useState(6);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const response = await reporteService.getIngresosPorMetodo(meses);
                setDatos(response);
            } catch (error) {
                console.error('Error cargando reporte:', error);
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

    const { categories, series } = useMemo(() => {
        const categories = [...new Set(datos.map((item) => `${nombresMeses[item.mes - 1]} ${item.anio}`))];
        const tipos = [...new Set(datos.map((item) => item.tipo))];
        const series = tipos.map((tipo) => ({
            name: tipo,
            data: categories.map((categoria) => {
                const registro = datos.find((item) => {
                    const nombreMes = `${nombresMeses[item.mes - 1]} ${item.anio}`;
                    return item.tipo === tipo && nombreMes === categoria;
                });
                return registro ? registro.total : 0;
            }),
        }));
        return { categories, series };
    }, [datos]);

    const chartOptions: ApexCharts.ApexOptions = {
        chart: { type: 'bar', stacked: true, toolbar: { show: true } },
        title: { text: 'Ingresos por método de pago' },
        xaxis: { categories },
        yaxis: { labels: { formatter: (value) => `$${value.toLocaleString()}` } },
        legend: { position: 'top' },
        tooltip: { y: { formatter: (value) => `$${value.toLocaleString()}` } },
        plotOptions: { bar: { horizontal: false, borderRadius: 4 } },
    };

    return (
        <div>
            <h2>Ingresos por método de pago</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => setMeses(3)}>Últimos 3 meses</button>
                <button onClick={() => setMeses(6)}>Últimos 6 meses</button>
                <button onClick={() => setMeses(12)}>Últimos 12 meses</button>
                <button onClick={handleExportar}>Exportar CSV</button>
            </div>
            <Chart options={chartOptions} series={series} type="bar" height={400} />
        </div>
    );
};

export default IngresosPorMetodo;