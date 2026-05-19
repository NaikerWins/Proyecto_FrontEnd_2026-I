import { Incidente, Comentario, EstadisticasIncidente } from "../models/Incidente";
import apiNest from "../interceptors/axiosNestInterceptor";

const API_URL = "/incidentes";

class IncidenteService {
    async getIncidentesByBus(
        busId: number,
        tipo?: string,
        estado?: string
    ): Promise<{ incidentes: Incidente[]; estadisticas: EstadisticasIncidente }> {
        try {
            const params = new URLSearchParams();
            if (tipo) params.append("tipo", tipo);
            if (estado) params.append("estado", estado);
            const query = params.toString() ? `?${params.toString()}` : "";
            const response = await apiNest.get(`${API_URL}/bus/${busId}${query}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener incidentes:", error);
            return { incidentes: [], estadisticas: { total: 0, porTipo: {}, tasaResolucion: "0%" } };
        }
    }

    async getIncidenteById(id: number): Promise<Incidente | null> {
        try {
            const response = await apiNest.get<Incidente>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Incidente no encontrado:", error);
            return null;
        }
    }

    async createIncidente(incidente: {
        tipo: string;
        gravedad: string;
        descripcion: string;
        busId: number;
        conductorId: number;
        fotos?: { url: string }[];
    }): Promise<Incidente | null> {
        try {
            const response = await apiNest.post<Incidente>(API_URL, incidente);
            return response.data;
        } catch (error) {
            console.error("Error al crear incidente:", error);
            return null;
        }
    }

    async updateEstado(id: number, estado: string, descripcion?: string, gravedad?: string): Promise<Incidente | null> {
        try {
            const response = await apiNest.patch<Incidente>(
                `${API_URL}/${id}/estado`,
                { estado, descripcion, gravedad }
            );
            return response.data;
        } catch (error) {
            console.error("Error al actualizar incidente:", error);
            return null;
        }
    }

    async agregarComentario(id: number, comentario: { contenido: string; autor: string }): Promise<Comentario | null> {
        try {
            const response = await apiNest.post<Comentario>(
                `${API_URL}/${id}/comentarios`,
                comentario
            );
            return response.data;
        } catch (error) {
            console.error("Error al agregar comentario:", error);
            return null;
        }
    }
}

export const incidenteService = new IncidenteService();