import { Paradero } from "../models/Paradero";
import apiNest from "../interceptors/axiosNestInterceptor";

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
    const res = await apiNest.get<Paradero[]>(API_URL);
    return res.data;
  },

  getCercanos: async (latitud: number, longitud: number): Promise<ParaderoCercano[]> => {
    const res = await apiNest.get<ParaderoCercano[]>(`${API_URL}/cercanos`, {
      params: { latitud, longitud },
    });
    return res.data;
  },

  create: async (data: Partial<Paradero>): Promise<Paradero> => {
    const res = await apiNest.post<Paradero>(API_URL, data);
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiNest.delete(`${API_URL}/${id}`);
  },
};
