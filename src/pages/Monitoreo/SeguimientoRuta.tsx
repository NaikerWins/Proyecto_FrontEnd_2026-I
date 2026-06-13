import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MapaRuta from './MapaRuta';
import { rutaService } from '../../services/rutaService';
import { paraderoService } from '../../services/paraderoService';
import { boletoService } from '../../services/boletoService'; // si necesitas

export default function SeguimientoRuta() {
  const { rutaId } = useParams<{ rutaId: string }>();
  const [paraderos, setParaderos] = useState<any[]>([]);
  const [paraderoSeleccionado, setParaderoSeleccionado] = useState<number | null>(null);
  const [eta, setEta] = useState<any>(null);

  useEffect(() => {
    if (rutaId) {
      rutaService.getParaderos(Number(rutaId)).then(setParaderos);
    }
  }, [rutaId]);

  const consultarETA = async () => {
    if (!paraderoSeleccionado || !rutaId) return;
    try {
      const res = await rutaService.estimarLlegada(Number(rutaId), paraderoSeleccionado);
      setEta(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Seguimiento de Ruta</h1>
      <div className="mb-4">
        <label className="mr-2">Selecciona tu paradero:</label>
        <select
          value={paraderoSeleccionado || ''}
          onChange={(e) => setParaderoSeleccionado(Number(e.target.value))}
          className="border p-2"
        >
          <option value="">--</option>
          {paraderos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <button onClick={consultarETA} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">Calcular llegada</button>
      </div>

      {eta && (
        <div className="bg-green-100 p-3 mb-4 rounded">
          <p><strong>Bus {eta.placa}</strong></p>
          <p>Tiempo estimado: {eta.tiempo_estimado_min} min</p>
          <p>Distancia: {eta.distancia_km} km</p>
        </div>
      )}

      <MapaRuta rutaId={Number(rutaId)} paraderos={paraderos} />
    </div>
  );
}