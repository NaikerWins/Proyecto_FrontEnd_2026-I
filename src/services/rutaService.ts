<<<<<<< HEAD
import apiNest from "../interceptors/axiosNest";
import { Ruta } from "../models/Ruta";

const BASE = "/rutas";

export const rutaService = {
  getAll: async (nombre?: string): Promise<Ruta[]> => {
    const params = nombre ? { nombre } : {};
    const res = await apiNest.get<Ruta[]>(BASE, { params });
    return res.data;
  },

  getById: async (id: number): Promise<Ruta> => {
    const res = await apiNest.get<Ruta>(`${BASE}/${id}`);
    return res.data;
  },

  getParaderos: async (id: number) => {
    const res = await apiNest.get(`${BASE}/${id}/paraderos`);
    return res.data;
  },
};
=======
import api from "../interceptors/busesInterceptor";

const API_URL = "/rutas";

class RutaService {
    async getRutas(): Promise<any[]> {
        try {
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener rutas:", error);
            return [];
        }
    }
}

export const rutaService = new RutaService();
>>>>>>> 7729fdcf9b10467195d4aa135fc2d88c043f4a13
