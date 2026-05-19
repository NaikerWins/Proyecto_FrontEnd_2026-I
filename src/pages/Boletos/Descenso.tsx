import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { boletoService } from "../../services/boletoService";
import { paraderoService } from "../../services/paraderoService";

export default function Descenso() {

  const navigate = useNavigate();

  const [boletos, setBoletos] = useState<any[]>([]);
  const [paraderos, setParaderos] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    boleto_id: "",
    paradero_descenso_id: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {

    try {

      const [boletoData, paraderoData] = await Promise.all([
        boletoService.getBoletosActivos(),
        paraderoService.getParaderos(),
      ]);

      setBoletos(boletoData);
      setParaderos(paraderoData);

    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await boletoService.descenso({
        boleto_id: Number(form.boleto_id),
        paradero_descenso_id: Number(form.paradero_descenso_id),
      });

      Swal.fire({
        icon: "success",
        title: "Descenso registrado",
        html: `
          <b>Boleto:</b> ${response.boleto_id}<br/>
          <b>Paradero:</b> ${response.paradero_descenso}<br/>
          <b>Hora:</b> ${new Date(response.hora_descenso).toLocaleString()}
        `
      });

      setForm({
        boleto_id: "",
        paradero_descenso_id: "",
      });

    } catch (e: any) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: e.response?.data?.message || "Error registrando descenso"
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">

      <button
        onClick={() => navigate("/")}
        className="mb-4 text-sm text-primary hover:underline"
      >
        ← Volver
      </button>

      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">

        <h1 className="mb-6 text-2xl font-bold dark:text-white">
          Registrar Descenso
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Boleto */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Boleto Activo
            </label>

            <select
              required
              value={form.boleto_id}
              onChange={(e) =>
                setForm({ ...form, boleto_id: e.target.value })
              }
              className="w-full rounded border px-4 py-2 dark:bg-boxdark"
            >

              <option value="">Seleccione...</option>

              {boletos.map((b) => (

                <option
  key={b.id}
  value={b.id}
>

  Boleto #{b.id}

  {" | "}

  Ruta:
  {b.programacion?.ruta?.nombre || "Sin ruta"}

  {" | "}

  Bus:
  {b.programacion?.bus?.placa || "Sin bus"}

</option>

              ))}

            </select>

          </div>

          {/* Paradero */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Paradero Descenso
            </label>

            <select
              required
              value={form.paradero_descenso_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  paradero_descenso_id: e.target.value
                })
              }
              className="w-full rounded border px-4 py-2 dark:bg-boxdark"
            >

              <option value="">Seleccione...</option>

              {paraderos.map((p) => (

                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>

              ))}

            </select>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-3 text-white"
          >
            {loading ? "Procesando..." : "Registrar Descenso"}
          </button>

        </form>

      </div>

    </div>
  );
}