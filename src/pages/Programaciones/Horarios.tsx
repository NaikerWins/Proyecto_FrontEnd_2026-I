import { useState, useEffect } from 'react';
import api from '../../interceptors/busesInterceptor';
import { useNavigate } from 'react-router-dom';

interface Programacion {
    id: number;
    salida: string;
    estado: string;
    tolerancia: number;
    recurrencia: string;
    ruta?: { id: number; nombre: string; codigo: string; tarifa: number };
    bus?: { id: number; placa: string; modelo: string; capacidadSentados: number };
}

const Horarios = () => {
    const navigate = useNavigate();
    const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
    const [filtradas, setFiltradas] = useState<Programacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get('/programaciones');
                setProgramaciones(res.data);
                setFiltradas(res.data);
            } catch (error) {
                console.error('Error cargando horarios:', error);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        let resultado = programaciones;
        if (busqueda) {
            const b = busqueda.toLowerCase();
            resultado = resultado.filter(p =>
                p.ruta?.nombre?.toLowerCase().includes(b) ||
                p.ruta?.codigo?.toLowerCase().includes(b) ||
                p.bus?.placa?.toLowerCase().includes(b)
            );
        }
        if (filtroEstado) {
            resultado = resultado.filter(p => p.estado === filtroEstado);
        }
        setFiltradas(resultado);
    }, [busqueda, filtroEstado, programaciones]);

    const formatFecha = (fecha: string) => {
        if (!fecha) return '-';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-CO', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
            + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    };

    const estadoColor: Record<string, string> = {
        programado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        en_curso: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        completado: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        cancelado: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button onClick={() => navigate('/')} className="mb-2 text-sm text-primary hover:underline">← Volver</button>
                    <h2 className="text-title-md2 font-bold text-black dark:text-white">Horarios de Rutas</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Consulta los horarios disponibles</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{filtradas.length} horarios</span>
                </div>
            </div>

            {/* Filtros */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    placeholder="Buscar por ruta o placa..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="flex-1 rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
                />
                <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    className="rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
                >
                    <option value="">Todos los estados</option>
                    <option value="programado">Programado</option>
                    <option value="en_curso">En curso</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>

            {/* Tabla */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : filtradas.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                        No hay horarios disponibles
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                            <tr>
                                {['Ruta', 'Código', 'Bus', 'Salida', 'Tolerancia', 'Recurrencia', 'Estado', 'Tarifa'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map((p, i) => (
                                <tr key={p.id} className={`border-b border-stroke dark:border-strokedark ${i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-meta-4/20'}`}>
                                    <td className="px-4 py-3 font-medium text-black dark:text-white">{p.ruta?.nombre || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.ruta?.codigo || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.bus?.placa || '-'} — {p.bus?.modelo || ''}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatFecha(p.salida)}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.tolerancia ? `${p.tolerancia} min` : '-'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 capitalize">{p.recurrencia || 'Sin recurrencia'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${estadoColor[p.estado] || estadoColor.programado}`}>
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                        {p.ruta?.tarifa ? `$${p.ruta.tarifa.toLocaleString('es-CO')}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Horarios;