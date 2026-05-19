import apiNest from "../interceptors/axiosNest";
import { Ruta } from "../models/Ruta";

const API_URL = "/rutas";

export const rutaService = {
  getAll: async (nombre?: string): Promise<Ruta[]> => {
    const params = nombre ? { nombre } : {};
    const res = await apiNest.get<Ruta[]>(API_URL, { params });
    return res.data;
  },
  getById: async (id: number): Promise<Ruta> => {
    const res = await apiNest.get<Ruta>(`${API_URL}/${id}`);
    return res.data;
  },
  getParaderos: async (id: number) => {
    const res = await apiNest.get(`${API_URL}/${id}/paraderos`);
    return res.data;
  },
  create: async (data: Partial<Ruta>): Promise<Ruta> => {
    const res = await apiNest.post<Ruta>(API_URL, data);
    return res.data;
  },
  createConNodos: async (data: any): Promise<Ruta> => {
    const res = await apiNest.post<Ruta>(API_URL, data);
    return res.data;
  },
  remove: async (id: number): Promise<void> => {
    await apiNest.delete(`${API_URL}/${id}`);
  },
};
