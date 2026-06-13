
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ruta } from "../../models/Ruta";
import { rutaService } from "../../services/rutaService";

export default function RutasList() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async (nombre?: string) => {
    setLoading(true);
    try {
      const data = await rutaService.getRutas(nombre);
      setRutas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => cargar(busqueda || undefined);

  return (
    
    <div className="mx-auto max-w-7xl px-4 py-8">
      <button onClick={() => navigate("/")} className="mb-4 text-sm text-primary hover:underline">← Volver</button>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Rutas Disponibles
      </h1>

      {/* Buscador */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre de ruta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
          className="w-full rounded border border-stroke bg-white px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <button
          onClick={handleBuscar}
          className="rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90"
        >
          Buscar
        </button>
        {busqueda && (
          <button
            onClick={() => { setBusqueda(""); cargar(); }}
            className="rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:text-white"
          >
            Limpiar
          </button>
          
        )}
        <button className="rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90" onClick={() => navigate("/rutas/crear")}>
          Crear Ruta
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Cargando rutas...</p>
      ) : rutas.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron rutas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rutas.map((ruta) => (
            <div
              key={ruta.id}
              className="rounded-lg border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                {ruta.nombre}
              </h2>
              {ruta.descripcion && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {ruta.descripcion}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400">Tarifa</span>
                  <p className="text-base font-bold text-primary">
                    ${Number(ruta.tarifa).toLocaleString()}
                  </p>
                </div>
                {ruta.tiempo_estimado && (
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Tiempo est.</span>
                    <p className="text-sm font-medium dark:text-white">
                      {ruta.tiempo_estimado} min
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate(`/rutas/${ruta.id}/paraderos`)}
                className="mt-4 w-full rounded bg-primary py-2 text-sm font-medium text-white hover:bg-opacity-90"
              >
                Ver paraderos
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}