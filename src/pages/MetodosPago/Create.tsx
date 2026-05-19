import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { metodoPagoService } from "../../services/metodoPagoService";

interface MetodoPago {
  id: number;
  tipo: string;
}

export default function CrearMetodoPagoCiudadano() {

  const navigate = useNavigate();

  const [tipos, setTipos] = useState<MetodoPago[]>([]);

  const [formData, setFormData] = useState({
    id_ciudadano: "",
    saldo: "",
    monto: "",
    cargo: "",
    metodopagoId: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {

    cargarTipos();

    const userStr = localStorage.getItem("user");

    if (userStr && userStr !== "undefined") {

      try {

        const user = JSON.parse(userStr);

        setFormData((prev) => ({
          ...prev,
          id_ciudadano: user.id || "",
        }));

      } catch (error) {
        console.error(error);
      }
    }

  }, []);

  const cargarTipos = async () => {

    try {

      const data =
        await metodoPagoService.getAllTipos();

      setTipos(data);

    } catch (error) {

      console.error(error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError("");

    try {

      setLoading(true);

      const body = {

        id_ciudadano: formData.id_ciudadano,

        saldo: Number(formData.saldo),

        monto: formData.monto
          ? Number(formData.monto)
          : undefined,

        cargo: formData.cargo
          ? Number(formData.cargo)
          : undefined,

        metodopago: {
          id: Number(formData.metodopagoId),
        },

      };

      console.log(body);

      await metodoPagoService.create(body);

      alert("Método de pago creado correctamente");

      navigate("/metodos-pago");

    } catch (e: any) {

      console.error(e);

      setError(
        e.response?.data?.message ||
        "Error al crear método de pago"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    

    <div className="mx-auto max-w-2xl px-4 py-8">
      
                    <button onClick={() => navigate("/metodos-pago")} className="mb-4 text-sm text-primary hover:underline">← Volver</button>

      <h1 className="mb-8 text-3xl font-bold text-gray-800 dark:text-white">
        Agregar Método de Pago
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-stroke bg-white p-8 shadow-sm dark:border-strokedark dark:bg-boxdark"
      >

        {/* ID CIUDADANO */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
            ID Ciudadano
          </label>

          <input
            type="text"
            name="id_ciudadano"
            value={formData.id_ciudadano}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-stroke px-4 py-3 dark:border-strokedark dark:bg-boxdark dark:text-white"
          />

        </div>

        {/* SALDO */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
            Saldo *
          </label>

          <input
            type="number"
            name="saldo"
            value={formData.saldo}
            onChange={handleChange}
            required
            min={0}
            className="w-full rounded-lg border border-stroke px-4 py-3 dark:border-strokedark dark:bg-boxdark dark:text-white"
          />

        </div>

        {/* MONTO */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
            Monto
          </label>

          <input
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            min={5000}
            max={500000}
            className="w-full rounded-lg border border-stroke px-4 py-3 dark:border-strokedark dark:bg-boxdark dark:text-white"
          />

        </div>

        {/* CARGO */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
            Cargo
          </label>

          <input
            type="number"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            min={0}
            className="w-full rounded-lg border border-stroke px-4 py-3 dark:border-strokedark dark:bg-boxdark dark:text-white"
          />

        </div>

        {/* MÉTODO DE PAGO */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
            Tipo de método *
          </label>

          <select
            name="metodopagoId"
            value={formData.metodopagoId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-stroke px-4 py-3 dark:border-strokedark dark:bg-boxdark dark:text-white"
          >

            <option value="">
              Seleccionar tipo...
            </option>

            {tipos.map((tipo) => (

              <option
                key={tipo.id}
                value={tipo.id}
              >

                {tipo.tipo}

              </option>
            ))}

          </select>

        </div>

        {/* ERROR */}

        {error && (

          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">

            {error}

          </div>
        )}

        {/* BOTÓN */}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
        >

          {loading
            ? "Guardando..."
            : "Agregar Método de Pago"}

        </button>

      </form>

    </div>
  );
}