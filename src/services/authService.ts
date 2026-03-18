import api from "../interceptors/axiosInterceptor";

const API_URL = "";

export const authService = {
  async loginWithGoogle(googleToken: string) {
    try {
      const response = await api.post(`${API_URL}/security/login/google`, {
        token: googleToken
      });
      return response.data;
    } catch (error) {
      console.error("Error en login con Google:", error);
      throw error;
    }
  },

  async registerWithGoogle(googleToken: string, userData: any) {
    try {
      const response = await api.post(`${API_URL}/security/login/register`, {
        token: googleToken,
        ...userData
      });
      return response.data;
    } catch (error) {
      console.error("Error en registro con Google:", error);
      throw error;
    }
  }
};