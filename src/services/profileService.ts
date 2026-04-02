import api from "../interceptors/axiosInterceptor";
import { Profile } from "../models/Profile";

const PROFILES_BASE = "/profiles";

class ProfileService {
  async getAllProfiles(): Promise<any[] | null> {
    try {
      const response = await api.get(PROFILES_BASE);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data?.profiles) {
        return response.data.profiles;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener perfiles:", error);
      return null;
    }
  }

  async getProfileById(id: number): Promise<Profile | null> {
    try {
      const response = await api.get<Profile>(`${PROFILES_BASE}/${id}`);
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

      const id =
        profileData instanceof FormData
          ? formData.get("id")
          : profileData.id;

      const response = await api.post<Profile>(
        `${PROFILES_BASE}/user/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error al crear perfil:", error);
      return null;
    }
  }

  async updateProfile(
    id: number,
    profile: Partial<Profile>
  ): Promise<Profile | null> {
    try {
      const response = await api.put<Profile>(
        `${PROFILES_BASE}/${id}`,
        profile
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      return null;
    }
  }

  async deleteProfile(id: number): Promise<boolean> {
    try {
      await api.delete(`${PROFILES_BASE}/${id}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar perfil:", error);
      return false;
    }
  }
}

export const profileService = new ProfileService();
