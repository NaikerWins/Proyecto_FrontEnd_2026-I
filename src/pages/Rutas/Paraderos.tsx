import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";

import { rutaService } from "../../services/rutaService";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

export default function RutaParaderos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ruta, setRuta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [miUbicacion, setMiUbicacion] = useState<{
  lat: number;
  lng: number;
} | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  useEffect(() => {
    const cargarRuta = async () => {
      try {
        if (id) {
          const response = await rutaService.getById(parseInt(id));
          setRuta(response);
        }
      } catch (error) {
        console.error(error);
        setRuta(null);
      } finally {
        setLoading(false);
      }
    };

    cargarRuta();
  }, [id]);

  useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setMiUbicacion({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      console.log("No se pudo obtener ubicación", error);
    }
  );
}, []);

  if (loading) {
    return <p className="text-center py-10">Cargando...</p>;
  }

  if (!ruta) {
    return <p className="text-center py-10">Ruta no encontrada.</p>;
  }

  // ORDENAR NODOS POR ORDEN
  const nodosOrdenados = [...(ruta?.nodos || [])].sort(
    (a: any, b: any) => a.orden - b.orden
  );

  // PUNTOS DEL MAPA
  const puntos = nodosOrdenados.map((nodo: any) => ({
    lat: Number(nodo.paradero?.latitud),
    lng: Number(nodo.paradero?.longitud),
  }));

  const centro =
    puntos.length > 0
      ? puntos[0]
      : { lat: 5.0689, lng: -75.5174 };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={() => navigate("/rutas")}
        className="mb-4 text-sm text-primary hover:underline"
      >
        ← Volver a rutas
      </button>

      {/* INFO RUTA */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {ruta.nombre}
        </h1>

        {ruta.descripcion && (
          <p className="text-sm text-gray-500 mt-1">
            {ruta.descripcion}
          </p>
        )}

        <div className="flex gap-6 mt-3">
          <div>
            <span className="text-xs text-gray-400">Tarifa</span>

            <p className="font-bold text-primary text-lg">
              ${Number(ruta.tarifa).toLocaleString()}
            </p>
          </div>

          {ruta.tiempo_estimado && (
            <div>
              <span className="text-xs text-gray-400">
                Tiempo estimado
              </span>

              <p className="font-medium dark:text-white">
                {ruta.tiempo_estimado} minutos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MAPA */}
      {isLoaded && puntos.length > 0 && (
        <div className="rounded-lg overflow-hidden border border-stroke mb-6">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={centro}
            zoom={14}
          >
            {/* MARCADORES */}
            {nodosOrdenados.map((nodo: any, i: number) => (
              <Marker
                key={nodo.id}
                position={{
                  lat: Number(nodo.paradero?.latitud),
                  lng: Number(nodo.paradero?.longitud),
                }}
                label={{
                  text: String(nodo.orden),
                  color: "white",
                }}
                onClick={() => setSelectedMarker(nodo)}
              />
            ))}

            {/* INFO WINDOW */}
            {selectedMarker && (
              <InfoWindow
                position={{
                  lat: Number(selectedMarker.paradero?.latitud),
                  lng: Number(selectedMarker.paradero?.longitud),
                }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="min-w-[150px]">
                  <h3 className="font-bold text-sm">
                    {selectedMarker.paradero?.nombre}
                  </h3>

                  <p className="text-xs text-gray-600">
                    Orden: {selectedMarker.orden}
                  </p>

                  {selectedMarker.tiempoEstimado && (
                    <p className="text-xs text-gray-600">
                      Tiempo: {selectedMarker.tiempoEstimado} min
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}

            {/* Mi ubicación */}
{miUbicacion && (
  <Marker
    position={miUbicacion}
    label={{
      text: "YO",
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: "bold",
    }}
  />
)}

            {/* LINEA DE LA RUTA */}
            {puntos.length > 1 && (
              <Polyline
                path={puntos}
                options={{
                  strokeColor: "#3b82f6",
                  strokeWeight: 4,
                }}
              />
            )}
          </GoogleMap>
        </div>
      )}

      {/* LISTA PARADEROS */}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Paraderos en orden secuencial
      </h2>

      <div className="space-y-3">
        {nodosOrdenados.length > 0 ? (
          nodosOrdenados.map((nodo: any) => (
            <div
              key={nodo.id}
              className="flex items-center gap-4 rounded border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">
                {nodo.orden}
              </div>

              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">
                  {nodo.paradero?.nombre}
                </p>

                {nodo.paradero?.descripcion && (
                  <p className="text-xs text-gray-400">
                    {nodo.paradero.descripcion}
                  </p>
                )}
              </div>

              <div className="text-right text-xs text-gray-400">
                <p>
                  Lat:{" "}
                  {Number(nodo.paradero?.latitud).toFixed(5)}
                </p>

                <p>
                  Lng:{" "}
                  {Number(nodo.paradero?.longitud).toFixed(5)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded border border-stroke bg-white p-4 text-sm text-gray-500 dark:border-strokedark dark:bg-boxdark">
            Esta ruta no tiene paraderos registrados.
          </div>
        )}
      </div>
    </div>
  );
}