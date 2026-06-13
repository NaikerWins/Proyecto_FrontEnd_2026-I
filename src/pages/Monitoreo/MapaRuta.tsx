import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { io, Socket } from 'socket.io-client';
import L from 'leaflet';

// Iconos (ajusta las URLs si es necesario)
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/309/309700.png',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const paraderoIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1237/1237888.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
});

function BusMarker({ bus }: { bus: any }) {
  return (
    <Marker position={[bus.ubicacion.lat, bus.ubicacion.lng]} icon={busIcon}>
      <Popup>
        <strong>{bus.placa}</strong><br />
        Destino: {bus.destino}<br />
        Ocupación: {bus.ocupacion}/{bus.capacidad}
      </Popup>
    </Marker>
  );
}

export default function MapaRuta({ rutaId, paraderos }: { rutaId: number; paraderos: any[] }) {
  const [buses, setBuses] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id || '';
    const socket = io('http://localhost:3000', { query: { userId } });
    socketRef.current = socket;

    socket.on(`ruta-${rutaId}-buses`, (data) => {
      setBuses(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [rutaId]);

  // Asegurar que el mapa tenga un centro definido (por si no hay paraderos)
  const defaultCenter: [number, number] = [5.070275, -75.513817]; // Manizales
  return (
    <MapContainer center={defaultCenter} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Paraderos */}
      {paraderos.map((p) => (
        <Marker key={p.id} position={[p.latitud, p.longitud]} icon={paraderoIcon}>
          <Popup>{p.nombre}</Popup>
        </Marker>
      ))}
      {/* Buses */}
      {buses.map((bus) => (
        <BusMarker key={bus.busId} bus={bus} />
      ))}
    </MapContainer>
  );
}