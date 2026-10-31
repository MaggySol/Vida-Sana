import axios from "axios";

// Detectar en qué página está parado el usuario
const currentHost = window.location.hostname;

// Definir la URL del backend dinámicamente
const getBaseURL = () => {
  // En localhost se usa el backend local
  if (currentHost === "localhost" || currentHost === "127.0.0.1") {
    return "http://127.0.0.1:8000/api";
  }

  // Para DevTunnel se usa el túnel del backend
  return "https://r48tkd13-8000.brs.devtunnels.ms/api";
};

// Crear la instancia de Axios con la URL dinámica
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token && !config.url.includes("/auth/login/")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
