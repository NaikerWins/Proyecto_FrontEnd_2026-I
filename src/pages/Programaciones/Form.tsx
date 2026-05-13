import { useState, useEffect } from 'react';
import { programacionService } from '../../services/programacionService';
import { rutaService } from '../../services/rutaService';
import { busService } from '../../services/busService';

const FormProgramacion = () => {
    // Estados para los campos del formulario
    const [salida, setSalida] = useState('');
    const [tolerancia, setTolerancia] = useState(0);
    const [recurrencia, setRecurrencia] = useState('');
    const [rutaId, setRutaId] = useState(0);
    const [busId, setBusId] = useState(0);

    // Estados para cargar las opciones de los selectores
    const [rutas, setRutas] = useState<any[]>([]);
    const [buses, setBuses] = useState<any[]>([]);

    // Cargar rutas y buses al montar el componente
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const rutasData = await rutaService.getRutas();
                const busesData = await busService.getBuses();

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

        try {
            const nuevaProgramacion = {
                salida,
                tolerancia,
                recurrencia,
                ruta: { id: rutaId },
                bus: { id: busId },
            };

            await programacionService.createProgramacion(nuevaProgramacion as any);
            alert('Programación creada correctamente');

            // Limpiar formulario
            setSalida('');
            setTolerancia(0);
            setRecurrencia('');
            setRutaId(0);
            setBusId(0);

        } catch (error) {
            console.error('Error creando programación:', error);
            alert('Ocurrió un error al crear la programación');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Hora de salida:</label>
                <input
                    type="datetime-local"
                    value={salida}
                    onChange={(e) => setSalida(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Tolerancia:</label>
                <input
                    type="number"
                    value={tolerancia}
                    onChange={(e) => setTolerancia(Number(e.target.value))}
                    required
                />
            </div>

            <div>
                <label>Recurrencia:</label>
                <input
                    type="text"
                    value={recurrencia}
                    onChange={(e) => setRecurrencia(e.target.value)}
                    placeholder="Ej: diaria, semanal"
                    required
                />
            </div>

            <div>
                <label>Ruta:</label>
                <select
                    value={rutaId}
                    onChange={(e) => setRutaId(Number(e.target.value))}
                    required
                >
                    <option value={0}>Seleccione una ruta</option>

                    {rutas.map((ruta) => (
                        <option key={ruta.id} value={ruta.id}>
                            {ruta.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Bus:</label>
                <select
                    value={busId}
                    onChange={(e) => setBusId(Number(e.target.value))}
                    required
                >
                    <option value={0}>Seleccione un bus</option>

                    {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                            {bus.placa}
                        </option>
                    ))}
                </select>
            </div>

            <button type="submit">Guardar</button>
        </form>
    );
};

export default FormProgramacion;