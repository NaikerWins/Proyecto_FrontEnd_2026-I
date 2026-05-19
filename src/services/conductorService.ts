import { Conductor } from "../models/Conductor";
import apiNest from "../interceptors/axiosNestInterceptor";

const API_URL = "/conductores";

class ConductorService {
    async getConductores(): Promise<Conductor[]> {
        try {
            const response = await apiNest.get<Conductor[]>(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener conductores:", error);
            return [];
        }
    }

    async getConductorById(id: number): Promise<Conductor | null> {
        try {
            const response = await apiNest.get<Conductor>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Conductor no encontrado:", error);
            return null;
        }
    }

    async createConductor(conductor: {
        licencia: string;
        persona: {
            nombre: string;
            apellido: string;
            email: string;
            telefono?: string;
        };
    }): Promise<Conductor | null> {
        try {
            const response = await apiNest.post<Conductor>(API_URL, conductor);
            return response.data;
        } catch (error) {
            console.error("Error al crear conductor:", error);
            return null;
        }
    }

    async updateConductor(id: number, conductor: {
        licencia?: string;
        persona?: {
            nombre?: string;
            apellido?: string;
            email?: string;
            telefono?: string;
        };
    }): Promise<Conductor | null> {
        try {
            const response = await apiNest.put<Conductor>(`${API_URL}/${id}`, conductor);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar conductor:", error);
            return null;
        }
    }

    async deleteConductor(id: number): Promise<boolean> {
        try {
            await apiNest.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar conductor:", error);
            return false;
        }
    }
}

export const conductorService = new ConductorService();