import { useEffect, useState } from "react";
import { metodoPagoService } from "../../services/metodoPagoService";
import { MetodoPago } from "../../models/MetodoPago";

const TIPOS_SUGERIDOS = ["prepagado", "debito", "credito", "efectivo"];

export default function TiposList() {
  const [tipos, setTipos] = useState<MetodoPago[]>([]);
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setTipos(await metodoPagoService.getAllTipos()); } catch {}
  };

  const crear = async (tipo: string) => {
    if (!tipo.trim()) return;
    setLoading(true); setError("");
    try {
      await metodoPagoService.createTipo(tipo.trim().toLowerCase());
      await cargar();
      setNuevoTipo("");
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al crear tipo.");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Tipos de Métodos de Pago</h1>

      {/* Tipos sugeridos */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3">Tipos sugeridos:</p>
        <div className="flex flex-wrap gap-2">
          {TIPOS_SUGERIDOS.filter(t => !tipos.find(ex => ex.tipo === t)).map(t => (
            <button key={t} onClick={() => crear(t)}
              className="rounded-full border border-primary px-4 py-1 text-sm text-primary hover:bg-primary hover:text-white transition">
              + {t}
            </button>
          ))}
        </div>
      </div>

      {/* Crear tipo personalizado */}
      <div className="flex gap-2 mb-6">
        <input value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)}
          placeholder="Tipo personalizado..."
          onKeyDown={(e) => e.key === "Enter" && crear(nuevoTipo)}
          className="flex-1 rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        <button onClick={() => crear(nuevoTipo)} disabled={loading}
          className="rounded bg-primary px-5 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60">
          Crear
        </button>
      </div>

      {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600 mb-4">{error}</div>}

      {/* Lista de tipos */}
      <div className="rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-meta-4">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white">ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {tipos.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-400">No hay tipos registrados</td></tr>
            ) : tipos.map(t => (
              <tr key={t.id} className="border-t border-stroke dark:border-strokedark">
                <td className="px-4 py-3 text-gray-500">{t.id}</td>
                <td className="px-4 py-3 font-medium dark:text-white capitalize">{t.tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}