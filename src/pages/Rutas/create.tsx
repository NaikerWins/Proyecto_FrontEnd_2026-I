import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { rutaService } from "../../services/rutaService";
import { paraderoService, Paradero } from "../../services/paraderoService";

export default function CreateRuta() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", descripcion: "", tarifa: "", tiempo_estimado: "" });
  const [paraderos, setParaderos] = useState<Paradero[]>([]);
  const [nodosSeleccionados, setNodosSeleccionados] = useState<{ paraderoId: number; orden: number; nombre: string }[]>([]);
  const [paraderoSeleccionado, setParaderoSeleccionado] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { paraderoService.getAll().then(setParaderos); }, []);

  const agregarParadero = () => {
    if (!paraderoSeleccionado) return;
    const id = parseInt(paraderoSeleccionado);
    if (nodosSeleccionados.find(n => n.paraderoId === id)) { setError("Paradero ya agregado"); return; }
    const paradero = paraderos.find(p => p.id === id);
    if (!paradero) return;
    setNodosSeleccionados([...nodosSeleccionados, { paraderoId: id, orden: nodosSeleccionados.length + 1, nombre: paradero.nombre! }]);
    setParaderoSeleccionado("");
    setError("");
  };

  const quitarParadero = (index: number) => {
    const nuevos = nodosSeleccionados.filter((_, i) => i !== index).map((n, i) => ({ ...n, orden: i + 1 }));
    setNodosSeleccionados(nuevos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nodosSeleccionados.length < 3) { setError("Debes agregar al menos 3 paraderos."); return; }
    setError(""); setLoading(true);
    try {
      await rutaService.createConNodos({
        nombre: form.nombre,
        descripcion: form.descripcion,
        tarifa: parseFloat(form.tarifa),
        tiempo_estimado: form.tiempo_estimado ? parseInt(form.tiempo_estimado) : undefined,
        nodos: nodosSeleccionados.map(n => ({ paraderoId: n.paraderoId, orden: n.orden })),
      });
      navigate("/rutas");
    } catch (e: any) {
    console.error('Error completo:', e);
    console.error('Response:', e.response?.data);
    setError(e.response?.data?.message?.join?.(", ") || e.response?.data?.message || "Error al crear la ruta.");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <button onClick={() => navigate("/rutas")} className="mb-4 text-sm text-primary hover:underline">← Volver</button>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Crear Ruta</h1>
      <form onSubmit={handleSubmit} className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark space-y-4">
        {[{ name: "nombre", label: "Nombre *", type: "text", required: true }, { name: "tarifa", label: "Tarifa *", type: "number", required: true }, { name: "tiempo_estimado", label: "Tiempo estimado (min)", type: "number", required: false }].map(c => (
          <div key={c.name}>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">{c.label}</label>
            <input name={c.name} type={c.type} value={form[c.name as keyof typeof form]} required={c.required}
              onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
              className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} rows={2}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        </div>

        {/* Paraderos */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Paraderos * <span className="text-gray-400 font-normal">(mínimo 3, en orden)</span>
          </label>
          <div className="flex gap-2">
            <select value={paraderoSeleccionado} onChange={(e) => setParaderoSeleccionado(e.target.value)}
              className="flex-1 rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white">
              <option value="">Seleccionar paradero...</option>
              {paraderos.filter(p => !nodosSeleccionados.find(n => n.paraderoId === p.id)).map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <button type="button" onClick={agregarParadero}
              className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90">
              + Agregar
            </button>
          </div>

          {nodosSeleccionados.length > 0 && (
            <div className="mt-2 space-y-1">
              {nodosSeleccionados.map((n, i) => (
                <div key={i} className="flex items-center gap-2 rounded bg-gray-50 dark:bg-meta-4 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">{n.orden}</span>
                  <span className="flex-1 text-sm dark:text-white">{n.nombre}</span>
                  <button type="button" onClick={() => quitarParadero(i)} className="text-xs text-red-500 hover:text-red-700">✕</button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-gray-400">{nodosSeleccionados.length}/3 paraderos mínimos</p>
        </div>

        {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full rounded bg-primary py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60">
          {loading ? "Guardando..." : "Crear Ruta"}
        </button>
      </form>
    </div>
  );


}