import axios from "axios";

const api = axios.create({
  baseURL: "https://backendrender-3-3pdg.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;