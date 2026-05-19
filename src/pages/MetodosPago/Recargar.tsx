import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { metodoPagoService } from "../../services/metodoPagoService";
import { MetodoPagoCiudadano } from "../../models/MetodoPago";

export default function RecargarMetodoPago() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tarjeta, setTarjeta] = useState<MetodoPagoCiudadano | null>(null);
  const [monto, setMonto] = useState("");
  const [email, setEmail] = useState("");
  const [paso, setPaso] = useState<"form" | "confirmacion" | "exito">("form");
  const [referencia, setReferencia] = useState("");
  const [cargo, setCargo] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) metodoPagoService.getByCiudadano("").then(() => {});
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined") {
      try { const u = JSON.parse(userStr); setEmail(u?.email || ""); } catch {}
    }
    // Cargar tarjeta específica
    if (id) {
      apiCargarTarjeta(parseInt(id));
    }
  }, [id]);

    const apiCargarTarjeta = async (tarjetaId: number) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr || userStr === "undefined") return;
      const user = JSON.parse(userStr);
      if (!user?.id) return;
    } catch { return; }


  const handleIniciarRecarga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || parseFloat(monto) < 5000) {
      setError("El monto mínimo es $5.000"); return;
    }
    setError(""); setLoading(true);
    try {
      const res = await metodoPagoService.iniciarRecarga(parseInt(id!), parseFloat(monto), email);
      setReferencia(res.referencia);
      setCargo(res.cargo);
      setPaso("confirmacion");
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al iniciar recarga.");
    } finally { setLoading(false); }
  };

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      await metodoPagoService.confirmarRecarga(referencia, "Aceptada", parseFloat(monto));
      setPaso("exito");
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al confirmar recarga.");
    } finally { setLoading(false); }
  };

  if (paso === "exito") {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-lg border border-green-300 bg-green-50 p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-700 mb-2">¡Recarga exitosa!</h2>
          <p className="text-gray-600 mb-2">Se recargaron <strong>${Number(monto).toLocaleString()}</strong></p>
          <p className="text-xs text-gray-400 mb-6">Referencia: {referencia}</p>
          <button onClick={() => navigate("/metodos-pago")}
            className="rounded bg-primary px-6 py-2 text-sm text-white hover:bg-opacity-90">
            Ver mis tarjetas
          </button>
        </div>
      </div>
    );
  }

  if (paso === "confirmacion") {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Confirmar Recarga</h1>
        <div className="rounded-lg border border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Monto a recargar:</span>
            <span className="font-bold dark:text-white">${Number(monto).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Cargo por servicio:</span>
            <span className="dark:text-white">${Number(cargo).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="font-medium text-gray-700 dark:text-white">Total a pagar:</span>
            <span className="font-bold text-primary">${(Number(monto) + Number(cargo)).toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-400">Ref: {referencia}</p>

          {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setPaso("form")}
              className="flex-1 rounded border border-stroke py-2 text-sm dark:border-strokedark dark:text-white">
              Cancelar
            </button>
            <button onClick={handleConfirmar} disabled={loading}
              className="flex-1 rounded bg-primary py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60">
              {loading ? "Procesando..." : "Confirmar pago"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <button onClick={() => navigate("/metodos-pago")} className="mb-4 text-sm text-primary hover:underline">
        ← Volver
      </button>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Recargar Tarjeta #{id}</h1>

      <form onSubmit={handleIniciarRecarga}
        className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark space-y-4">

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Monto a recargar * <span className="text-gray-400 font-normal">(mín. $5.000 — máx. $500.000)</span>
          </label>
          <input type="number" value={monto} required min={5000} max={500000}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ej: 50000"
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Email de confirmación *</label>
          <input type="email" value={email} required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        </div>

        <div className="rounded bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-700">
          ℹ️ Se aplicará un cargo por servicio del 2.9% + $900
        </div>

        {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <button type="submit" disabled={loading}
          className="w-full rounded bg-primary py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60">
          {loading ? "Procesando..." : "Continuar con la recarga"}
        </button>
      </form>
    </div>
  );
}}