import { Turno } from "../models/Turno";
import apiNest from "../interceptors/axiosNestInterceptor";

const API_URL = "/turnos";

class TurnoService {
    async getTurnos(): Promise<Turno[]> {
        try {
            const response = await apiNest.get<Turno[]>(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener turnos:", error);
            return [];
        }
    }

    async getTurnoById(id: number): Promise<Turno | null> {
        try {
            const response = await apiNest.get<Turno>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Turno no encontrado:", error);
            return null;
        }
    }

    async getTurnoActivo(conductorId: number): Promise<Turno | null> {
        try {
            const response = await apiNest.get<Turno>(
                `${API_URL}/conductor/${conductorId}/activo`
            );
            return response.data;
        } catch (error) {
            console.error("No hay turno activo:", error);
            return null;
        }
    }

    async createTurno(turno: {
        conductorId: number;
        busId: number;
        fechaProgramada?: string;
        observaciones?: string;
    }): Promise<Turno | null> {
        try {
            const response = await apiNest.post<Turno>(API_URL, turno);
            return response.data;
        } catch (error) {
            console.error("Error al crear turno:", error);
            return null;
        }
    }

    async iniciarTurno(conductorId: number, observaciones?: string): Promise<Turno | null> {
        try {
            const response = await apiNest.patch<Turno>(
                `${API_URL}/conductor/${conductorId}/iniciar`,
                { observaciones }
            );
            return response.data;
        } catch (error) {
            console.error("Error al iniciar turno:", error);
            return null;
        }
    }

    async finalizarTurno(conductorId: number): Promise<Turno | null> {
        try {
            const response = await apiNest.patch<Turno>(
                `${API_URL}/conductor/${conductorId}/finalizar`,
                {}
            );
            return response.data;
        } catch (error) {
            console.error("Error al finalizar turno:", error);
            return null;
        }
    }
}

export const turnoService = new TurnoService();