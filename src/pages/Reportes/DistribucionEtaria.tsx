import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { reporteService } from '../../services/reportesService';

const DistribucionEtaria = () => {
    const [datos, setDatos] = useState<any>(null);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const cargarDatos = async () => {
        try {
            const response = await reporteService.getDistribucionEtaria(
                fechaInicio || undefined,
                fechaFin || undefined
            );
            setDatos(response);
        } catch (error) {
            console.error('Error cargando distribución etaria:', error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const { labels, series } = useMemo(() => {
        if (!datos?.rangos) return { labels: [], series: [] };
        const labels = Object.keys(datos.rangos);
        const series = Object.values(datos.rangos) as number[];
        return { labels, series };
    }, [datos]);

    const chartOptions: ApexCharts.ApexOptions = {
        chart: { type: 'pie' },
        labels,
        title: { text: 'Distribución etaria de pasajeros' },
        legend: { position: 'bottom' },
        tooltip: { y: { formatter: (value) => `${value} usuarios` } },
        responsive: [{ breakpoint: 768, options: { chart: { width: '100%' }, legend: { position: 'bottom' } } }],
    };

    return (
        <div>
            <h2>Distribución etaria</h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
                <label>Desde:
                    <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                    />
                </label>
                <label>Hasta:
                    <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                    />
                </label>
                <button onClick={cargarDatos}>Consultar</button>
            </div>

            {datos && (
                <>
                    <Chart options={chartOptions} series={series} type="pie" height={400} />
                    <table style={{ marginTop: '20px', width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Rango etario</th>
                                <th>Cantidad</th>
                                <th>Porcentaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {labels.map((rango) => (
                                <tr key={rango}>
                                    <td>{rango}</td>
                                    <td>{datos.rangos[rango]}</td>
                                    <td>{datos.porcentajes[rango]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p>Total: {datos.total} usuarios</p>
                </>
            )}
        </div>
    );
};

export default DistribucionEtaria;