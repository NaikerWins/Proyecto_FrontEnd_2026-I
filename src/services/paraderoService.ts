import { Paradero } from "../models/Paradero";
import apiNest from "../interceptors/axiosNestInterceptor";

const API_URL = "/paraderos";

class ParaderoService {
    async getParaderos(): Promise<Paradero[]> {
        try {
            const response = await apiNest.get<Paradero[]>(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener paraderos:", error);
            return [];
        }
    }

    async getParaderoById(id: number): Promise<Paradero | null> {
        try {
            const response = await apiNest.get<Paradero>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Paradero no encontrado:", error);
            return null;
        }
    }

    async createParadero(paradero: Omit<Paradero, "id" | "codigo" | "activo">): Promise<Paradero | null> {
        try {
            const response = await apiNest.post<Paradero>(API_URL, paradero);
            return response.data;
        } catch (error) {
            console.error("Error al crear paradero:", error);
            return null;
        }
    }

    async updateParadero(id: number, paradero: Partial<Paradero>): Promise<Paradero | null> {
        try {
            const response = await apiNest.put<Paradero>(`${API_URL}/${id}`, paradero);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar paradero:", error);
            return null;
        }
    }

    async deleteParadero(id: number): Promise<boolean> {
        try {
            await apiNest.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar paradero:", error);
            return false;
        }
    }
}

export const paraderoService = new ParaderoService();