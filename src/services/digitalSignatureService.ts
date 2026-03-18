import { DigitalSignature } from "../models/DigitalSignature";
import api from "../interceptors/axiosInterceptor";

const endpoint = "/digital-signatures";

export const DigitalSignatureService = {
  // ✅ Obtener firma de un usuario (por su id)
  getByUserId: async (userId: number): Promise<DigitalSignature> => {
    const response = await api.get(`${endpoint}/user/${userId}`);
    return response.data;
  },

  // ✅ Crear firma para un usuario
  create: async (userId: number, data: FormData): Promise<DigitalSignature> => {
    const response = await api.post(`${endpoint}/user/${userId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ✅ Actualizar firma (por id de firma, no userId)
  update: async (signatureId: number, data: FormData): Promise<DigitalSignature> => {
    const response = await api.put(`${endpoint}/${signatureId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ✅ Eliminar firma (por id de firma)
  delete: async (signatureId: number): Promise<void> => {
    await api.delete(`${endpoint}/${signatureId}`);
  },

  // ✅ Listar todas las firmas
  getAll: async (): Promise<DigitalSignature[]> => {
    const response = await api.get(endpoint);
    return response.data;
  },
};
