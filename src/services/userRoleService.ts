import { UserRole } from "../models/UserRole";
import { Role } from "../models/Role";
import api from "../interceptors/axiosInterceptor";

const API_URL = "/user-roles";

class UserRoleService {
  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const response = await api.get(`${API_URL}/user/${userId}`);
      const backendData = response.data;
      return backendData.map((item: any) => ({
        id: item.id,
        userId: item.user?.id,    
        roleId: item.role?.id,
        startAt: item.startAt,
        endAt: item.endAt,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error("Error al obtener roles del usuario:", error);
      return [];
    }
  }

  async getUserRolesWithRoleDetails(userId: string): Promise<UserRole[]> {
    try {
      const userRoles = await this.getUserRoles(userId);
      
      if (userRoles.length === 0) return [];
      
      const rolesResponse = await api.get("/roles");
      const allRoles: Role[] = rolesResponse.data;
      
      return userRoles.map(userRole => ({
        ...userRole,
        role: allRoles.find(role => role.id === userRole.roleId) || { 
          id: userRole.roleId, 
          name: `Rol ${userRole.roleId}` 
        }
      }));
    } catch (error) {
      console.error("Error al obtener roles del usuario con detalles:", error);
      return this.getUserRoles(userId); 
    }
  }

  async assignRoleToUser(
    userId: string, 
    roleId: string, 
    startAt?: string, 
    endAt?: string
  ): Promise<UserRole | null> {
    try {
      const payload = {
        startAt: startAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
        endAt: endAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      };
      
      console.log("🎯 Asignando rol", roleId, "al usuario", userId);
      console.log("📦 Payload:", payload);
      
      const response = await api.post<any>(`${API_URL}/user/${userId}/role/${roleId}`, payload);
      
      const backendData = response.data;
      return {
        id: backendData.id,
        userId: backendData.user_id, 
        roleId: backendData.role_id, 
        startAt: backendData.startAt,
        endAt: backendData.endAt,
        createdAt: backendData.created_at,
        updatedAt: backendData.updated_at
      };
    } catch (error) {
      console.error("Error al asignar rol:", error);
      return null;
    }
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId);
      const assignment = userRoles.find(ur => ur.roleId === roleId);
      
      if (assignment && assignment.id) {
        await api.delete(`${API_URL}/${assignment.id}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al remover rol:", error);
      return false;
    }
  }

  async getRolesByUserId(userId: string): Promise<UserRole[]> {
    return this.getUserRolesWithRoleDetails(userId);
  }

  async getUserRolesWithDetails(userId: string): Promise<UserRole[]> {
    return this.getUserRolesWithRoleDetails(userId);
  }

  async updateUserRole(userRoleId: string, userRoleData: any): Promise<UserRole | null> {
    try {
      const response = await api.put<any>(`${API_URL}/${userRoleId}`, userRoleData);
      

      const backendData = response.data;
      return {
        id: backendData.id,
        userId: backendData.user_id, 
        roleId: backendData.role_id, 
        startAt: backendData.startAt,
        endAt: backendData.endAt,
        createdAt: backendData.created_at,
        updatedAt: backendData.updated_at
      };
    } catch (error) {
      console.error("Error al actualizar user role:", error);
      return null;
    }
  }
}

export const userRoleService = new UserRoleService();