import React, { useEffect, useState } from 'react';
import GenericTable from '../../components/Generics/GenericList';
import { Programacion } from '../../models/Programacion';
import { programacionService } from '../../services/programacionService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const ListProgramaciones: React.FC = () => {
    const navigate = useNavigate();
    const [programaciones, setProgramaciones] = useState<Programacion[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await programacionService.getProgramaciones();
            setProgramaciones(data);
        } catch (error) {
            console.error('Error cargando programaciones:', error);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las programaciones',
            });
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
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            });

            if (result.isConfirmed) {
                try {
                    await programacionService.deleteProgramacion(String(item.id));

                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'La programación fue eliminada correctamente',
                    });

                    fetchData();
                } catch (error) {
                    console.error('Error eliminando programación:', error);

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo eliminar la programación',
                    });
                }
            }
        }
    };

    const columns = ['id', 'salida', 'tolerancia', 'recurrencia'];

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Lista de Programaciones</h2>

                <Button
                    variant="primary"
                    onClick={() => navigate('/programaciones/create')}
                >
                    Crear Programación
                </Button>
            </div>

            <GenericTable
                data={programaciones}
                columns={columns}
                actions={[
                    { name: 'edit', label: 'Editar', color: 'info' },
                    { name: 'delete', label: 'Eliminar', color: 'error' },
                ]}
                onAction={handleAction}
            />
        </div>
    );
};

export default ListProgramaciones;