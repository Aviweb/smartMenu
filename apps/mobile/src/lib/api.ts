import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`[API Error] ${error.response.status} ${error.config?.url}`, JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error(`[API Network Error] No response received for ${error.config?.url}`, error.message);
    } else {
      console.error(`[API Error]`, error.message);
    }
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("auth_token");
    }
    return Promise.reject(error);
  }
);
