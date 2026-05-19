import { useState, useEffect } from "react";
import { boletoService } from "../../services/boletoService";
import { AbordajeResponse } from "../../models/Boleto";
import { useNavigate } from "react-router-dom";

export default function Abordaje() {

  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [programaciones, setProgramaciones] = useState<any[]>([]);
  const [paraderos, setParaderos] = useState<any[]>([]);
  const [metodosPago, setMetodosPago] = useState<any[]>([]);

  const [form, setForm] = useState({
    ciudadano_id: "",
    programacion_id: "",
    metodo_pago_id: "",
    paradero_abordaje_id: "",
  });

  const [resultado, setResultado] =
    useState<AbordajeResponse | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const cargarDatos = async () => {

      try {

        const [u, p, par] = await Promise.all([
          boletoService.getUsuarios(),
          boletoService.getProgramacionesActivas(),
          boletoService.getParaderos(),
        ]);

        console.log("USUARIOS:", u);
        console.log("PROGRAMACIONES:", p);
        console.log("PARADEROS:", par);

        setUsuarios(u || []);
        setProgramaciones(p || []);
        setParaderos(par || []);

      } catch (error) {

        console.error(
          "Error cargando datos de abordaje:",
          error
        );

      }
    };

    cargarDatos();

    // Usuario logueado
    const userStr = localStorage.getItem("user");

    if (userStr && userStr !== "undefined") {

      const user = JSON.parse(userStr);

      if (user?.id) {

        boletoService
          .getMetodosPago(user.id)
          .then((data) => {

            console.log("METODOS PAGO:", data);

            setMetodosPago(data || []);
          })
          .catch((err) =>
            console.error(
              "Error cargando métodos:",
              err
            )
          );

        setForm((f) => ({
          ...f,
          ciudadano_id: String(user.id),
        }));
      }
    }

  }, []);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError("");
    setResultado(null);
    setLoading(true);

    try {

      const res = await boletoService.abordaje({
        ciudadano_id: parseInt(form.ciudadano_id),
        programacion_id: parseInt(form.programacion_id),
        metodo_pago_id: parseInt(form.metodo_pago_id),
        paradero_abordaje_id: parseInt(
          form.paradero_abordaje_id
        ),
      });

      setResultado(res);

    } catch (e: any) {

      setError(
        e.response?.data?.message ||
        "Error al registrar abordaje."
      );

    } finally {

      setLoading(false);

    }
  };

  if (resultado) {

    return (

      <div className="mx-auto max-w-lg px-4 py-8">

        <div className="rounded-lg border border-green-300 bg-green-50 p-6 text-center">

          <div className="mb-3 text-4xl">
            ✅
          </div>

          <h2 className="mb-4 text-xl font-bold text-green-700">
            {resultado.message}
          </h2>

          <div className="space-y-2 text-sm text-gray-700">

            <p>
              <span className="font-medium">
                Boleto ID:
              </span>{" "}
              {resultado.boleto_id}
            </p>

            <p>
              <span className="font-medium">
                Monto cobrado:
              </span>{" "}
              $
              {Number(
                resultado.monto_cobrado
              ).toLocaleString()}
            </p>

            <p>
              <span className="font-medium">
                Ocupación:
              </span>{" "}
              {resultado.ocupacion_actual}/
              {resultado.capacidad_maxima}
            </p>

          </div>

          <button
            onClick={() => setResultado(null)}
            className="mt-5 rounded bg-primary px-5 py-2 text-sm text-white hover:bg-opacity-90"
          >
            Nuevo abordaje
          </button>

        </div>

      </div>
    );
  }

  return (

    <div className="mx-auto max-w-lg px-4 py-8">

      <button
        onClick={() => navigate("/")}
        className="mb-4 text-sm text-primary hover:underline"
      >
        ← Volver
      </button>

      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        Registrar Abordaje
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark"
      >

        {/* Usuario */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Usuario *
          </label>

          <select
            value={form.ciudadano_id}
            required
            onChange={(e) =>
              setForm({
                ...form,
                ciudadano_id: e.target.value,
              })
            }
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >

            <option value="">
              Seleccionar usuario...
            </option>

            {usuarios.map((u: any) => (

              <option
                key={u.id}
                value={u.id}
              >
                {u.name} — {u.email}
              </option>

            ))}

          </select>

        </div>

        {/* Programación */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Programación activa *
          </label>

          <select
            value={form.programacion_id}
            required
            onChange={(e) =>
              setForm({
                ...form,
                programacion_id: e.target.value,
              })
            }
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >

            <option value="">
              Seleccionar programación...
            </option>

            {programaciones.map((p: any) => (

              <option
                key={p.id}
                value={p.id}
              >
                Ruta: {p.ruta?.nombre || "Sin ruta"}
                {" | "}
                Bus: {p.bus?.placa || "Sin bus"}
                {" | "}
                Salida:{" "}
                {new Date(
                  p.salida
                ).toLocaleString()}
                {" | "}
                {p.ocupacion_actual}/
                {p.capacidad_maxima}
              </option>

            ))}

          </select>

        </div>

        {/* Método pago */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Método de Pago *
          </label>

          <select
            value={form.metodo_pago_id}
            required
            onChange={(e) =>
              setForm({
                ...form,
                metodo_pago_id: e.target.value,
              })
            }
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >

            <option value="">
              Seleccionar método...
            </option>

            {metodosPago.map((m: any) => (

              <option
                key={m.id}
                value={m.id}
              >
                {m.metodopago?.tipo}
                {" — "}
                Saldo: $
                {Number(
                  m.saldo || 0
                ).toLocaleString()}
              </option>

            ))}

          </select>

          {metodosPago.length === 0 && (

            <p className="mt-1 text-xs text-yellow-500">

              No tienes métodos de pago.{" "}

              <a
                href="/metodos-pago/crear"
                className="underline"
              >
                Crear uno aquí
              </a>

            </p>

          )}

        </div>

        {/* Paraderos */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Paradero de abordaje *
          </label>

          <select
            value={form.paradero_abordaje_id}
            required
            onChange={(e) =>
              setForm({
                ...form,
                paradero_abordaje_id:
                  e.target.value,
              })
            }
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >

            <option value="">
              Seleccionar paradero...
            </option>

            {paraderos.map((p: any) => (

              <option
                key={p.id}
                value={p.id}
              >
                {p.nombre}
              </option>

            ))}

          </select>

        </div>

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

          {loading
            ? "Procesando..."
            : "Registrar Abordaje"}

        </button>

      </form>

    </div>
  );
}