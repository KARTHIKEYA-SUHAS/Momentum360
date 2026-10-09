import axios from "axios";
import { getAccessToken } from "./authStorage";

const api = axios.create({
  baseURL: "http://192.168.1.3:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
