import { Bus } from "../models/Bus";
import apiNest from "../interceptors/axiosNestInterceptor";
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

    async getBusById(id: number): Promise<Bus | null> {
        try {
            const response = await apiNest.get<Bus>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Bus no encontrado:", error);
            return null;
        }
    }

    async createBus(bus: Omit<Bus, "id" | "codigoQR" | "gps">, empresaId: number): Promise<Bus | null> {
        try {
            const response = await apiNest.post<Bus>(
                `${API_URL}?empresaId=${empresaId}`,
                bus
            );
            return response.data;
        } catch (error) {
            console.error("Error al crear bus:", error);
            return null;
        }
    }

    async updateBus(id: number, bus: Partial<Bus>): Promise<Bus | null> {
        try {
            const response = await apiNest.put<Bus>(`${API_URL}/${id}`, bus);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar bus:", error);
            return null;
        }
    }

    async updateEstado(id: number, estado: string): Promise<Bus | null> {
        try {
            const response = await apiNest.patch<Bus>(`${API_URL}/${id}/estado`, { estado });
            return response.data;
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            return null;
        }
    }

    async deleteBus(id: number): Promise<boolean> {
        try {
            await apiNest.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar bus:", error);
            return false;
        }
    }
}

export const busService = new BusService();