import { Role } from "../models/Role";
import api from "../interceptors/axiosInterceptor";

const API_URL = "/roles";

class RoleService {
  async getRoles(): Promise<Role[]> {
    try {
      const response = await api.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error al obtener roles:", error);
      return [];
    }
  }

  async getRoleById(id: string): Promise<Role | null> {
    try {
      const response = await api.get<Role>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Rol no encontrado:", error);
      return null;
    }
  }

  async createRole(role: Omit<Role, "id">): Promise<Role | null> {
    try {
      const response = await api.post<Role>(API_URL, role);
      return response.data;
    } catch (error) {
      console.error("Error al crear rol:", error);
      return null;
    }
  }

  async updateRole(id: string, role: Partial<Role>): Promise<Role | null> {
    try {
      const response = await api.put<Role>(`${API_URL}/${id}`, role);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      return null;
    }
  }

  async deleteRole(id: string): Promise<boolean> {
    try {
      await api.delete(`${API_URL}/${id}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      return false;
    }
  }
}

export const roleService = new RoleService();