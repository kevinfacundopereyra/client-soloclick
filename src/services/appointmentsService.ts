import { api } from '../professionals/services/professionalsService';
import { API_CONFIG } from '../config/api';

// Interfaces para los datos de appointment
export interface ServiceItem {
  serviceId: string;
  name: string;
  duration: number;
  price: number;
}

export interface CreateAppointmentData {
  userId: string;
  professionalId: string;
  services: ServiceItem[];
  date: string; // formato YYYY-MM-DD
  startTime: string; // formato HH:mm
  endTime: string; // formato HH:mm
  totalDuration: number;
  totalPrice: number;
  paymentMethod: string;
  notes?: string;
  status: string;
}

export interface Appointment {
  _id: string;
  userId: string;
  professionalId: string;
  services: ServiceItem[];
  date: Date;
  startTime: string;
  endTime: string;
  totalDuration: number;
  totalPrice: number;
  paymentMethod: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentResponse {
  success: boolean;
  message: string;
  appointment?: Appointment;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
}

// Servicio de appointments
export const appointmentsService = {
  // Crear nueva cita
  createAppointment: async (appointmentData: CreateAppointmentData): Promise<AppointmentResponse> => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.APPOINTMENTS, appointmentData);
      return {
        success: true,
        message: 'Cita creada exitosamente',
        appointment: response.data
      };
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear la cita'
      };
    }
  },

  // Obtener citas del usuario
  getUserAppointments: async (userId: string): Promise<{ success: boolean; appointments?: Appointment[] }> => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/user/${userId}`);
      return {
        success: true,
        appointments: response.data
      };
    } catch (error: any) {
      console.error('Error fetching user appointments:', error);
      return {
        success: false
      };
    }
  },

  // Obtener citas del profesional
  getProfessionalAppointments: async (professionalId: string): Promise<{ success: boolean; appointments?: Appointment[] }> => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/professional/${professionalId}`);
      return {
        success: true,
        appointments: response.data
      };
    } catch (error: any) {
      console.error('Error fetching professional appointments:', error);
      return {
        success: false
      };
    }
  },

  // Verificar disponibilidad de horarios para un profesional en una fecha específica
  getAvailableSlots: async (professionalId: string, date: string): Promise<{ success: boolean; slots?: AvailableSlot[] }> => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/availability/${professionalId}?date=${date}`);
      return {
        success: true,
        slots: response.data
      };
    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      return {
        success: false
      };
    }
  },

  // Cancelar cita
  cancelAppointment: async (appointmentId: string): Promise<AppointmentResponse> => {
    try {
      const response = await api.patch(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${appointmentId}/cancel`);
      return {
        success: true,
        message: 'Cita cancelada exitosamente',
        appointment: response.data
      };
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cancelar la cita'
      };
    }
  },

  // Obtener una cita específica
  getAppointment: async (appointmentId: string): Promise<{ success: boolean; appointment?: Appointment }> => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${appointmentId}`);
      return {
        success: true,
        appointment: response.data
      };
    } catch (error: any) {
      console.error('Error fetching appointment:', error);
      return {
        success: false
      };
    }
  },

  // Confirmar cita (para el profesional)
  confirmAppointment: async (appointmentId: string): Promise<AppointmentResponse> => {
    try {
      const response = await api.patch(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${appointmentId}/confirm`);
      return {
        success: true,
        message: 'Cita confirmada exitosamente',
        appointment: response.data
      };
    } catch (error: any) {
      console.error('Error confirming appointment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al confirmar la cita'
      };
    }
  }
};

export default appointmentsService;