import { Ruta } from "../models/Ruta";
import apiNest from "../interceptors/axiosNestInterceptor";

const API_URL = "/rutas";

class RutaService {
    async getRutas(nombre?: string): Promise<Ruta[]> {
        try {
            const params = nombre ? { nombre } : {};
            const response = await apiNest.get<Ruta[]>(API_URL, { params });

            return response.data;
        } catch (error) {
            console.error("Error al obtener rutas:", error);
            return [];
        }
    }

    async getRutaById(id: number): Promise<Ruta | null> {
        try {
            const response = await apiNest.get<Ruta>(`${API_URL}/${id}`);

            return response.data;
        } catch (error) {
            console.error("Ruta no encontrada:", error);
            return null;
        }
    }

    async getParaderos(id: number) {
        try {
            const response = await apiNest.get(`${API_URL}/${id}/paraderos`);

            return response.data;
        } catch (error) {
            console.error("Error al obtener paraderos:", error);
            return [];
        }
    }

    async getTiempoTotal(
        id: number
    ): Promise<{ tiempoTotal: number; unidad: string } | null> {
        try {
            const response = await apiNest.get(
                `${API_URL}/${id}/tiempo-total`
            );

            return response.data;
        } catch (error) {
            console.error("Error al obtener tiempo total:", error);
            return null;
        }
    }

    async createRuta(ruta: {
        nombre: string;
        descripcion?: string;
        tarifa: number;
        nodos: {
            paraderoId: number;
            orden: number;
            distanciaDesdeAnterior?: number;
            tiempoEstimado?: number;
        }[];
    }): Promise<Ruta | null> {
        try {
            const response = await apiNest.post<Ruta>(API_URL, ruta);

            return response.data;
        } catch (error) {
            console.error("Error al crear ruta:", error);
            return null;
        }
    }

    async updateRuta(
        id: number,
        ruta: Partial<Ruta>
    ): Promise<Ruta | null> {
        try {
            const response = await apiNest.put<Ruta>(
                `${API_URL}/${id}`,
                ruta
            );

            return response.data;
        } catch (error) {
            console.error("Error al actualizar ruta:", error);
            return null;
        }
    }

    async deleteRuta(id: number): Promise<boolean> {
        try {
            await apiNest.delete(`${API_URL}/${id}`);

            return true;
        } catch (error) {
            console.error("Error al eliminar ruta:", error);
            return false;
        }
    }
}

export const rutaService = new RutaService();