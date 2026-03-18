import api from "../interceptors/axiosInterceptor";

const API_URL = "/role-permission";

class RolePermissionService {

    async getAll() {
        try {
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener role-permissions:", error);
            return [];
        }
    }

    async assign(roleId: string, permissionId: string): Promise<boolean> {
        try {
            await api.post(`${API_URL}/role/${roleId}/permission/${permissionId}`);
            return true;
        } catch (error) {
            console.error("Error al asignar permiso:", error);
            return false;
        }
    }

    async remove(rolePermissionId: string): Promise<boolean> {
        try {
            await api.delete(`${API_URL}/${rolePermissionId}`);
            return true;
        } catch (error) {
            console.error("Error al quitar permiso:", error);
            return false;
        }
    }
}

export default new RolePermissionService();