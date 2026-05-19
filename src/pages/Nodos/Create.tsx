import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { nodoService } from "../../services/nodoService";
import { rutaService } from "../../services/rutaService";
import { paraderoService, Paradero } from "../../services/paraderoService";
import { Ruta } from "../../models/Ruta";

export default function CreateNodo() {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [paraderos, setParaderos] = useState<Paradero[]>([]);
  const [form, setForm] = useState({ ruta_id: "", paradero_id: "", orden: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([rutaService.getAll(), paraderoService.getAll()])
      .then(([r, p]) => { setRutas(r); setParaderos(p); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await nodoService.create({
        ruta_id: parseInt(form.ruta_id),
        paradero_id: parseInt(form.paradero_id),
        orden: parseInt(form.orden),
      });
      navigate("/rutas");
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al asignar paradero.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <button onClick={() => navigate("/rutas")} className="mb-4 text-sm text-primary hover:underline">
        ← Volver
      </button>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Asignar Paradero a Ruta</h1>

      <form onSubmit={handleSubmit} className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Ruta *</label>
          <select name="ruta_id" value={form.ruta_id}
            onChange={(e) => setForm({ ...form, ruta_id: e.target.value })} required
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white">
            <option value="">Seleccionar ruta...</option>
            {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Paradero *</label>
          <select name="paradero_id" value={form.paradero_id}
            onChange={(e) => setForm({ ...form, paradero_id: e.target.value })} required
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white">
            <option value="">Seleccionar paradero...</option>
            {paraderos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Orden *</label>
          <input name="orden" type="number" value={form.orden}
            onChange={(e) => setForm({ ...form, orden: e.target.value })} required min={1}
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        </div>

        {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <button type="submit" disabled={loading}
          className="w-full rounded bg-primary py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60">
          {loading ? "Guardando..." : "Asignar Paradero"}
        </button>
      </form>
    </div>
  );
}