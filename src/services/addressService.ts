import { Address } from "../models/Address";
import api from "../interceptors/axiosInterceptor";

const API_URL = "/addresses";

class AddressService {
  async getAddresses(): Promise<Address[]> {
    try {
      const response = await api.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error al obtener direcciones:", error);
      return [];
    }
  }

  async getAddressById(id: number): Promise<Address | null> {
    try {
      const response = await api.get<Address>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Dirección no encontrada:", error);
      return null;
    }
  }

  async getUserAddress(userId: number): Promise<Address | null> {
    try {
      const response = await api.get<Address>(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Dirección del usuario no encontrada:", error);
      return null;
    }
  }

  async createAddress(userId: number, address: Omit<Address, "id">): Promise<Address | null> {
    try {
      console.log(`📍 Creando dirección para usuario ${userId}:`, address);
      
      const response = await api.post<Address>(`${API_URL}/user/${userId}`, address);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error al crear dirección:", error);
      
      // Proporcionar mensaje de error más específico
      if (error.response?.status === 404) {
        throw new Error("Usuario no encontrado. Verifica el ID de usuario.");
      } else if (error.response?.status === 400) {
        throw new Error("Datos inválidos. Verifica los campos requeridos.");
      } else {
        throw new Error("Error al crear la dirección");
      }
    }
  }

  async updateAddress(id: number, address: Partial<Address>): Promise<Address | null> {
    try {
      const response = await api.put<Address>(`${API_URL}/${id}`, address);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar dirección:", error);
      return null;
    }
  }

  async deleteAddress(id: number): Promise<boolean> {
    try {
      await api.delete(`${API_URL}/${id}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar dirección:", error);
      return false;
    }
  }
}

export const addressService = new AddressService();