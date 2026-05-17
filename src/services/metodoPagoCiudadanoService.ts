import { Mpc } from "../models/metodoPagoCiudadano";
import api from "../interceptors/busesInterceptor";

const API_URL = "/metodospagociudadano";

class MpcService {

    async getMpc(): Promise<Mpc[]> {
        try {
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener el método de pago del ciudadano:", error);
            return [];
        }
    }

    async getMpcById(id: string): Promise<Mpc | null> {
        try {
            const response = await api.get<Mpc>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Método de pago del usuario no encontrado:", error);
            return null;
        }
    }

    /**
     * Crear nuevo mpc
     */
    async createMpc(mpc: Omit<Mpc, "id">): Promise<Mpc | null> {
        try {
            const response = await api.post<Mpc>(API_URL, mpc);
            return response.data;
        } catch (error) {
            console.error("Error al crear el método de pago del ciudadano:", error);
            return null;
        }
    }

    //Actualizar 

    async updateMpc(id: string, mpc: Partial<Mpc>): Promise<Mpc | null> {
        try {
            const response = await api.patch<Mpc>(`${API_URL}/${id}`, mpc);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar el método de pago del ciudadano:", error);
            return null;
        }
    }

    // Eliminar 
    async deleteMpc(id: string): Promise<boolean> {
        try {
            await api.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar el método de pago del ciudadano:", error);
            return false;
        }
    }

    async iniciarRecarga(id: number, monto: number, email: string): Promise<any> {
        try {
            const response = await api.post(`${API_URL}/iniciar-recarga/${id}`, { monto, email });
            return response.data;
        } catch (error) {
            console.error("Error al iniciar recarga:", error);
            return null;
        }
    }

    async confirmarRecarga (referencia: string, estado: string, monto: number ){
        try {
            const response = await api.post(`${API_URL}/confirmar-recarga`, { referencia, estado, monto });
            return response.data;
        } catch (error) {
            console.error("No se pudo confirmar recarga:", error);
            return null;
        }
    }

    async getMpcByCiudadano(ciudadano_id: string): Promise<Mpc[]> {
    try {
        const response = await api.get<Mpc[]>(`${API_URL}/ciudadano/${ciudadano_id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener métodos de pago:', error);
        return [];
    }
}

}

export const mpcService = new MpcService();
