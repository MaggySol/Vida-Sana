import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    console.log("PETICIÓN:", config.url);
    console.log("TOKEN EXISTE:", !!token);

    if (token && !config.url.includes("/auth/login/")) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("AUTHORIZATION AGREGADO");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
