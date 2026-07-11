import { create } from "zustand";
import { api } from "@/lib/api";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "user" | "admin";
  watchlist: string[];
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
    riskTolerance: "conservative" | "moderate" | "aggressive";
  };
  createdAt: string;
  lastLogin: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const { user, accessToken, refreshToken } = data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const { user, accessToken, refreshToken } = data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await api.post("/auth/logout", { refreshToken });
    } catch {
      // Silently fail — we're logging out anyway
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
