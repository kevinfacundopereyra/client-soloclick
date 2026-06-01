import axios from "axios";
import { API_CONFIG } from "../config/api";

const api = axios.create({ baseURL: API_CONFIG.BASE_URL });

// Interceptor para autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ConfirmationEmailData {
  appointmentId: string;
  clientEmail: string;
  professionalEmail: string;
  clientName: string;
  professionalName: string;
  serviceNames: string[];
  date: string;
  time: string;
  totalPrice: number;
}

export const emailService = {
  // Enviar email de confirmación de turno
  sendAppointmentConfirmation: async (
    data: ConfirmationEmailData
  ): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(
        "📧 Enviando email de confirmación de turno con datos:",
        data
      );

      const response = await api.post("/emails/appointment-confirmation", data);

      console.log("✅ Email enviado exitosamente:", response.data);

      return {
        success: true,
        message: "Email de confirmación enviado",
      };
    } catch (error: any) {
      console.error("❌ Error al enviar email:", error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Error al enviar email de confirmación",
      };
    }
  },

  // Enviar email de confirmación de pago
  sendPaymentConfirmation: async (appointmentId: string): Promise<boolean> => {
    try {
      console.log("📧 Enviando email de confirmación de pago...");

      const response = await api.post(
        `/emails/payment-confirmation/${appointmentId}`
      );

      console.log("✅ Email de pago enviado:", response.data);
      return true;
    } catch (error: any) {
      console.error("❌ Error al enviar email de pago:", error);
      return false;
    }
  },
};

export default emailService;
