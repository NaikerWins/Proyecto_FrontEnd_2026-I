import apiNest from "../interceptors/axiosNestInterceptor";
import api from "../interceptors/busesInterceptor";
import { Ruta } from "../models/Ruta";

const API_URL = "/rutas";

export const rutaService = {
  getRutas: async (): Promise<Ruta[]> => {
    const res = await api.get<Ruta[]>(API_URL);
    return res.data;
  },
  getAll: async (): Promise<Ruta[]> => {
    const res = await api.get<Ruta[]>(API_URL);
    return res.data;
  },
  getById: async (id: number): Promise<Ruta> => {
    const res = await api.get<Ruta>(`${API_URL}/${id}`);
    return res.data;
  },
  getParaderos: async (id: number) => {
    const res = await api.get(`${API_URL}/${id}/paraderos`);
    return res.data;
  },
  create: async (data: Partial<Ruta>): Promise<Ruta> => {
    const res = await api.post<Ruta>(API_URL, data);
    return res.data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
  },
  estimarLlegada: async (rutaId: number, paraderoId: number, busId?: number) => {
  const res = await apiNest.get(`/rutas/estimar-llegada/${rutaId}/${paraderoId}`, { 
    params: busId ? { busId } : {} 
  });
  return res;
},
}

  createConNodos: async (data: any): Promise<Ruta> => {
    const res = await api.post<Ruta>(API_URL, data);
    return res.data;
}
