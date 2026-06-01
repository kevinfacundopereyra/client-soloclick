import axios from "axios";
import { API_CONFIG } from "../config/api";

const api = axios.create({ baseURL: API_CONFIG.BASE_URL });

// ✅ Interceptor para autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interfaces
export interface AvailableSlot {
  time: string; // "09:00", "09:30", etc.
  available: boolean;
}

export interface CreateAppointmentData {
  professionalId: string;
  clientId?: string;
  services: string[]; // IDs de los servicios
  date: string; // "2024-10-09"
  time: string; // "14:30"
  totalPrice: number;
  totalDuration: number;
  notes?: string;
}

export interface Appointment {
  _id: string;
  professional: {
    _id: string;
    name: string;
    specialty: string;
  };
  client?: {
    _id: string;
    name: string;
    email: string;
  };
  services: Array<{
    _id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  totalDuration: number;
  notes?: string;
  createdAt: string;
}

export const appointmentsService = {
  // ✅ CAMBIAR - usar tu endpoint real
  getAvailableSlots: async (professionalId: string, date: string) => {
    try {
      console.log(
        `🔍 Obteniendo horarios para profesional ${professionalId} el ${date}`
      );

      const [professionalResponse, appointmentsResponse] = await Promise.all([
        api.get(`/professionals/${professionalId}`),
        api.get(`/appointments/professional/${professionalId}`),
      ]);

      const professional = professionalResponse.data;
      const existingAppointments = appointmentsResponse.data || [];

      console.log("✅ Profesional:", professional);
      console.log("✅ Citas existentes:", existingAppointments);

      // ✅ SIEMPRE usar la función correcta
      const availableSlots = generateAvailableSlotsWithRealHours(
        date,
        professional.workingHours,
        professional.appointmentDuration || 45,
        existingAppointments
      );

      return {
        success: true,
        slots: availableSlots,
      };
    } catch (error: any) {
      console.error("❌ Error obteniendo horarios:", error);

      // ✅ CAMBIAR: usar horarios reales también en el fallback
      console.log("⚠️ Error conectando con backend, usando horarios vacíos");
      return {
        success: false,
        slots: [], // ✅ Devolver array vacío en lugar de mock
        error: error.message,
      };
    }
  },

  // ✅ SOLO BACKEND: Crear cita únicamente en el backend
  createAppointment: async (appointmentData: CreateAppointmentData) => {
    try {
      console.log("🔍 Creando cita en backend:", appointmentData);

      const backendData = {
        professionalId: appointmentData.professionalId,
        clientId: appointmentData.clientId, // ✅ INCLUIR clientId
        services: appointmentData.services,
        date: appointmentData.date,
        time: appointmentData.time,
        totalPrice: appointmentData.totalPrice,
        totalDuration: appointmentData.totalDuration,
        notes: appointmentData.notes || "",
      };

      console.log("📤 Datos enviando al backend:", JSON.stringify(backendData, null, 2));

      const response = await api.post("/appointments", backendData);
      console.log("✅ Cita creada en backend:", response.data);

      return {
        success: true,
        appointment: response.data,
        message: "Cita reservada exitosamente",
      };
    } catch (error: any) {
      console.error("❌ Error creando cita en backend:", error);
      throw error;
    }
  },

  // ✅ SOLO BACKEND: Obtener citas únicamente del backend
  getMyAppointments: async () => {
    try {
      console.log("🔍 Obteniendo citas del backend");

      const response = await api.get("/appointments");
      console.log("✅ Citas del backend:", response.data?.length || 0);

      return {
        success: true,
        appointments: response.data || [],
      };
    } catch (error: any) {
      console.error("❌ Error obteniendo mis citas del backend:", error);
      throw error;
    }
  },

  // ✅ USAR tu endpoint existente
  getProfessionalAppointments: async (professionalId?: string) => {
    try {
      let url = "/appointments";

      if (professionalId) {
        url = `/appointments/professional/${professionalId}`;
      }

      const response = await api.get(url);
      console.log("✅ Citas del profesional:", response.data);

      return {
        success: true,
        appointments: response.data,
      };
    } catch (error: any) {
      console.error("❌ Error obteniendo citas del profesional:", error);
      throw error;
    }
  },

  // ✅ USAR DELETE /appointments/:id (tu backend actual)
  /* cancelAppointment: async (appointmentId: string, reason?: string) => { */
  cancelAppointment: async (appointmentId: string) => {
    try {
      // Tu backend usa DELETE, no PATCH /cancel
      const response = await api.delete(`/appointments/${appointmentId}`);

      console.log("✅ Cita eliminada:", response.data);

      return {
        success: true,
        message: "Cita cancelada exitosamente",
      };
    } catch (error: any) {
      console.error("❌ Error cancelando cita:", error);
      throw error;
    }
  },

  // ✅ REEMPLAZAR la función confirmAppointment mock
  confirmAppointment: async (appointmentId: string) => {
    try {
      console.log("🔍 Confirmando cita:", appointmentId);

      // Usar updateStatus que ya funciona
      const response = await appointmentsService.updateStatus(
        appointmentId,
        "confirmed"
      );

      console.log("✅ Cita confirmada:", response);
      return {
        success: true,
        appointment: response,
        message: "Cita confirmada exitosamente",
      };
    } catch (error: any) {
      console.error("❌ Error confirmando cita:", error);
      throw error;
    }
  },

  // ✅ AGREGAR función para completar cita
  completeAppointment: async (appointmentId: string) => {
    try {
      console.log("🔍 Completando cita:", appointmentId);

      // Usar updateStatus que ya funciona
      const response = await appointmentsService.updateStatus(
        appointmentId,
        "completed"
      );

      console.log("✅ Cita completada:", response);
      return {
        success: true,
        appointment: response,
        message: "Cita completada exitosamente",
      };
    } catch (error: any) {
      console.error("❌ Error completando cita:", error);
      throw error;
    }
  },

  // ✅ AGREGAR - Actualizar status de cita
  updateStatus: async (appointmentId: string, newStatus: string) => {
    try {
      console.log(
        `🔍 Actualizando status de cita ${appointmentId} a ${newStatus}`
      );

      // ✅ USAR 'api' en lugar de 'axios' para usar los interceptors
      const response = await api.patch(
        `/appointments/${appointmentId}/status`, // ✅ Sin API_BASE_URL (ya está en api)
        { status: newStatus }
      );

      console.log("✅ Status actualizado:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error actualizando status:", error);
      throw error;
    }
  },
};

// ✅ MANTENER SOLO esta función (ya está bien):
function generateAvailableSlotsWithRealHours(
  targetDate: string,
  workingHours: any,
  appointmentDuration: number,
  existingAppointments: any[]
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];

