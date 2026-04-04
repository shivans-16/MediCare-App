
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types";
import { getWithAuth, postWithAuth, postWithoutAuth } from "../services/httpService";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  setUser: (user: User, token: string) => void;
  cleanError: () => void;
  logout: () => void;

  loginDoctor: (email: string, password: string) => Promise<void>;
  loginPatient: (email: string, password: string) => Promise<void>;
  registerDoctor: (data: any) => Promise<void>;
  registerPatient: (data: any) => Promise<void>;

  fetchProfile: () => Promise<User | null>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      // ✅ Set user after login/register
      setUser: (user, token) => {
        localStorage.setItem("token", token);
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });
      },

      // ✅ Clear error
      cleanError: () => set({ error: null }),

      // ✅ Logout
      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // ✅ Doctor Login
      loginDoctor: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await postWithoutAuth(
            "auth/doctor/login",
            { email, password }
          );

          console.log("🔍 RESPONSE:", JSON.stringify(response.data));

          const userData: User = {
            ...response.data,
            type: "doctor",
            onboarded: response.data.onboarded ?? false, // ✅ backend na bheje toh false
          };

          get().setUser(userData, response.data.token);

          return response.data;
        } catch (error: any) {
          set({ error: error?.message || "Login failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Patient Login
      loginPatient: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await postWithoutAuth(
            "auth/patient/login",
            { email, password }
          );

          const userData: User = {
            ...response.data,
            type: "patient",
            onboarded: response.data.onboarded ?? false, // ✅ backend na bheje toh false
          };

          get().setUser(userData, response.data.token);

          return response.data;
        } catch (error: any) {
          set({ error: error?.message || "Login failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Doctor Register
      registerDoctor: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await postWithoutAuth(
            "auth/doctor/register",
            data
          );

          const userData: User = {
            ...response.data,
            type: "doctor",
            onboarded: response.data.onboarded ?? false,
          };

          get().setUser(userData, response.data.token);

        } catch (error: any) {
          set({ error: error?.message || "Registration failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Patient Register
      registerPatient: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await postWithoutAuth(
            "auth/patient/register",
            data
          );

          const userData: User = {
            ...response.data,
            type: "patient",
            onboarded: response.data.onboarded ?? false,
          };

          get().setUser(userData, response.data.token);

        } catch (error: any) {
          set({ error: error?.message || "Registration failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Fetch Profile
      fetchProfile: async () => {
        set({ loading: true, error: null });
        try {
          const { user } = get();

          if (!user) throw new Error("User not found");

          const endPoint =
            user.type === "doctor"
              ? "doctor/me"
              : "patient/me";

          const response = await getWithAuth(endPoint);

          const updatedUser: User = {
            ...user,
            ...response.data,
          };

          set({ user: updatedUser });

          return updatedUser;

        } catch (error: any) {
          set({ error: error?.message || "Failed to fetch profile" });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Update Profile (Onboarding)
      updateProfile: async (data) => {
        set({ loading: true, error: null });
        try {
          const { user } = get();

          if (!user) throw new Error("User not found");

          const endPoint =
            user.type === "doctor"
              ? "doctor/onboarding/update"
              : "patient/onboarding/update";

          const response = await postWithAuth(endPoint, data);

          const updatedUser: User = {
            ...user,
            ...response.data,
            onboarded: true,
          };

          set({ user: updatedUser });

        } catch (error: any) {
          set({ error: error?.message || "Profile update failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),

    // ✅ Persist Config
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
