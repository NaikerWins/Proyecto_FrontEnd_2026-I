import { Programacion } from "../models/Programacion";
import api from "../interceptors/busesInterceptor";

const API_URL = "/programaciones";

class ProgramacionService {

    async getProgramaciones(): Promise<Programacion[]> {
        try {
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener programaciones:", error);
            return [];
        }
    }

    async getProgramacionById(id: string): Promise<Programacion | null> {
        try {
            const response = await api.get<Programacion>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Programación no encontrada:", error);
            return null;
        }
    }

    /**
     * Crear nueva programación
     */
    async createProgramacion(programacion: Omit<Programacion, "id">): Promise<Programacion | null> {
        try {
            const response = await api.post<Programacion>(API_URL, programacion);
            return response.data;
        } catch (error) {
            console.error("Error al crear la programacion:", error);
            return null;
        }
    }

    //Actualizar 

    async updateProgramacion(id: string, programacion: Partial<Programacion>): Promise<Programacion | null> {
        try {
            const response = await api.patch<Programacion>(`${API_URL}/${id}`, programacion);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar programacion:", error);
            return null;
        }
    }

    // Eliminar 
    async deleteProgramacion(id: string): Promise<boolean> {
        try {
            await api.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar programación:", error);
            return false;
        }
    }
}

export const programacionService = new ProgramacionService();
