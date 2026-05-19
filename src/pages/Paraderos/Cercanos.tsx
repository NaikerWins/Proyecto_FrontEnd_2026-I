import { useState } from "react";
import { paraderoService } from "../../services/paraderoService";
import { ParaderoCercano } from "../../models/Paradero";
import { useNavigate } from "react-router-dom";

export default function ParaderosCercanos() {
  const navigate = useNavigate();
  const [paraderos, setParaderos] = useState<ParaderoCercano[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ubicacionObtenida, setUbicacionObtenida] = useState(false);

  const buscarCercanos = () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const data = await paraderoService.getCercanos(latitude, longitude);
          setParaderos(data);
          setUbicacionObtenida(true);
        } catch (e) {
          setError("Error al obtener paraderos cercanos.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("No se pudo acceder a tu ubicación. Verifica los permisos del navegador.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={() => navigate("/paraderos/lista")} className="mb-4 text-sm text-primary hover:underline">← Volver</button>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        Paraderos Cercanos
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Encuentra los 5 paraderos más cercanos a tu ubicación actual.
      </p>

      <button
        onClick={buscarCercanos}
        disabled={loading}
        className="rounded bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60 mb-6"
      >
        {loading ? "Obteniendo ubicación..." : "📍 Buscar paraderos cerca de mí"}
      </button>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {ubicacionObtenida && paraderos.length === 0 && !loading && (
        <p className="text-gray-500 text-center py-6">
          No se encontraron paraderos cercanos.
        </p>
      )}

      <div className="space-y-4">
        {paraderos.map((p, i) => (
          <div
            key={p.id}
            className="rounded-lg border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                  {i + 1}
                </span>
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  {p.nombre}
                </h2>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {p.distancia_metros} m
              </span>
            </div>

            {p.descripcion && (
              <p className="text-xs text-gray-400 mb-3 ml-11">{p.descripcion}</p>
            )}

            {p.rutas && p.rutas.length > 0 && (
              <div className="ml-11">
                <p className="text-xs text-gray-400 mb-1">Rutas que pasan:</p>
                <div className="flex flex-wrap gap-2">
                  {p.rutas.map((r) => (
                    <span
                      key={r.id}
                      className="rounded-full bg-blue-100 px-3 py-0.5 text-xs text-blue-700"
                    >
                      {r.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}