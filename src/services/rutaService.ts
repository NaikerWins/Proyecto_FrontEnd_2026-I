import api from "../interceptors/busesInterceptor";

const API_URL = "/rutas";

class RutaService {
    async getRutas(): Promise<any[]> {
        try {
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener rutas:", error);
            return [];
        }
    }
}

export const rutaService = new RutaService();