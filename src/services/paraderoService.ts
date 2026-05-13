import apiNest from "../interceptors/axiosNest";
import { ParaderoCercano } from "../models/Paradero";

const BASE = "/paraderos";

export const paraderoService = {
  getCercanos: async (latitud: number, longitud: number): Promise<ParaderoCercano[]> => {
    const res = await apiNest.get<ParaderoCercano[]>(`${BASE}/cercanos`, {
      params: { latitud, longitud },
    });
    return res.data;
  },
};