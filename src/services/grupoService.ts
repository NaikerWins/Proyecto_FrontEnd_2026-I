import apiNest from "../interceptors/axiosNestInterceptor";

const API_URL = "/grupos";

class GrupoService {
    async getGruposPublicos() {
        try {
            const response = await apiNest.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener grupos:", error);
            return [];
        }
    }

    async getGruposByUsuario(userId: string) {
        try {
            const response = await apiNest.get(`${API_URL}/usuario/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener grupos del usuario:", error);
            return [];
        }
    }

    async getGrupoById(id: number) {
        try {
            const response = await apiNest.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener grupo:", error);
            return null;
        }
    }

    async crearGrupo(
        adminId: string,
        adminNombre: string,
        datos: {
            nombre: string;
            descripcion?: string;
            tipo: string;
            miembros: { userId: string; nombre: string }[];
        }
    ) {
        try {
            const response = await apiNest.post(
                `${API_URL}/${adminId}/${encodeURIComponent(adminNombre)}`,
                datos
            );
            return response.data;
        } catch (error) {
            console.error("Error al crear grupo:", error);
            return null;
        }
    }

    async unirse(grupoId: number, userId: string, nombre: string) {
        try {
            const response = await apiNest.post(
                `${API_URL}/${grupoId}/unirse/${userId}/${encodeURIComponent(nombre)}`
            );
            return response.data;
        } catch (error) {
            console.error("Error al unirse al grupo:", error);
            return null;
        }
    }

    async salir(grupoId: number, userId: string) {
        try {
            const response = await apiNest.delete(`${API_URL}/${grupoId}/salir/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error al salir del grupo:", error);
            return null;
        }
    }
}

export const grupoService = new GrupoService();