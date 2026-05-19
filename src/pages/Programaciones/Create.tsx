import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { programacionService } from "../../services/programacionService";
import { rutaService } from "../../services/rutaService";
import { Ruta } from "../../models/Ruta";

export default function CreateProgramacion() {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [form, setForm] = useState({
    bus_id: "", conductor_id: "", capacidad_maxima: "", ruta_id: "", estado: "activa",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { rutaService.getAll().then(setRutas); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await programacionService.create({
        bus_id: parseInt(form.bus_id),
        conductor_id: parseInt(form.conductor_id),
        capacidad_maxima: parseInt(form.capacidad_maxima),
        ruta_id: parseInt(form.ruta_id),
        estado: form.estado,
        ocupacion_actual: 0,
      });
      navigate("/programaciones");
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al crear programación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <button onClick={() => navigate("/programaciones")} className="mb-4 text-sm text-primary hover:underline">
        ← Volver
      </button>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Nueva Programación</h1>

      <div className="rounded border border-yellow-200 bg-yellow-50 px-4 py-2 text-xs text-yellow-700 mb-4">
        ⚠️ Bus y Conductor son IDs del módulo de transporte. Asegúrate de que existan en el sistema.
      </div>

      <form onSubmit={handleSubmit}
        className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark space-y-4">

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">ID del Bus *</label>
          <input type="number" value={form.bus_id} required
            onChange={(e) => setForm({ ...form, bus_id: e.target.value })}
            placeholder="Ej: 1"
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">ID del Conductor *</label>
          <input type="number" value={form.conductor_id} required
            onChange={(e) => setForm({ ...form, conductor_id: e.target.value })}
            placeholder="Ej: 1"
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Capacidad máxima *</label>
          <input type="number" value={form.capacidad_maxima} required min={1}
            onChange={(e) => setForm({ ...form, capacidad_maxima: e.target.value })}
            placeholder="Ej: 40"
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Ruta *</label>
          <select value={form.ruta_id} required
            onChange={(e) => setForm({ ...form, ruta_id: e.target.value })}
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white">
            <option value="">Seleccionar ruta...</option>
            {rutas.map(r => (
              <option key={r.id} value={r.id}>
                {r.nombre} — ${Number(r.tarifa).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Estado</label>
          <select value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white">
            <option value="activa">Activa</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full rounded bg-primary py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60">
          {loading ? "Guardando..." : "Crear Programación"}
        </button>
      </form>
    </div>
  );
}