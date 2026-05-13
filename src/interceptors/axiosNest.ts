import axios from "axios";

const NEST_BASE_URL = import.meta.env.VITE_NEST_URL || "http://localhost:3000";

const apiNest = axios.create({
  baseURL: NEST_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiNest.interceptors.request.use((request) => {
  const token =
    localStorage.getItem("session") || localStorage.getItem("token");
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

export default apiNest;