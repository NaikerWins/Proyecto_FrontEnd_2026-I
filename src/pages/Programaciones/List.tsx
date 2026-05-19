import React, { useEffect, useState } from 'react';
import GenericTable from '../../components/Generics/GenericList';
import { Programacion } from '../../models/Programacion';
import { programacionService } from '../../services/programacionService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const ListProgramaciones: React.FC = () => {
    const navigate = useNavigate();
    const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await programacionService.getProgramaciones();
            setProgramaciones(data);
        } catch (error) {
            console.error('Error cargando programaciones:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las programaciones' });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string, item: Programacion) => {
        if (action === 'edit') {
            navigate(`/programaciones/edit/${item.id}`);
        } else if (action === 'delete') {
            const result = await Swal.fire({
                title: '¿Eliminar programación?',
                text: 'Esta acción no se puede deshacer',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3C50E0',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            });
            if (result.isConfirmed) {
                try {
                    await programacionService.deleteProgramacion(String(item.id));
                    Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Programación eliminada correctamente' });
                    fetchData();
                } catch {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la programación' });
                }
            }
        }
    };

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                <button onClick={() => navigate("/")} className="mb-4 text-sm text-primary hover:underline">← Volver</button>
                    <h2 className="text-title-md2 font-bold text-black dark:text-white">
                        Programaciones de Ruta
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona la asignación de buses a rutas
                    </p>
                </div>
                <button
                    onClick={() => navigate('/programaciones/crear')}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Programación
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                <div className="rounded-sm border border-stroke bg-white px-6 py-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-xl font-bold text-black dark:text-white">{programaciones.length}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-sm border border-stroke bg-white px-6 py-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                            <svg className="w-5 h-5 text-meta-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Programadas</p>
                            <p className="text-xl font-bold text-black dark:text-white">
                                {programaciones.filter(p => p.estado === 'activa').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-sm border border-stroke bg-white px-6 py-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                            <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Recurrentes</p>
                            <p className="text-xl font-bold text-black dark:text-white">
                                {programaciones.filter(p => p.recurrencia).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="px-6 py-4 border-b border-stroke dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">Lista de Programaciones</h3>
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <GenericTable
                            data={programaciones}
                            columns={['id', 'salida', 'estado', 'tolerancia', 'recurrencia']}
                            actions={[
                                { name: 'edit', label: 'Editar', color: 'info' },
                                { name: 'delete', label: 'Eliminar', color: 'error' },
                            ]}
                            onAction={handleAction}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListProgramaciones;