import axios from "axios";

const EXCLUDED_ROUTES = ["/login", "/register", "/auth"];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor de solicitud
api.interceptors.request.use(
  (request) => {
    console.log(`🚀 ${request.method?.toUpperCase()} ${request.url}`, request.data);
    
    const shouldExclude = EXCLUDED_ROUTES.some((route) => 
      request.url?.includes(route)
    );
    
    // Agregar token si la ruta no está excluida
    if (!shouldExclude) {
      const token = localStorage.getItem("session") || localStorage.getItem("token");
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return request;
  },
  (error) => {
    console.error("❌ Error en interceptor de solicitud:", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.response?.status} ${error.config?.url}:`, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log("No autorizado, redirigiendo a login...");
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("token");
      window.location.href = "/auth/signin";
    }
    
    if (error.response?.status === 403) {
      console.log("Acceso denegado");
     
    }
    
    return Promise.reject(error);
  }
);

export default api;