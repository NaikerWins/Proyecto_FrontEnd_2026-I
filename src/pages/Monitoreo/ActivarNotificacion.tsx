import { useState, useEffect, useRef } from 'react';
import { paraderoService } from '../../services/paraderoService';
import { rutaService } from '../../services/rutaService';
import { io, Socket } from 'socket.io-client';
import apiNest from '../../interceptors/axiosNest';
import { agregarNotificacion } from '../../services/notificationService';

export default function ActivarNotificacion() {
  const [rutas, setRutas] = useState<any[]>([]);
  const [paraderos, setParaderos] = useState<any[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<number | ''>('');
  const [paraderoSeleccionado, setParaderoSeleccionado] = useState<number | ''>('');
  const [minutos, setMinutos] = useState(5);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    rutaService.getAll().then(setRutas);
    // Escuchar notificaciones push
    const socket = io('http://localhost:3000', { query: { userId: JSON.parse(localStorage.getItem('user') || '{}').id } });
    socketRef.current = socket;
    socket.on('bus-cercano', (data) => {
  agregarNotificacion({
    titulo: '¡Tu bus está cerca!',
    mensaje: `El bus ${data.placa} de la ruta ${data.ruta} llegará en ${data.tiempoEstimado} min.`,
    tipo: 'bus-cercano',
  });
});
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (rutaSeleccionada) {
      rutaService.getParaderos(Number(rutaSeleccionada)).then(setParaderos);
    }
  }, [rutaSeleccionada]);

  const activar = async () => {
    if (!rutaSeleccionada || !paraderoSeleccionado) return;
    await apiNest.post('/monitoreo/suscripcion', {
      ruta_id: rutaSeleccionada,
      paradero_id: paraderoSeleccionado,
      minutos_anticipacion: minutos,
    });
    alert('Notificación activada');
  };

  return (
    <div className="p-4">
      <h2>Notificación de bus cercano</h2>
      <div className="space-y-2">
        <select value={rutaSeleccionada} onChange={e => setRutaSeleccionada(Number(e.target.value))} className="border p-2">
          <option value="">Selecciona ruta</option>
          {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
        <select value={paraderoSeleccionado} onChange={e => setParaderoSeleccionado(Number(e.target.value))} className="border p-2">
          <option value="">Selecciona paradero</option>
          {paraderos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select value={minutos} onChange={e => setMinutos(Number(e.target.value))} className="border p-2">
          <option value={5}>5 min</option>
          <option value={10}>10 min</option>
          <option value={15}>15 min</option>
        </select>
        <button onClick={activar} className="bg-green-500 text-white px-4 py-2 rounded">Activar notificación</button>
      </div>
    </div>
  );
}