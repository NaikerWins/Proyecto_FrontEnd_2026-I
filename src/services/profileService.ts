import axios from "axios";
import { Profile } from "../models/Profile";

const API_URL = `${import.meta.env.VITE_API_URL}/profiles`;

class ProfileService {
    async getAllProfiles(): Promise<any[] | null> {
        try {
            const response = await axios.get(API_URL);
            console.log("✅ Respuesta del backend:", response.data);
            // Si el backend devuelve directamente un array:
            if (Array.isArray(response.data)) {
                return response.data;
            }
            // Si devuelve un objeto con una propiedad "profiles":
            if (response.data.profiles) {
                return response.data.profiles;
            }
            return [];
        } catch (error) {
            console.error("❌ Error al obtener perfiles:", error);
            return null;
        }
    }


    async getProfileById(id: number): Promise<Profile | null> {
        try {
            const response = await axios.get<Profile>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Perfil no encontrado:", error);
            return null;
        }
    }

    async createProfile(profileData: Profile | FormData): Promise<Profile | null> {
        try {
            let formData: FormData;

            if (profileData instanceof FormData) {
                formData = profileData;
            } else {
                formData = new FormData();
                formData.append("phone", profileData.phone);
                if (profileData.photoURL instanceof File) {
                    formData.append("photo", profileData.photoURL);
                }
            }

            const id = profileData instanceof FormData
                ? formData.get("id")
                : profileData.id;

            const url = `${API_URL}/user/${id}`;

            const response = await axios.post<Profile>(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return response.data;
        } catch (error) {
            console.error("Error al crear perfil:", error);
            return null;
        }
    }

    async updateProfile(id: number, profile: Partial<Profile>): Promise<Profile | null> {
        try {
            const response = await axios.put<Profile>(`${API_URL}/${id}`, profile);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            return null;
        }
    }

    async deleteProfile(id: number): Promise<boolean> {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar perfil:", error);
            return false;
        }
    }
}

export const profileService = new ProfileService();
