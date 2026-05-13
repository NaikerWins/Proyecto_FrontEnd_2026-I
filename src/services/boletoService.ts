import apiNest from "../interceptors/axiosNest";
import {
  AbordajeRequest,
  AbordajeResponse,
  DescensoRequest,
  DescensoResponse,
} from "../models/Boleto";
import { HistorialViaje } from "../models/Historial";

const BASE = "/boletos";

export const boletoService = {
  abordaje: async (data: AbordajeRequest): Promise<AbordajeResponse> => {
    const res = await apiNest.post<AbordajeResponse>(`${BASE}/abordaje`, data);
    return res.data;
  },

  descenso: async (data: DescensoRequest): Promise<DescensoResponse> => {
    const res = await apiNest.post<DescensoResponse>(`${BASE}/descenso`, data);
    return res.data;
  },

  getHistorial: async (ciudadano_id: number): Promise<HistorialViaje[]> => {
    const res = await apiNest.get<HistorialViaje[]>(
      `/historias/ciudadano/${ciudadano_id}`
    );
    return res.data;
  },
};