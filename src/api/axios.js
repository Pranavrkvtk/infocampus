import axios from "axios";

const api = axios.create({
  baseURL: "https://backendrender-3-3pdg.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Don't send JWT for login/register
  if (
    token &&
    config.url !== "/auth/login" &&
    config.url !== "/auth/register"
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;