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