import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paraderoService } from "../../services/paraderoService";
import { Paradero } from "../../models/Paradero";


export default function ParaderosList() {
  const [paraderos, setParaderos] = useState<Paradero[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const data = await paraderoService.getAll();
      setParaderos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este paradero?")) return;
    try {
      await paraderoService.remove(id);
      setParaderos(paraderos.filter(p => p.id !== id));
    } catch (e) {
      alert("Error al eliminar.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
       <button onClick={() => navigate("/")} className="mb-4 text-sm text-primary hover:underline">← Volver</button> 
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Paraderos</h1>
        <button onClick={() => navigate("/paraderos/cercanos")}
          className="rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90">
          Paraderos Cercanos
        </button>
        <button onClick={() => navigate("/paraderos/crear")}
          className="rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90">
          + Nuevo paradero
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : paraderos.length === 0 ? (
        <p className="text-center text-gray-500">No hay paraderos registrados.</p>
      ) : (
        <div className="rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-meta-4">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white">Latitud</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white">Longitud</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paraderos.map(p => (
                <tr key={p.id} className="border-t border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4">
                  <td className="px-4 py-3 dark:text-white">{p.id}</td>
                  <td className="px-4 py-3 dark:text-white font-medium">{p.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{p.latitud}</td>
                  <td className="px-4 py-3 text-gray-500">{p.longitud}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => p.id && eliminar(p.id)}
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