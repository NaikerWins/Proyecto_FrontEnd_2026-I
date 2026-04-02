import axios from "axios";
import {
  ACCESS_DENIED_MESSAGE,
  ACCESS_DENIED_STORAGE_KEY,
  SESSION_INVALID_MESSAGE,
  SESSION_INVALID_STORAGE_KEY,
} from "../constants/authMessages";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8081";

/**
 * Rutas que no deben llevar Bearer (login, registro, etc.).
 */
function shouldAttachBearer(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0].toLowerCase();
  if (path.includes("/security")) return false;
  if (path.includes("/login")) return false;
  if (path.includes("/register")) return false;
  if (path.includes("/auth/")) return false;
  return true;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (request) => {
    if (shouldAttachBearer(request.url)) {
      const token =
        localStorage.getItem("session") || localStorage.getItem("token");
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
    }
    return request;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/auth/signin")) {
        sessionStorage.setItem(SESSION_INVALID_STORAGE_KEY, SESSION_INVALID_MESSAGE);
        window.location.href = "/auth/signin";
      }
    } else if (status === 403) {
      const data = error.response?.data as
        | { message?: string; error?: string }
        | undefined;
      const msg =
        (typeof data?.message === "string" && data.message.trim()) ||
        (typeof data?.error === "string" && data.error.trim()) ||
        ACCESS_DENIED_MESSAGE;
      if (!window.location.pathname.startsWith("/unauthorized")) {
        sessionStorage.setItem(ACCESS_DENIED_STORAGE_KEY, msg);
        window.location.href = "/unauthorized";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
