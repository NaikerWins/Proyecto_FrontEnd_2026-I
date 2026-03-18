import axios from "axios";
import { Permission } from "../models/Permission";

import api from "../interceptors/axiosInterceptor";
    const API_URL = "/permissions";

class PermissionService {
    async getAllPermissions(): Promise<Permission[] | null> {
    try {
        const response = await api.get<Permission[]>(API_URL);
        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener permisos:", error);
        return null;
    }
}

async getPermissionById(id: number): Promise<Permission | null> {
    try {
        const response = await api.get<Permission>(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        return null;
    }
}

async createPermission(permission: Omit<Permission, "id">): Promise<Permission | null> {
    try {
        const response = await api.post<Permission>(API_URL, permission);
        return response.data;
    } catch (error) {
        return null;
    }
}

async updatePermission(id: number, permission: Partial<Permission>): Promise<Permission | null> {
    try {
        const response = await api.put<Permission>(`${API_URL}/${id}`, permission);
        return response.data;
    } catch (error) {
        return null;
    }
}

async deletePermission(id: number): Promise<boolean> {
    try {
        await api.delete(`${API_URL}/${id}`);
        return true;
    } catch (error) {
        return false;
    }
}
}
export default new PermissionService();