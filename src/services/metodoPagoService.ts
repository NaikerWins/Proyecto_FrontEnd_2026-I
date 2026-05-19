import apiNest from "../interceptors/axiosNest";
import { MetodoPago, MetodoPagoCiudadano } from "../models/MetodoPago";

export const metodoPagoService = {
  // Tipos de métodos de pago
  getAllTipos: async (): Promise<MetodoPago[]> => {
    const res = await apiNest.get<MetodoPago[]>("/metodospago");
    return res.data;
  },

  createTipo: async (tipo: string): Promise<MetodoPago> => {
    const res = await apiNest.post<MetodoPago>("/metodospago", { tipo });
    return res.data;
  },

  // Métodos de pago de un ciudadano
  getByCiudadano: async (ciudadano_id: string): Promise<MetodoPagoCiudadano[]> => {
    const res = await apiNest.get<MetodoPagoCiudadano[]>(
      `/metodospagociudadano/ciudadano/${ciudadano_id}`
    );
    return res.data;
  },

  create: async (data: {
    id_ciudadano: string;
    saldo: number;
    metodopago: { id: number };
  }): Promise<MetodoPagoCiudadano> => {
    const res = await apiNest.post<MetodoPagoCiudadano>("/metodospagociudadano", data);
    return res.data;
  },

  iniciarRecarga: async (id: number, monto: number, email: string) => {
    const res = await apiNest.post(`/metodospagociudadano/iniciar-recarga/${id}`, {
      monto,
      email,
    });
    return res.data;
  },

  confirmarRecarga: async (referencia: string, estado: string, monto: number) => {
    const res = await apiNest.post("/metodospagociudadano/confirmar-recarga", {
      referencia,
      estado,
      monto,
    });
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiNest.delete(`/metodospagociudadano/${id}`);
  },
};