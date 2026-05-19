import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { metodoPagoService } from "../../services/metodoPagoService";
import { MetodoPagoCiudadano } from "../../models/MetodoPago";

export default function MisTarjetas() {
  const [tarjetas, setTarjetas] = useState<MetodoPagoCiudadano[]>([]);
  const [loading, setLoading] = useState(true);
  const [ciudadanoId, setCiudadanoId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr || userStr === "undefined") { setLoading(false); return; }
    try {
      const user = JSON.parse(userStr);
      if (user?.id) { setCiudadanoId(user.id); cargar(user.id); }
    } catch { setLoading(false); }
  }, []);

  const cargar = async (id: string) => {
    try {
      const data = await metodoPagoService.getByCiudadano(id);
      setTarjetas(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este método de pago?")) return;
    try {
      await metodoPagoService.remove(id);
      setTarjetas(tarjetas.filter(t => t.id !== id));
    } catch { alert("Error al eliminar."); }
  };

  const tipoColor: Record<string, string> = {
    prepagado: "bg-blue-100 text-blue-700",
    debito: "bg-green-100 text-green-700",
    credito: "bg-purple-100 text-purple-700",
  };

  if (loading) return <p className="text-center py-10">Cargando...</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mis Métodos de Pago</h1>
        <button onClick={() => navigate("/metodos-pago/crear")}
          className="rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90">
          + Agregar método
        </button>
      </div>

      {tarjetas.length === 0 ? (
        <div className="rounded-lg border border-stroke bg-white p-10 text-center dark:border-strokedark dark:bg-boxdark">
          <p className="text-gray-500 mb-4">No tienes métodos de pago registrados.</p>
          <button onClick={() => navigate("/metodos-pago/crear")}
            className="rounded bg-primary px-5 py-2 text-sm text-white hover:bg-opacity-90">
            Agregar ahora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tarjetas.map(t => (
            <div key={t.id}
              className="rounded-lg border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-lg">
                    💳
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      Tarjeta #{t.id}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tipoColor[t.metodopago?.tipo || ""] || "bg-gray-100 text-gray-600"}`}>
                      {t.metodopago?.tipo || "Sin tipo"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Saldo disponible</p>
                  <p className="text-xl font-bold text-primary">
                    ${Number(t.saldo || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={() => navigate(`/metodos-pago/${t.id}/recargar`)}
                  className="flex-1 rounded bg-green-500 py-2 text-sm font-medium text-white hover:bg-green-600">
                  💰 Recargar
                </button>
                <button onClick={() => eliminar(t.id)}
                  className="rounded border border-red-300 px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}