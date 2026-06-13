import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import apiNest from '../../interceptors/axiosNest';
import { agregarNotificacion } from '../../services/notificationService';

export default function ConfiguracionClima() {
  const [alertsActive, setAlertsActive] = useState(true);
  const [horaViaje, setHoraViaje] = useState('07:00');
  const [ciudad, setCiudad] = useState('Bogotá');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3000', { query: { userId: JSON.parse(localStorage.getItem('user') || '{}').id } });
    socketRef.current = socket;
    socket.on('alerta-clima', (mensaje) => {
  agregarNotificacion({
    titulo: 'Alerta de Clima',
    mensaje: mensaje,
    tipo: 'alerta-clima',
  });
});
    return () => { socket.disconnect(); };
  }, []);

  const guardar = async () => {
    await apiNest.post('/monitoreo/preferencias-clima', {
      alertas_activas: alertsActive,
      horario_viaje: horaViaje,
      ciudad,
    });
    alert('Preferencias guardadas');
  };

  return (
    <div className="p-4">
      <h2>Alertas de clima</h2>
      <div className="space-y-2">
        <label>
          Activar alertas:
          <input type="checkbox" checked={alertsActive} onChange={e => setAlertsActive(e.target.checked)} />
        </label>
        <label>
          Hora habitual de viaje:
          <input type="time" value={horaViaje} onChange={e => setHoraViaje(e.target.value)} />
        </label>
        <label>
          Ciudad:
          <input type="text" value={ciudad} onChange={e => setCiudad(e.target.value)} />
        </label>
        <button onClick={guardar} className="bg-blue-500 text-white px-4 py-2 rounded">Guardar</button>
      </div>
    </div>
  );
}