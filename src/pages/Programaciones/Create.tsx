import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { programacionService } from "../../services/programacionService";
import { rutaService } from "../../services/rutaService";
import { busService } from "../../services/busService";
import { conductorService } from "../../services/conductorService";

import { Ruta } from "../../models/Ruta";

export default function CreateProgramacion() {

  const navigate = useNavigate();

  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [conductores, setConductores] = useState<any[]>([]);

  const [form, setForm] = useState({
    salida: "",
    tolerancia: "",
    recurrencia: "",

    bus_id: "",
    conductor_id: "",
    capacidad_maxima: "",

    ruta_id: "",
    estado: "activa",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {

      const [rutasData, busesData, conductoresData] =
        await Promise.all([
          rutaService.getAll(),
          busService.getBuses(),
          conductorService.getConductores(),
        ]);

      setRutas(rutasData);
      setBuses(busesData);
      setConductores(conductoresData);

    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const handleBusChange = (busId: string) => {

    const busSeleccionado = buses.find(
      (b) => b.id === Number(busId)
    );

    setForm({
      ...form,
      bus_id: busId,
    capacidad_maxima: (
  (busSeleccionado?.capacidadSentados || 0) +
  (busSeleccionado?.capacidadParados || 0)
).toString(),    });
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      await programacionService.createProgramacion({

        salida: form.salida,
        tolerancia: Number(form.tolerancia),
        recurrencia: form.recurrencia,

        conductor_id: Number(form.conductor_id),
        capacidad_maxima: Number(form.capacidad_maxima),
        ocupacion_actual: 0,
        estado: form.estado,

        ruta: {
          id: Number(form.ruta_id),
        },

        bus: {
          id: Number(form.bus_id),
        },

      });

      navigate("/programaciones");

    } catch (e: any) {

      setError(
        e.response?.data?.message ||
        "Error al crear programación."
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="mx-auto max-w-2xl px-4 py-8">

      <button
        onClick={() => navigate("/programaciones")}
        className="mb-4 text-sm text-primary hover:underline"
      >
        ← Volver
      </button>

      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        Nueva Programación
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark"
      >

        {/* RUTA */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Ruta *
          </label>

          <select
            value={form.ruta_id}
            required
            onChange={(e) =>
              setForm({
                ...form,
                ruta_id: e.target.value,
              })
            }
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >

            <option value="">
              Seleccionar ruta...
            </option>

            {rutas.map((r) => (

              <option
                key={r.id}
                value={r.id}
              >
                {r.nombre}
              </option>

            ))}

          </select>

        </div>

        {/* BUS */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Bus *
          </label>

          <select
            value={form.bus_id}
            required
            onChange={(e) => handleBusChange(e.target.value)}
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >

            <option value="">
              Seleccionar bus...
            </option>

            {buses.map((b) => (

              <option
                key={b.id}
                value={b.id}
              >
                {b.placa} - {b.modelo}
              </option>

            ))}

          </select>

        </div>

        {/* CONDUCTOR */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Conductor *
          </label>

          <select
            value={form.conductor_id}
            required
            onChange={(e) =>
              setForm({
                ...form,
                conductor_id: e.target.value,
              })
            }
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >

            <option value="">
              Seleccionar conductor...
            </option>

            {conductores.map((c) => (

              <option
                key={c.id}
                value={c.id}
              >
                {c.persona?.nombre} {c.persona?.apellido}
              </option>

            ))}

          </select>

        </div>

        {/* FECHA */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Fecha y Hora de Salida *
          </label>

          <input
            type="datetime-local"
            value={form.salida}
            required
            onChange={(e) =>
              setForm({
                ...form,
                salida: e.target.value,
              })
            }
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          />

        </div>

        {/* TOLERANCIA */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Tolerancia (minutos)
          </label>

          <input
            type="number"
            min={0}
            max={60}
            value={form.tolerancia}
            onChange={(e) =>
              setForm({
                ...form,
                tolerancia: e.target.value,
              })
            }
            placeholder="Ej: 10"
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          />

        </div>

        {/* RECURRENCIA */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Recurrencia
          </label>

          <select
            value={form.recurrencia}
            onChange={(e) =>
              setForm({
                ...form,
                recurrencia: e.target.value,
              })
            }
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >

            <option value="">
              Sin recurrencia
            </option>

            <option value="diaria">
              Diaria
            </option>

            <option value="semanal">
              Semanal
            </option>

            <option value="mensual">
              Mensual
            </option>

          </select>

        </div>

        {/* CAPACIDAD */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Capacidad Máxima
          </label>

          <input
            type="number"
            value={form.capacidad_maxima}
            readOnly
            className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          />

        </div>

        {/* ESTADO */}
        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Estado
          </label>

          <select
            value={form.estado}
            onChange={(e) =>
              setForm({
                ...form,
                estado: e.target.value,
              })
            }
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >

            <option value="activa">
              Activa
            </option>

            <option value="finalizado">
              Finalizado
            </option>

            <option value="cancelado">
              Cancelado
            </option>

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
          className="w-full rounded bg-primary py-3 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
        >

          {loading
            ? "Guardando..."
            : "Crear Programación"}

        </button>

      </form>

    </div>
  );
}