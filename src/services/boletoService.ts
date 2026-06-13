import apiNest from "../interceptors/axiosNest";
import api from "../interceptors/axiosInterceptor";
import {
  AbordajeRequest, AbordajeResponse,
  DescensoRequest, DescensoResponse,
} from "../models/Boleto";
import { HistorialViaje } from "../models/Historial";

const API_URL = "/boletos";

export const boletoService = {
  abordaje: async (data: AbordajeRequest): Promise<AbordajeResponse> => {
    const res = await apiNest.post<AbordajeResponse>(`${API_URL}/abordaje`, data);
    return res.data;
  },

  descenso: async (data: DescensoRequest): Promise<DescensoResponse> => {
    const res = await apiNest.post<DescensoResponse>(`${API_URL}/descenso`, data);
    return res.data;
  },

  getHistorial: async (ciudadano_id: number): Promise<HistorialViaje[]> => {
    const res = await apiNest.get<HistorialViaje[]>(`/historias/ciudadano/${ciudadano_id}`);
    return res.data;
  },

  // Datos para los selects del formulario de abordaje
  getUsuarios: async () => {
    const res = await api.get("/users");
    return res.data;
  },

  getProgramacionesActivas: async () => {
    const res = await apiNest.get("/programaciones");
    return res.data.filter((p: any) => p.estado === "activa");
  },

  getParaderos: async () => {
    const res = await apiNest.get("/paraderos");
    return res.data;
  },

  getMetodosPago: async (ciudadano_id: string) => {
  const res = await apiNest.get(`/metodospagociudadano/ciudadano/${ciudadano_id}`);
  return res.data;
},




async getBoletosActivos(): Promise<any[]> {

  try {

    const response = await apiNest.get("/boletos/activos");
    return response.data;

  } catch (error) {

    console.error(error);
    return [];
  }
}
};