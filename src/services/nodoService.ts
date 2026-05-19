import apiNest from "../interceptors/axiosNest";

const BASE = "/nodos";

export interface Nodo {
  id: number;
  orden: number;
  ruta_id: number;
  paradero_id: number;
}

export const nodoService = {
  getAll: async (): Promise<Nodo[]> => {
    const res = await apiNest.get<Nodo[]>(BASE);
    return res.data;
  },

  create: async (data: Partial<Nodo>): Promise<Nodo> => {
    const res = await apiNest.post<Nodo>(BASE, data);
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiNest.delete(`${BASE}/${id}`);
  },
};