import axios from "axios";
import { useAuthStore } from "../store/authStore.ts";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api`,
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401 Unauthorized
      const logout = useAuthStore.getState().logout;
      logout();
      // Optional: Redirect to login page or handle appropriately in components
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
