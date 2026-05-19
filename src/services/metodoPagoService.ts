import apiNest from "../interceptors/axiosNest";
import { MetodoPago } from "../models/MetodoPago";
import { MetodoPagoCiudadano } from "../models/metodoPagoCiudadano";
const API_METODOS = "/metodospago";
const API_CIUDADANO = "/metodospagociudadano";

export const metodoPagoService = {

  // =========================
  // TIPOS DE MÉTODO DE PAGO
  // =========================

  getAllTipos: async (): Promise<MetodoPago[]> => {
    const res = await apiNest.get<MetodoPago[]>(API_METODOS);
    return res.data;
  },

  createTipo: async (tipo: string): Promise<MetodoPago> => {
    const res = await apiNest.post<MetodoPago>(API_METODOS, { tipo });
    return res.data;
  },

  // =========================
  // MÉTODOS DE PAGO CIUDADANO
  // =========================

  getByCiudadano: async (
    ciudadano_id: string
  ): Promise<MetodoPagoCiudadano[]> => {
    const res = await apiNest.get<MetodoPagoCiudadano[]>(
      `${API_CIUDADANO}/ciudadano/${ciudadano_id}`
    );

    return res.data;
  },

  getById: async (id: number): Promise<MetodoPagoCiudadano> => {
    const res = await apiNest.get<MetodoPagoCiudadano>(
      `${API_CIUDADANO}/${id}`
    );

    return res.data;
  },

  create: async (data: {
    id_ciudadano: string;
    saldo: number;
    monto?: number;
    cargo?: number;
    metodopago: {
      id: number;
    };
  }): Promise<MetodoPagoCiudadano> => {

    const res = await apiNest.post<MetodoPagoCiudadano>(
      API_CIUDADANO,
      data
    );

    return res.data;
  },

  update: async (
    id: number,
    data: Partial<MetodoPagoCiudadano>
  ): Promise<MetodoPagoCiudadano> => {

    const res = await apiNest.patch<MetodoPagoCiudadano>(
      `${API_CIUDADANO}/${id}`,
      data
    );

    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiNest.delete(`${API_CIUDADANO}/${id}`);
  },

  // =========================
  // RECARGAS
  // =========================

  iniciarRecarga: async (
    id: number,
    monto: number,
    email: string
  ) => {

    const res = await apiNest.post(
      `${API_CIUDADANO}/iniciar-recarga/${id}`,
      {
        monto,
        email,
      }
    );

    return res.data;
  },

  confirmarRecarga: async (
    referencia: string,
    estado: string,
    monto: number
  ) => {

    const res = await apiNest.post(
      `${API_CIUDADANO}/confirmar-recarga`,
      {
        referencia,
        estado,
        monto,
      }
    );

    return res.data;
  },
};