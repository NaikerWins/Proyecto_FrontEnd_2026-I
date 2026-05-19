import apiNest from "../interceptors/axiosNest";

const API_URL = "/programaciones";

export interface Programacion {
  id: number;
  bus_id: number;
  conductor_id: number;
  estado: string;
  capacidad_maxima: number;
  ocupacion_actual: number;
  ruta_id: number;
}

export const programacionService = {
  getAll: async (): Promise<Programacion[]> => {
    const res = await apiNest.get<Programacion[]>(API_URL);
    return res.data;
  },

  create: async (data: Partial<Programacion>): Promise<Programacion> => {
    const res = await apiNest.post<Programacion>(API_URL, data);
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiNest.delete(`${API_URL}/${id}`);
  },
};