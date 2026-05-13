import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rutaService } from "../../services/rutaService";

export default function RutaParaderos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) cargar(parseInt(id));
  }, [id]);

  const cargar = async (rutaId: number) => {
    try {
      const res = await rutaService.getParaderos(rutaId);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center py-10">Cargando...</p>;
  if (!data) return <p className="text-center py-10">Ruta no encontrada.</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={() => navigate("/rutas")}
        className="mb-4 text-sm text-primary hover:underline"
      >
        ← Volver a rutas
      </button>

      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {data.ruta.nombre}
        </h1>
        {data.ruta.descripcion && (
          <p className="text-sm text-gray-500 mt-1">{data.ruta.descripcion}</p>
        )}
        <div className="flex gap-6 mt-3">
          <div>
            <span className="text-xs text-gray-400">Tarifa</span>
            <p className="font-bold text-primary text-lg">
              ${Number(data.ruta.tarifa).toLocaleString()}
            </p>
          </div>
          {data.ruta.tiempo_estimado && (
            <div>
              <span className="text-xs text-gray-400">Tiempo estimado</span>
              <p className="font-medium dark:text-white">
                {data.ruta.tiempo_estimado} minutos
              </p>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Paraderos en orden secuencial
      </h2>

      <div className="space-y-3">
        {data.paraderos.map((item: any, index: number) => (
          <div
            key={item.paradero.id}
            className="flex items-center gap-4 rounded border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">
              {item.orden}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 dark:text-white">
                {item.paradero.nombre}
              </p>
              {item.paradero.descripcion && (
                <p className="text-xs text-gray-400">{item.paradero.descripcion}</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-400">
              <p>Lat: {item.paradero.latitud}</p>
              <p>Lng: {item.paradero.longitud}</p>
            </div>
          </div>
        ))}
      </div>

      {data.paraderos.length === 0 && (
        <p className="text-center text-gray-500 py-6">
          Esta ruta no tiene paraderos registrados.
        </p>
      )}
    </div>
  );
}