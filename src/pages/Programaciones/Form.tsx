import { useState, useEffect } from 'react';
import { programacionService } from '../../services/programacionService';
import { rutaService } from '../../services/rutaService';
import { busService } from '../../services/busService';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const FormProgramacion = () => {
    const navigate = useNavigate();
    const [salida, setSalida] = useState('');
    const [tolerancia, setTolerancia] = useState(0);
    const [recurrencia, setRecurrencia] = useState('');
    const [rutaId, setRutaId] = useState(0);
    const [busId, setBusId] = useState(0);
    const [rutas, setRutas] = useState<any[]>([]);
    const [buses, setBuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [rutasData, busesData] = await Promise.all([
                    rutaService.getAll(),
                    busService.getBuses(),
                ]);
                setRutas(rutasData);
                setBuses(busesData);
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
        };
        cargarDatos();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const nuevaProgramacion = {
                salida,
                tolerancia,
                recurrencia,
                ruta: { id: rutaId },
                bus: { id: busId },
            };
            await programacionService.createProgramacion(nuevaProgramacion as any);
            Swal.fire({ icon: 'success', title: '¡Creado!', text: 'Programación creada correctamente' });
            navigate('/programaciones');
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al crear la programación' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/programaciones')}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-3 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a Programaciones
                </button>
                <h2 className="text-title-md2 font-bold text-black dark:text-white">
                    Nueva Programación de Ruta
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Asigna un bus a una ruta en una fecha y hora específica
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Form */}
                <div className="xl:col-span-2">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">Datos de la Programación</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {/* Ruta */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                        Ruta <span className="text-meta-1">*</span>
                                    </label>
                                    <select
                                        value={rutaId}
                                        onChange={(e) => setRutaId(Number(e.target.value))}
                                        required
                                        className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    >
                                        <option value={0}>Seleccione una ruta</option>
                                        {rutas.map((ruta) => (
                                            <option key={ruta.id} value={ruta.id}>
                                                {ruta.nombre || ruta.name} — {ruta.codigo}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bus */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                        Bus <span className="text-meta-1">*</span>
                                    </label>
                                    <select
                                        value={busId}
                                        onChange={(e) => setBusId(Number(e.target.value))}
                                        required
                                        className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    >
                                        <option value={0}>Seleccione un bus</option>
                                        {buses.map((bus) => (
                                            <option key={bus.id} value={bus.id}>
                                                {bus.placa} — {bus.modelo}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fecha y hora */}
                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                        Fecha y hora de salida <span className="text-meta-1">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={salida}
                                        onChange={(e) => setSalida(e.target.value)}
                                        required
                                        className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>

                                {/* Recurrencia */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                        Recurrencia
                                    </label>
                                    <select
                                        value={recurrencia}
                                        onChange={(e) => setRecurrencia(e.target.value)}
                                        className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    >
                                        <option value="">Sin recurrencia</option>
                                        <option value="diaria">Diaria</option>
                                        <option value="lunes-viernes">Lunes a Viernes</option>
                                        <option value="fines-de-semana">Fines de Semana</option>
                                    </select>
                                </div>

                                {/* Tolerancia */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                        Tolerancia (minutos)
                                    </label>
                                    <input
                                        type="number"
                                        value={tolerancia}
                                        onChange={(e) => setTolerancia(Number(e.target.value))}
                                        min={0}
                                        max={30}
                                        className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Máximo 30 minutos</p>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 font-medium text-white hover:bg-opacity-90 transition-all disabled:opacity-60"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    Guardar Programación
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/programaciones')}
                                    className="inline-flex items-center justify-center rounded-md border border-stroke px-8 py-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormProgramacion;
