import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { io, Socket } from 'socket.io-client';
import L from 'leaflet';
import { agregarNotificacion } from '../../services/notificationService';

const normalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const incidenteIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function PanelSupervisor() {
  const [datos, setDatos] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

socket.on('panel-estado', (data) => {
  console.log('Datos del panel recibidos:', data);
  setDatos(data);

  // Notificación de buses con ocupación máxima
  if (data.alertasOcupacion && data.alertasOcupacion.length > 0) {
    agregarNotificacion({
      titulo: '⚠️ Buses con ocupación máxima',
      mensaje: `${data.alertasOcupacion.length} bus(es) han alcanzado su capacidad máxima.`,
      tipo: 'general',
    });
  }
});

    // ✅ CORREGIDO: el fallback REST ahora llama a los 4 endpoints
    // y arma el mismo shape que emite el WebSocket
    const timeout = setTimeout(async () => {
      if (!datos) {
        try {
          const [estadoRes, pasajerosRes, incidentesRes, alertasRes] = await Promise.all([
            fetch('http://localhost:3000/monitoreo/estado').then(r => r.json()),
            fetch('http://localhost:3000/monitoreo/pasajeros').then(r => r.json()),
            fetch('http://localhost:3000/incidentes/activos').then(r => r.json()).catch(() => []),
            fetch('http://localhost:3000/monitoreo/alertas-ocupacion').then(r => r.json()).catch(() => []),
          ]);

          setDatos({
            // ✅ Garantiza que estado siempre es un array
            estado: Array.isArray(estadoRes) ? estadoRes : [],
            pasajeros: typeof pasajerosRes === 'number' ? pasajerosRes : 0,
            incidentes: Array.isArray(incidentesRes) ? incidentesRes : [],
            alertasOcupacion: Array.isArray(alertasRes) ? alertasRes : [],
          });
        } catch (e) {
          console.error('Error cargando panel por REST', e);
          // ✅ Evita que el componente quede en blanco indefinidamente
          setDatos({ estado: [], pasajeros: 0, incidentes: [], alertasOcupacion: [] });
        }
      }
    }, 5000);

    return () => {
      socket.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  if (!datos) {
    return <div className="p-4">Cargando panel...</div>;
  }

  // ✅ CORREGIDO: desestructura con fallback a array vacío para cada campo
  const estado: any[] = Array.isArray(datos.estado) ? datos.estado : [];
  const pasajeros: number = datos.pasajeros ?? 0;
  const incidentes: any[] = Array.isArray(datos.incidentes) ? datos.incidentes : [];
  const alertasOcupacion: any[] = Array.isArray(datos.alertasOcupacion) ? datos.alertasOcupacion : [];

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-500 text-white p-4 rounded">
        Pasajeros en tránsito: {pasajeros}
      </div>
      <div className="bg-red-500 text-white p-4 rounded">
        Incidentes activos: {incidentes.length}
      </div>
      <div className="bg-orange-500 text-white p-4 rounded">
        Alertas ocupación: {alertasOcupacion.length}
      </div>

      <div className="col-span-1 md:col-span-4">
        <MapContainer center={[5.070275, -75.513817]} zoom={13} style={{ height: '500px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {estado.map((bus: any) => {
            if (!bus.ubicacion) return null;
            const tieneIncidente = incidentes.some((i: any) => i.bus?.id === bus.busId);
            const icon = tieneIncidente ? incidenteIcon : normalIcon;
            return (
              <Marker
                key={bus.busId}
                position={[bus.ubicacion.lat, bus.ubicacion.lng]}
                icon={icon}
              >
                <Popup>
                  <strong>{bus.placa}</strong><br />
                  Ruta: {bus.ruta}<br />
                  Ocupación: {bus.ocupacion}/{bus.capacidad}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="col-span-1 md:col-span-4">
        <h3 className="text-xl font-bold">Incidentes activos</h3>
        <ul>
          {incidentes.map((inc: any) => (
            <li key={inc.id} className="border p-2 mb-1">
              {inc.tipo} - {inc.descripcion} (Bus: {inc.bus?.placa})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}