  const date = new Date(targetDate);
  const jsDay = date.getDay();
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = dayNames[jsDay];

  console.log(`🔍 Fecha: ${targetDate}`);
  console.log(`🔍 Date.getDay(): ${jsDay} (0=Dom, 1=Lun, etc.)`);
  console.log(`🔍 Día mapeado: ${dayName}`);

  const daySchedule = workingHours?.[dayName];

  if (
    !daySchedule ||
    !daySchedule.open ||
    !daySchedule.close ||
    daySchedule.open === "" ||
    daySchedule.close === ""
  ) {
    console.log(`⚠️ Profesional no trabaja los ${dayName}`);
    return []; // ✅ Array vacío = no horarios
  }

  console.log(
    `✅ Horarios ${dayName}: ${daySchedule.open} - ${daySchedule.close}`
  );

  // 3. Convertir horarios a minutos para cálculos
  const [openHour, openMin] = daySchedule.open.split(":").map(Number);
  const [closeHour, closeMin] = daySchedule.close.split(":").map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  console.log(`🔍 Apertura: ${openHour}:${openMin} (${openMinutes} min)`);
  console.log(`🔍 Cierre: ${closeHour}:${closeMin} (${closeMinutes} min)`);
  console.log(`🔍 Duración de cita: ${appointmentDuration} min`);

  // 4. Filtrar citas del día específico
  const dayAppointments = existingAppointments.filter((apt) => {
    const aptDate = apt.date;
    if (typeof aptDate === "string") {
      // Comparar exactamente la fecha (formato YYYY-MM-DD)
      const aptDateOnly = aptDate.split("T")[0]; // Remover hora si existe
      return aptDateOnly === targetDate;
    }
    return false;
  });

  const occupiedTimes = dayAppointments.map((apt) => apt.time);
  console.log(`🔍 Citas del día ${targetDate}:`, dayAppointments.length);
  console.log(`🔍 Horarios ocupados:`, occupiedTimes);

  // 5. Generar slots cada X minutos (según appointmentDuration)
  for (
    let minutes = openMinutes;
    minutes < closeMinutes;
    minutes += appointmentDuration
  ) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const timeString = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    // Verificar si hay tiempo suficiente para la cita antes del cierre
    if (minutes + appointmentDuration <= closeMinutes) {
      const isOccupied = occupiedTimes.includes(timeString);

      slots.push({
        time: timeString,
        available: !isOccupied,
      });
    }
  }

  console.log(
    `✅ Slots generados para ${dayName}: ${slots.length} horarios totales`
  );
  console.log(
    `✅ Horarios disponibles: ${slots.filter((s) => s.available).length}`
  );

  return slots;
}

export default appointmentsService;
