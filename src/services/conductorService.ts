import api from "../interceptors/busesInterceptor";
import { Conductor } from "../models/Conductor";

const API_URL = "/conductores";

class ConductorService {

  async getConductores(): Promise<Conductor[]> {
    try {
      const response = await api.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo conductores:", error);
      return [];
    }
  }

  async getConductorById(id: string): Promise<Conductor | null> {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo conductor:", error);
      return null;
    }
  }

  async createConductor(data: Conductor): Promise<Conductor | null> {
    try {
      const response = await api.post(API_URL, data);
      return response.data;
    } catch (error) {
      console.error("Error creando conductor:", error);
      return null;
    }
  }

  async updateConductor(id: string, data: Partial<Conductor>): Promise<Conductor | null> {
    try {
      const response = await api.patch(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error actualizando conductor:", error);
      return null;
    }
  }

  async deleteConductor(id: string): Promise<boolean> {
    try {
      await api.delete(`${API_URL}/${id}`);
      return true;
    } catch (error) {
      console.error("Error eliminando conductor:", error);
      return false;
    }
  }
}

export const conductorService = new ConductorService();