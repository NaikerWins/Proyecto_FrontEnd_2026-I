import { User } from "../models/User";
import api from "../interceptors/axiosInterceptor";
import axios from "axios";

const API_URL = "/users";

class UserService {
    async getUsers(): Promise<User[]> {
        try {
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            return [];
        }
    }

    /**
 * 🔹 Iniciar sesión mediante OAuth (Google, Microsoft, GitHub)
 */
    async loginWithOAuth(provider: "google" | "microsoft" | "github", credential: string): Promise<User | null> {
        try {
            console.log("🔹 Llamando a:", `/auth/${provider}`);
            const response = await api.post<User>(`/auth/${provider}`, { credential });
            console.log("✅ Respuesta:", response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ Error al autenticar con ${provider}:`, error);
            if (axios.isAxiosError(error) && error.response) {
                console.error("📡 Backend respondió:", error.response.status, error.response.data);
            }
            return null;
        }
    }



    async getUserById(id: string): Promise<User | null> {
        try {
            const response = await api.get<User>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Usuario no encontrado:", error);
            return null;
        }
    }

    /**
     * 🔹 Crear nuevo usuario
     */
    async createUser(user: Omit<User, "id">): Promise<User | null> {
        try {
            const response = await api.post<User>(API_URL, user);
            return response.data;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            return null;
        }
    }

    //Actualizar usuarioPermite actualizar su perfil, dirección u otros campos

    async updateUser(id: string, user: Partial<User>): Promise<User | null> {
        try {
            const response = await api.put<User>(`${API_URL}/${id}`, user);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            return null;
        }
    }

    // Eliminar usuario
    async deleteUser(id: string): Promise<boolean> {
        try {
            await api.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            return false;
        }
    }
}

export const userService = new UserService();
