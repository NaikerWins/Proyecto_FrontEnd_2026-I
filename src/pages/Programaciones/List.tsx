import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { programacionService, Programacion } from "../../services/programacionService";

export default function ProgramacionesList() {
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const data = await programacionService.getAll();
      setProgramaciones(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar esta programación?")) return;
    try {
      await programacionService.remove(id);
      setProgramaciones(programaciones.filter(p => p.id !== id));
    } catch {
      alert("Error al eliminar.");
    }
  };

  const estadoColor = (estado: string) =>
    estado === "activa" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button onClick={() => navigate("/")} className="mb-4 text-sm text-primary hover:underline">← Volver</button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Programaciones</h1>
        <button onClick={() => navigate("/programaciones/crear")}
          className="rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90">
          + Nueva programación
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : programaciones.length === 0 ? (
        <p className="text-center text-gray-500">No hay programaciones registradas.</p>
      ) : (
        <div className="rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-meta-4">
              <tr>
                {["ID", "Bus", "Conductor", "Ruta", "Estado", "Ocupación", "Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programaciones.map(p => (
                <tr key={p.id} className="border-t border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4">
                  <td className="px-4 py-3 dark:text-white">{p.id}</td>
                  <td className="px-4 py-3 dark:text-white">Bus #{p.bus_id}</td>
                  <td className="px-4 py-3 dark:text-white">#{p.conductor_id}</td>
                  <td className="px-4 py-3 dark:text-white">#{p.ruta_id}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estadoColor(p.estado)}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 dark:text-white">
                    {p.ocupacion_actual}/{p.capacidad_maxima}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => eliminar(p.id)}
                      className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}