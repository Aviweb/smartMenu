import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { api } from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  business: Business | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  updateBusiness: (business: Partial<Business>) => void;
}

interface RegisterData {
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  password: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  business: null,
  isLoading: true,
  isAuthenticated: false,

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      const userStr = await SecureStore.getItemAsync("auth_user");
      const businessStr = await SecureStore.getItemAsync("auth_business");

      if (token && userStr && businessStr) {
        set({
          token,
          user: JSON.parse(userStr),
          business: JSON.parse(businessStr),
          isAuthenticated: true,
        });
      }
    } catch {
      // Clear corrupted storage
      await SecureStore.deleteItemAsync("auth_token");
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    const { token, user, business } = response.data;

    await SecureStore.setItemAsync("auth_token", token);
    await SecureStore.setItemAsync("auth_user", JSON.stringify(user));
    await SecureStore.setItemAsync("auth_business", JSON.stringify(business));

    set({ token, user, business, isAuthenticated: true });
  },

  register: async (data) => {
    const response = await api.post("/api/auth/register", data);
    const { token, user, business } = response.data;

    await SecureStore.setItemAsync("auth_token", token);
    await SecureStore.setItemAsync("auth_user", JSON.stringify(user));
    await SecureStore.setItemAsync("auth_business", JSON.stringify(business));

    set({ token, user, business, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("auth_user");
    await SecureStore.deleteItemAsync("auth_business");
    set({ token: null, user: null, business: null, isAuthenticated: false });
  },

  updateBusiness: (updates) => {
    set((state) => ({
      business: state.business ? { ...state.business, ...updates } : null,
    }));
  },
}));
