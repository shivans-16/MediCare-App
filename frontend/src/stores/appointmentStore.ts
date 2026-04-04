


import { getWithAuth, postWithAuth, putWithAuth } from "../services/httpService";
import { create } from "zustand";

// ===========================
// Interfaces / Types
// ===========================

export interface Appointment {
    _id: string;
    doctorId: any;
    patientId: any;
    date: string;
    slotStartIso: string;
    slotEndIso: string;
    consultationType: 'Video Consultation' | 'Voice Call';
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'In Progress';
    symptoms: string;
    zegoRoomId: string;
    fees: number;
    prescription?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AppointmentFilters {
    status?: string | string[];
    from?: string;
    to?: string;
    date?: string;
    sortBy?: 'date' | 'createdAt' | 'status';
    sortOrder?: 'asc' | 'desc';
}

export interface BookingData {
    doctorId: string;
    slotStartIso: string;
    slotEndIso: string;
    consultationType?: string;
    symptoms: string;
    date: string;
    consultationFees: number;
    platformFees: number;
    totalAmount: number;
}

interface AppointmentState {
    appointments: Appointment[];
    bookedSlots: string[];
    currentAppointment: Appointment | null;
    loading: boolean;
    error: string | null;

    // Actions
    clearError: () => void;
    setCurrentAppointment: (appointment: Appointment) => void;

    // Api Actions
    fetchAppointments: (role: 'doctor' | 'patient', tab?: string, filters?: AppointmentFilters) => Promise<void>;
    fetchBookedSlots: (doctorId: string, date: string) => Promise<void>;
    fetchAppointmentById: (appointmentId: string) => Promise<Appointment | null>;
    bookAppointment: (data: BookingData) => Promise<any>;
    joinConsultation: (appointmentId: string) => Promise<void>;
    endConsultation: (appointmentId: string, prescription?: string, notes?: string) => Promise<void>;
    updateAppointmentStatus: (appointmentId: string, status: string) => Promise<void>;
}

// ===========================
// Store
// ===========================

export const useAppointmentStore = create<AppointmentState>((set) => ({
    appointments: [],
    bookedSlots: [],
    currentAppointment: null,
    loading: false,
    error: null,

    clearError: () => set({ error: null }),

    setCurrentAppointment: (appointment) => set({ currentAppointment: appointment }),

    // ✅ Fetch all appointments - role & tab based
    fetchAppointments: async (role, tab = '', filters = {}) => {
        set({ loading: true, error: null });
        try {
            const endPoint = role === 'doctor'
                ? '/appointment/doctor'
                : '/appointment/patient';

            const queryParams = new URLSearchParams();

            // Tab based status filter
            if (tab === 'upcoming') {
                queryParams.append('status', 'Scheduled');
                queryParams.append('status', 'In Progress');
            } else if (tab === 'past') {
                queryParams.append('status', 'Completed');
                queryParams.append('status', 'Cancelled');
            }

            // Additional filters
            Object.entries(filters).forEach(([key, value]) => {
                if (
                    value !== undefined &&
                    value !== null &&
                    value !== '' &&
                    key !== 'status'
                ) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v.toString()));
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });

            const response = await getWithAuth(
                `${endPoint}?${queryParams.toString()}`
            );
            set({ appointments: response.data ?? [] });
           // set({ appointments: response.data.data ?? [] });

        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    // ✅ Fetch booked slots for a doctor on a date
    fetchBookedSlots: async (doctorId: string, date: string) => {
        set({ loading: true, error: null });
        try {
            const response = await getWithAuth(
                `/appointment/booked-slots?doctorId=${doctorId}&date=${date}`
            );
            set({ bookedSlots: response.data.data ?? [] });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    // ✅ Fetch single appointment by ID
    fetchAppointmentById: async (appointmentId: string) => {
        set({ loading: true, error: null });
        try {
            const response = await getWithAuth(`/appointment/${appointmentId}`);
               console.log("🔍 Raw response:", response)
            const appointment = response.data ?? null;
            set({ currentAppointment: appointment });
            return appointment;
        } catch (error: any) {
            set({ error: error.message });
            return null;
        } finally {
            set({ loading: false });
        }
    },

    // ✅ Book a new appointment
   bookAppointment: async (data: BookingData) => {
    set({ loading: true, error: null });
    try {
        const response = await postWithAuth('/appointment/book', data);
        const newAppointment = response.data; // ✅ .data.data नहीं, सिर्फ .data
        if (newAppointment) {
            set((state) => ({
                appointments: [...state.appointments, newAppointment]
            }));
        }
        return newAppointment; // ✅ ab _id milega
    } catch (error: any) {
        set({ error: error.message });
        throw error;
    } finally {
        set({ loading: false });
    }
},

    // ✅ Join consultation (Video/Voice)
    joinConsultation: async (appointmentId: string) => {
        set({ loading: true, error: null });
        try {
            const response = await putWithAuth(
                `/appointment/${appointmentId}/join`, {}
            );
            const updated = response.data.data ?? null;
            set((state) => ({
                currentAppointment: updated,
                appointments: state.appointments.map((apt) =>
                    apt._id === appointmentId
                        ? { ...apt, status: 'In Progress' as Appointment['status'] }
                        : apt
                )
            }));
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    // ✅ End consultation with prescription & notes
    endConsultation: async (appointmentId: string, prescription?: string, notes?: string) => {
        set({ loading: true, error: null });
        try {
            const response = await putWithAuth(
                `/appointment/${appointmentId}/end`,
                { prescription, notes }
            );
            const updated = response.data.data ?? null;
            set((state) => ({
                currentAppointment: updated,
                appointments: state.appointments.map((apt) =>
                    apt._id === appointmentId
                        ? { ...apt, status: 'Completed' as Appointment['status'] }
                        : apt
                )
            }));
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    // ✅ Update appointment status
    updateAppointmentStatus: async (appointmentId: string, status: string) => {
        set({ loading: true, error: null });
        try {
            const response = await putWithAuth(
                `/appointment/status/${appointmentId}`,
                { status }
            );
            const updated = response.data.data ?? null;
            set((state) => ({
                currentAppointment: updated,
                appointments: state.appointments.map((apt) =>
                    apt._id === appointmentId
                        ? { ...apt, status: status as Appointment['status'] }
                        : apt
                )
            }));
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    }
}));

