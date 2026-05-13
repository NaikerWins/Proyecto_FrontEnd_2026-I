import { useState } from "react";
import { boletoService } from "../../services/boletoService";
import { DescensoResponse } from "../../models/Boleto";

export default function Descenso() {
  const [form, setForm] = useState({ boleto_id: "", paradero_descenso_id: "" });
  const [resultado, setResultado] = useState<DescensoResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResultado(null);
    setLoading(true);
    try {
      const res = await boletoService.descenso({
        boleto_id: parseInt(form.boleto_id),
        paradero_descenso_id: parseInt(form.paradero_descenso_id),
      });
      setResultado(res);
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al registrar descenso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Registrar Descenso
      </h1>

      {resultado ? (
        <div className="rounded-lg border border-green-300 bg-green-50 p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-green-700 mb-4">
            {resultado.message}
          </h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Boleto ID:</span> {resultado.boleto_id}</p>
            <p><span className="font-medium">Paradero de descenso:</span> {resultado.paradero_descenso}</p>
            <p>
              <span className="font-medium">Hora de descenso:</span>{" "}
              {new Date(resultado.hora_descenso).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => setResultado(null)}
            className="mt-5 rounded bg-primary px-5 py-2 text-sm text-white hover:bg-opacity-90"
          >
            Nuevo descenso
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark space-y-4"
        >
          {[
            { name: "boleto_id", label: "ID del Boleto activo" },
            { name: "paradero_descenso_id", label: "ID Paradero de Descenso" },
          ].map((c) => (
            <div key={c.name}>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
                {c.label}
              </label>
              <input
                type="number"
                name={c.name}
                value={form[c.name as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
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
            {loading ? "Procesando..." : "Registrar Descenso"}
          </button>
        </form>
      )}
    </div>
  );
}