

import { Doctor, DoctorFilters } from "@/lib/types";
import { getWithAuth, getWithoutAuth } from "../services/httpService";
import { create } from "zustand";

interface DoctorState {
    doctors: Doctor[];
    currentDoctor: Doctor | null;
    dashboard: any;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };

    clearError: () => void;
    setCurrentDoctor: (doctor: Doctor) => void;
    fetchDoctors: (filters: DoctorFilters) => Promise<void>;
    fetchDoctorById: (id: string) => Promise<void>;
    fetchDashboard:(period?:string)=>Promise<void>
}

export const useDoctorStore = create<DoctorState>((set) => ({
    doctors: [],
    currentDoctor: null,
    dashboard: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0
    },

    clearError: () => set({ error: null }),
    setCurrentDoctor: (doctor) => set({ currentDoctor: doctor }),

    fetchDoctors: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            // ✅ Public route - getWithoutAuth use karo
            const response = await getWithoutAuth(
                `/doctor/list?${queryParams.toString()}`
            );

            set({
                doctors: response.data.data ?? [],
                pagination: {
                    page: response.data.meta?.page || 1,
                    limit: response.data.meta?.limit || 20,
                    total: response.data.meta?.total || 0
                }
            });

        } catch (error: any) {
            set({ error: error.message });
        } finally {
            // ✅ finally mein sirf loading band karo, error mat clear karo
            set({ loading: false });
        }
    },

    fetchDoctorById: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const response = await getWithAuth(`/doctor/${id}`);
            set({ currentDoctor: response.data });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            // ✅ finally mein sirf loading band karo
            set({ loading: false });
        }
    },

     fetchDashboard: async () => {
        set({ loading: true, error: null });
        try {
            const response = await getWithAuth(`/doctor/dashboard`);
            set({ dashboard: response.data });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            // ✅ finally mein sirf loading band karo
            set({ loading: false });
        }
    }

}));