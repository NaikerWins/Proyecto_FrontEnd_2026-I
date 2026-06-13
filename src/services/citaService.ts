import apiNest from "../interceptors/axiosNest";

export interface CitaData {
    email: string;
    motivo: string;
    fechaInicio: string;
    fechaFin: string;
    meetLink?: string;
}

class CitaService {
    async agendar(data: CitaData): Promise<{ success: boolean; mensaje: string }> {
        const res = await apiNest.post("/pqrs/agendar-cita", data);
        return res.data;
    }

    async getDisponibilidad(): Promise<any[]> {
        try {
            const res = await apiNest.get("/pqrs/disponibilidad");
            return res.data;
        } catch {
            return [];
        }
    }
}

export const citaService = new CitaService();