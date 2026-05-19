import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { conductorService } from "../../services/conductorService";

export default function CreateConductor() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    licencia: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setLoading(true);

    try {

      await conductorService.createConductor({
        licencia: form.licencia,
        persona: {
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          telefono: form.telefono,
        }
      });

      Swal.fire({
        icon: "success",
        title: "Conductor creado"
      });

      navigate("/conductores");

    } catch {
      Swal.fire({
        icon: "error",
        title: "Error creando conductor"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">

      <button
        onClick={() => navigate("/conductores")}
        className="mb-4 text-sm text-primary hover:underline"
      >
        ← Volver
      </button>

      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">

        <h1 className="mb-6 text-2xl font-bold dark:text-white">
          Nuevo Conductor
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Licencia"
            required
            value={form.licencia}
            onChange={(e) => setForm({ ...form, licencia: e.target.value })}
            className="w-full rounded border px-4 py-2 dark:bg-boxdark"
          />

          <input
            type="text"
            placeholder="Nombre"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full rounded border px-4 py-2 dark:bg-boxdark"
          />

          <input
            type="text"
            placeholder="Apellido"
            required
            value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            className="w-full rounded border px-4 py-2 dark:bg-boxdark"
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded border px-4 py-2 dark:bg-boxdark"
          />

          <input
            type="text"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="w-full rounded border px-4 py-2 dark:bg-boxdark"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-3 text-white"
          >
            {loading ? "Guardando..." : "Crear Conductor"}
          </button>

        </form>

      </div>

    </div>
  );
}