import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Conductor } from "../../models/Conductor";
import { conductorService } from "../../services/conductorService";

export default function ListConductores() {

  const navigate = useNavigate();

  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConductores();
  }, []);

  const fetchConductores = async () => {
    setLoading(true);

    try {
      const data = await conductorService.getConductores();
      setConductores(data);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id?: number) => {

    if (!id) return;

    const result = await Swal.fire({
      title: "¿Eliminar conductor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
    });

    if (!result.isConfirmed) return;

    const ok = await conductorService.deleteConductor(String(id));

    if (ok) {
      Swal.fire("Eliminado", "", "success");
      fetchConductores();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <button
            onClick={() => navigate("/")}
            className="mb-3 text-sm text-primary hover:underline"
          >
            ← Volver
          </button>

          <h1 className="text-3xl font-bold dark:text-white">
            Conductores
          </h1>
        </div>

        <button
          onClick={() => navigate("/conductores/crear")}
          className="rounded bg-primary px-5 py-2 text-sm font-medium text-white"
        >
          + Nuevo Conductor
        </button>

      </div>

      <div className="overflow-x-auto rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">

        {loading ? (
          <div className="p-8 text-center dark:text-white">
            Cargando...
          </div>
        ) : (

          <table className="w-full">

            <thead className="border-b border-stroke dark:border-strokedark">
              <tr className="text-left">
                <th className="p-4">ID</th>
                <th className="p-4">Nombre</th>
                <th className="p-4">Email</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Licencia</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>

              {conductores.map((c) => (

                <tr
                  key={c.id}
                  className="border-b border-stroke dark:border-strokedark"
                >
                  <td className="p-4">{c.id}</td>

                  <td className="p-4 dark:text-white">
                    {c.persona?.nombre} {c.persona?.apellido}
                  </td>

                  <td className="p-4">
                    {c.persona?.email}
                  </td>

                  <td className="p-4">
                    {c.persona?.telefono}
                  </td>

                  <td className="p-4 font-medium dark:text-white">
                    {c.licencia}
                  </td>

                  <td className="p-4">

                    <div className="flex gap-2">

                      <button
                        onClick={() => navigate(`/conductores/edit/${c.id}`)}
                        className="rounded bg-blue-500 px-3 py-1 text-xs text-white"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminar(c.id)}
                        className="rounded bg-red-500 px-3 py-1 text-xs text-white"
                      >
                        Eliminar
                      </button>

                    </div>

                  </td>
                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}