import { Paradero } from "../models/Paradero";
import api from "../interceptors/busesInterceptor";

const API_URL = "/paraderos";

export interface Paradero {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  descripcion?: string;
}

export const paraderoService = {
  getAll: async (): Promise<Paradero[]> => {
    const res = await api.get<Paradero[]>(API_URL);
    return res.data;
  },

  getCercanos: async (latitud: number, longitud: number): Promise<ParaderoCercano[]> => {
    const res = await api.get<ParaderoCercano[]>(`${API_URL}/cercanos`, {
      params: { latitud, longitud },
    });
    return res.data;
  },

  create: async (data: Partial<Paradero>): Promise<Paradero> => {
    const res = await api.post<Paradero>(API_URL, data);
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
  },
};