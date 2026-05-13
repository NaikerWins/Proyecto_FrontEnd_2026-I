import { useState } from "react";
import { boletoService } from "../../services/boletoService";
import { AbordajeResponse } from "../../models/Boleto";

export default function Abordaje() {
  const [form, setForm] = useState({
    ciudadano_id: "",
    programacion_id: "",
    metodo_pago_id: "",
    paradero_abordaje_id: "",
  });
  const [resultado, setResultado] = useState<AbordajeResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResultado(null);
    setLoading(true);
    try {
      const res = await boletoService.abordaje({
        ciudadano_id: parseInt(form.ciudadano_id),
        programacion_id: parseInt(form.programacion_id),
        metodo_pago_id: parseInt(form.metodo_pago_id),
        paradero_abordaje_id: parseInt(form.paradero_abordaje_id),
      });
      setResultado(res);
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al registrar abordaje.");
    } finally {
      setLoading(false);
    }
  };

  const campos = [
    { name: "ciudadano_id", label: "ID Ciudadano" },
    { name: "programacion_id", label: "ID Programación" },
    { name: "metodo_pago_id", label: "ID Método de Pago" },
    { name: "paradero_abordaje_id", label: "ID Paradero de Abordaje" },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Registrar Abordaje
      </h1>

      {resultado ? (
        <div className="rounded-lg border border-green-300 bg-green-50 p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-xl font-bold text-green-700 mb-4">
            {resultado.message}
          </h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Boleto ID:</span> {resultado.boleto_id}</p>
            <p><span className="font-medium">Monto cobrado:</span> ${Number(resultado.monto_cobrado).toLocaleString()}</p>
            <p>
              <span className="font-medium">Ocupación del bus:</span>{" "}
              {resultado.ocupacion_actual} / {resultado.capacidad_maxima}
            </p>
          </div>
          <button
            onClick={() => setResultado(null)}
            className="mt-5 rounded bg-primary px-5 py-2 text-sm text-white hover:bg-opacity-90"
          >
            Nuevo abordaje
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark space-y-4"
        >
          {campos.map((c) => (
            <div key={c.name}>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
                {c.label}
              </label>
              <input
                type="number"
                name={c.name}
                value={form[c.name as keyof typeof form]}
                onChange={handleChange}
                required
                className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
              />
            </div>
          ))}

          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
          >
            {loading ? "Procesando..." : "Registrar Abordaje"}
          </button>
        </form>
      )}
    </div>
  );
}