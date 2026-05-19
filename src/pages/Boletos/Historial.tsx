import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { boletoService } from '../../services/boletoService';
import { HistorialViaje } from '../../models/Historial';
// Iconos personalizados para abordaje/descenso
const iconAbordaje = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const iconDescenso = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const iconNormal = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Historial() {
  const [viajes, setViajes] = useState<HistorialViaje[]>([]);
  const [selected, setSelected] = useState<HistorialViaje | null>(null);

  useEffect(() => {
    // Obtener el id del usuario logueado
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const ciudadanoId = user?.id;
    if (ciudadanoId) {
      boletoService.getHistorial(ciudadanoId).then(setViajes);
    }
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString();

  if (selected) {
    const { ruta } = selected;
    const posiciones: [number, number][] = ruta.paraderos_completos.map(
  (p) => [p.latitud, p.longitud]
);
const centro: [number, number] =
  posiciones.length > 0
    ? posiciones[Math.floor(posiciones.length / 2)]
    : [4.6097, -74.0817]; // fallback Bogotá
    return (
      <div className="p-4">
        <button onClick={() => setSelected(null)} className="mb-4 text-sm text-primary hover:underline">
          ← Volver al historial
        </button>

        <h2 className="text-xl font-bold mb-4">Detalle del viaje</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p><strong>Boleto:</strong> #{selected.boleto_id}</p>
            <p><strong>Abordaje:</strong> {formatDate(selected.fecha_abordaje)}</p>
            <p><strong>Descenso:</strong> {selected.fecha_descenso ? formatDate(selected.fecha_descenso) : '—'}</p>
            <p><strong>Tiempo total:</strong> {selected.tiempo_total_minutos} min</p>
          </div>
          <div>
            <p><strong>Bus placa:</strong> {selected.bus_placa || 'No disponible'}</p>
            <p><strong>Conductor:</strong> {selected.conductor_nombre || 'No disponible'}</p>
            <p><strong>Paradero abordaje:</strong> {selected.paradero_abordaje?.nombre}</p>
            <p><strong>Paradero descenso:</strong> {selected.paradero_descenso?.nombre || '—'}</p>
          </div>
        </div>

        <div style={{ height: '400px', width: '100%' }}>
          <MapContainer center={centro} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Línea de la ruta */}
            <Polyline positions={posiciones} color="blue" />

            {/* Marcadores de todos los paraderos */}
            {ruta.paraderos_completos.map((p) => (
              <Marker key={p.id} position={[p.latitud, p.longitud]} icon={iconNormal}>
                <Popup>{p.nombre}</Popup>
              </Marker>
            ))}

            {/* Marcador de abordaje (verde) */}
            {selected.paradero_abordaje && (
  <Marker
    position={[selected.paradero_abordaje.latitud, selected.paradero_abordaje.longitud]}
    icon={iconAbordaje}
  >
                <Popup>
                  <strong>Abordaje</strong><br />
                  {selected.paradero_abordaje.nombre}<br />
                  {formatDate(selected.fecha_abordaje)}
                </Popup>
              </Marker>
            )}

            {/* Marcador de descenso (rojo) */}
            {selected.paradero_descenso && (
  <Marker
    position={[selected.paradero_descenso.latitud, selected.paradero_descenso.longitud]}
    icon={iconDescenso}
  >
                <Popup>
                  <strong>Descenso</strong><br />
                  {selected.paradero_descenso.nombre}<br />
                  {selected.fecha_descenso && formatDate(selected.fecha_descenso)}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    );
  }

  // Vista de lista
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Historial de Viajes</h1>
      {viajes.length === 0 ? (
        <p className="text-gray-500">Aún no has realizado viajes completados.</p>
      ) : (
        <div className="space-y-3">
          {viajes.map((v) => (
            <div
              key={v.boleto_id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-strokedark"
              onClick={() => setSelected(v)}
            >
              <div className="flex justify-between">
                <span className="font-medium">Boleto #{v.boleto_id}</span>
                <span className="text-sm text-gray-500">{formatDate(v.fecha_abordaje)}</span>
              </div>
              <p className="text-sm">
                {v.ruta?.nombre} — ${v.monto?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                {v.paradero_abordaje?.nombre} → {v.paradero_descenso?.nombre || 'En curso'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}