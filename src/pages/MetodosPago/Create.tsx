import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { metodoPagoService } from "../../services/metodoPagoService";
import { MetodoPago } from "../../models/MetodoPago";

export default function CreateMetodoPago() {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState<MetodoPago[]>([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [saldoInicial, setSaldoInicial] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ciudadanoId, setCiudadanoId] = useState<string | null>(null);

  useEffect(() => {
    metodoPagoService.getAllTipos().then(setTipos);
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined") {
      try { const u = JSON.parse(userStr); setCiudadanoId(u?.id); } catch {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ciudadanoId) { setError("No se encontró tu usuario."); return; }
    if (!tipoSeleccionado) { setError("Selecciona un tipo de método de pago."); return; }
    setError(""); setLoading(true);
    try {
      await metodoPagoService.create({
        id_ciudadano: ciudadanoId,
        saldo: parseFloat(saldoInicial) || 0,
        metodopago: { id: parseInt(tipoSeleccionado) },
      });
      navigate("/metodos-pago");
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al crear método de pago.");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <button onClick={() => navigate("/metodos-pago")} className="mb-4 text-sm text-primary hover:underline">
        ← Volver
      </button>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Agregar Método de Pago</h1>

      <form onSubmit={handleSubmit}
        className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark space-y-4">

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Tipo de método *</label>
          <select value={tipoSeleccionado} required
            onChange={(e) => setTipoSeleccionado(e.target.value)}
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white">
            <option value="">Seleccionar tipo...</option>
            {tipos.map(t => (
              <option key={t.id} value={t.id}>{t.tipo}</option>
            ))}
          </select>
          {tipos.length === 0 && (
            <p className="mt-1 text-xs text-yellow-500">
              No hay tipos disponibles.{" "}
              <button type="button" onClick={() => navigate("/metodos-pago/tipos")}
                className="underline">Crear tipos aquí</button>
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Saldo inicial</label>
          <input type="number" value={saldoInicial} min={0}
            onChange={(e) => setSaldoInicial(e.target.value)}
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        </div>

        {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <button type="submit" disabled={loading}
          className="w-full rounded bg-primary py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60">
          {loading ? "Guardando..." : "Agregar Método de Pago"}
        </button>
      </form>
    </div>
  );
}