import { Empresa } from "../models/Empresa";
import apiNest from "../interceptors/axiosNest";

const API_URL = "/empresas";

class EmpresaService {
    async getEmpresas(): Promise<Empresa[]> {
        try {
            const response = await apiNest.get<Empresa[]>(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener empresas:", error);
            return [];
        }
    }

    async getEmpresaById(id: number): Promise<Empresa | null> {
        try {
            const response = await apiNest.get<Empresa>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Empresa no encontrada:", error);
            return null;
        }
    }

    async createEmpresa(empresa: Omit<Empresa, "id" | "activa">): Promise<Empresa | null> {
        try {
            const response = await apiNest.post<Empresa>(API_URL, empresa);
            return response.data;
        } catch (error) {
            console.error("Error al crear empresa:", error);
            return null;
        }
    }

    async updateEmpresa(id: number, empresa: Partial<Empresa>): Promise<Empresa | null> {
        try {
            const response = await apiNest.put<Empresa>(`${API_URL}/${id}`, empresa);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar empresa:", error);
            return null;
        }
    }

    async deleteEmpresa(id: number): Promise<boolean> {
        try {
            await apiNest.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar empresa:", error);
            return false;
        }
    }
}

export const empresaService = new EmpresaService();