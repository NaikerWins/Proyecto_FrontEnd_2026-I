import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { paraderoService } from "../../services/paraderoService";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

const mapContainerStyle = { width: "100%", height: "350px" };
const centerDefault = { lat: 5.0689, lng: -75.5174 }; // Manizales

export default function CreateParadero() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [posicion, setPosicion] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosicion({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posicion) { setError("Selecciona una ubicación en el mapa."); return; }
    setError("");
    setLoading(true);
    try {
      await paraderoService.create({
        nombre: form.nombre,
        descripcion: form.descripcion,
        latitud: posicion.lat,
        longitud: posicion.lng,
      });
      navigate("/paraderos/lista");
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al crear el paradero.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button onClick={() => navigate("/paraderos/lista")} className="mb-4 text-sm text-primary hover:underline">
        ← Volver
      </button>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Crear Paradero</h1>

      <form onSubmit={handleSubmit} className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Nombre *</label>
          <input name="nombre" value={form.nombre} required
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">Descripción</label>
          <input name="descripcion" value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white" />
        </div>

        {/* Mapa */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Ubicación * — <span className="text-gray-400 font-normal">Haz clic en el mapa para seleccionar</span>
          </label>

          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={posicion || centerDefault}
              zoom={14}
              onClick={handleMapClick}
            >
              {posicion && <Marker position={posicion} />}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-[350px] bg-gray-100 rounded">
              <p className="text-gray-500 text-sm">Cargando mapa...</p>
            </div>
          )}

          {posicion && (
            <div className="mt-2 rounded bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
              ✅ Ubicación seleccionada — Lat: {posicion.lat.toFixed(6)}, Lng: {posicion.lng.toFixed(6)}
            </div>
          )}
          {!posicion && (
            <p className="mt-1 text-xs text-red-400">Haz clic en el mapa para seleccionar la ubicación</p>
          )}
        </div>

        {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <button type="submit" disabled={loading || !posicion}
          className="w-full rounded bg-primary py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60">
          {loading ? "Guardando..." : "Crear Paradero"}
        </button>
      </form>
    </div>
  );
}