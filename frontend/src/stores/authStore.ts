

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
  loginAdmin: (email: string, password: string) => Promise<void>;
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

      // setUser: (user, token) => {
      //   localStorage.setItem("token", token);
      //   set({
      //     user,
      //     token,
      //     isAuthenticated: true,
      //     error: null,
      //   });
      // },
      setUser: (user, token) => {
  localStorage.setItem("token", token);
  // Token save hone ka time store karo
  localStorage.setItem("token_saved_at", Date.now().toString());
  set({
    user,
    token,
    isAuthenticated: true,
    error: null,
  });
},

      cleanError: () => set({ error: null }),

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

    
      loginDoctor: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await postWithoutAuth("auth/doctor/login", { email, password });

         
          const basicUser: User = {
            ...response.data,
            type: "doctor",
            onboarded: false,
          };
          get().setUser(basicUser, response.data.token);

          
          const fullProfile = await get().fetchProfile();

          if (fullProfile) {
            set({
              user: {
                ...fullProfile,
                type: "doctor",
              
                onboarded: (fullProfile as any).isOnboarded ?? false,
              },
            });
          }

          return response.data;
        } catch (error: any) {
          set({ error: error?.message || "Login failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

   
      loginPatient: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await postWithoutAuth("auth/patient/login", { email, password });

          const basicUser: User = {
            ...response.data,
            type: "patient",
            onboarded: false,
          };
          get().setUser(basicUser, response.data.token);

          const fullProfile = await get().fetchProfile();

          if (fullProfile) {
            set({
              user: {
                ...fullProfile,
                type: "patient",
                onboarded: (fullProfile as any).isOnboarded ?? fullProfile.onboarded ?? false,
              },
            });
          }

          return response.data;
        } catch (error: any) {
          set({ error: error?.message || "Login failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

       loginAdmin: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await postWithoutAuth("/admin/auth/login", { email, password }) as any;
          console.log("Admin response:", response);
          const basicUser: User = {
            ...response.user,
            type: "admin",
            onboarded: false,
          };
          get().setUser(basicUser, response.token);

          const fullProfile = await get().fetchProfile();

          if (fullProfile) {
            set({
              user: {
                ...fullProfile,
                type: "admin",
                onboarded: (fullProfile as any).isOnboarded ?? fullProfile.onboarded ?? false,
              },
            });
          }

          return response.data;
        } catch (error: any) {
          set({ error: error?.message || "Login failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

     
      registerDoctor: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await postWithoutAuth("auth/doctor/register", data);

          const userData: User = {
            ...response.data,
            type: "doctor",
            onboarded: false,
          };

          get().setUser(userData, response.data.token);
        } catch (error: any) {
          set({ error: error?.message || "Registration failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

  
      registerPatient: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await postWithoutAuth("auth/patient/register", data);

          const userData: User = {
            ...response.data,
            type: "patient",
            onboarded: false,
          };

          get().setUser(userData, response.data.token);
        } catch (error: any) {
          set({ error: error?.message || "Registration failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

     
      fetchProfile: async () => {
        try {
          const { user } = get();
          if (!user) throw new Error("User not found");

          const endPoint = user.type === "doctor" ? "doctor/me" : user.type ==="patient" ? "patient/me" : "admin/profile";
          const response = await getWithAuth(endPoint);

          const updatedUser: User = {
            ...user,
            ...response.data,
           
            onboarded: response.data.isOnboarded ?? response.data.onboarded ?? false,
          };

          set({ user: updatedUser });
          return updatedUser;
        } catch (error: any) {
          set({ error: error?.message || "Failed to fetch profile" });
          return null;
        }
      },

     
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

    // {
    //   name: "auth-storage",
    //   partialize: (state) => ({
    //     user: state.user,
    //     token: state.token,
    //     isAuthenticated: state.isAuthenticated,
    //   }),
    // }
    {
  name: "auth-storage",
  partialize: (state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
  }),
  onRehydrateStorage: () => (state) => {
    if (!state) return;
    
    const savedAt = localStorage.getItem("token_saved_at");
    const SIX_DAYS = 6 * 24 * 60 * 60 * 1000; // 6 din milliseconds mein
    
    // Agar token 6 din se purana hai toh logout kar do
    if (savedAt && Date.now() - parseInt(savedAt) > SIX_DAYS) {
      state.logout();
    }
  },
}
  )
);