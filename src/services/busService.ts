import api from "../interceptors/busesInterceptor";

const API_URL = "/buses";

class BusService {
    async getBuses(): Promise<any[]> {
        try {
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener buses:", error);
            return [];
        }
    }
}

export const busService = new BusService();