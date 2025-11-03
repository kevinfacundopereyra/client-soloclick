// src/services/paymentsService.ts
import axios from "axios";
// Nota: CreatePaymentButton no es necesario en el archivo de servicio.

const API_BASE_URL = "http://localhost:3000";
const api = axios.create({ baseURL: API_BASE_URL });

// Interceptor para autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 CORRECCIÓN 1: Interfaz para el cliente poblado
export interface ClientData {
  _id: string;
  name: string;
  email: string;
}

export interface Payment {
  _id: string;
  id?: string;
  appointmentId: string;
  // 🚨 CORRECCIÓN 2: clientId ahora puede ser el objeto poblado o una cadena/null.
  clientId: string | ClientData | null;
  clientName: string; // Este campo puede seguir existiendo si se guarda directo
  serviceName: string;
  amount: number;
  commission: number;
  netAmount: number;
  paymentMethod: "cash" | "card" | "transfer" | "digital";
  status: "pending" | "completed" | "failed" | "refunded";
  paymentDate: string;
  serviceDate: string;
  city?: string;
  notes?: string;
}

export interface PaymentStats {
  totalIncome: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
  totalCommissions: number;
  completedPayments: number;
  pendingPayments: number;
  averageService: number;
}

// Definimos un tipo auxiliar para el cálculo, asegurando los campos necesarios
type PaymentItem = {
  status: "pending" | "completed" | "failed" | "refunded";
  netAmount: number;
  commission: number;
  paymentDate: string; // Incluimos paymentDate si se necesita para filtrar por mes/semana
};

export const paymentsService = {
  // Método para crear un pago y preferencia en Mercado Pago
  createPayment: async (createPaymentDto: Partial<Payment>) => {
    try {
      // ✅ Usando 'api' y ruta relativa
      const response = await api.post(
        "/payments/create-preference",
        createPaymentDto
      );
      return response.data;
    } catch (error) {
      const e: any = error;
      console.error("Error creando pago:", e);
      const message =
        e.response?.data?.message || e.message || "Error creando pago";
      const err = new Error(message);
      (err as any).original = e;
      throw err;
    }
  },

  // ✅ MÉTODO CORREGIDO Y CENTRAL PARA OBTENER PAGOS
  getMyPayments: async (): Promise<{
    success: boolean;
    payments: Payment[];
    stats: PaymentStats;
  }> => {
    try {
      console.log("🔄 Obteniendo pagos del backend...");

      // ✅ Usamos 'api.get' que incluye el token
      const response = await api.get("/payments/my-payments");
      console.log("✅ Respuesta del backend:", response.data);

      const { success, payments, stats } = response.data;

      console.log("📊 Datos recibidos:", {
        success,
        paymentsCount: payments?.length || 0,
        hasStats: !!stats,
      });

      // --- Lógica de Normalización ---
      type NormalizedPaymentItem = Payment & {
        netAmount: number;
        commission: number;
      };

      const normalizedPayments = (payments || []).map(
        (payment: any): NormalizedPaymentItem => ({
          ...payment,
          id: payment._id || payment.id,
          // Usar la lógica de cálculo si netAmount no existe (aunque debería venir del backend)
          netAmount:
            payment.netAmount || payment.amount - (payment.commission || 0),
          commission: payment.commission || 0,
          // Asegurar que las fechas sean cadenas
          paymentDate:
            payment.paymentDate instanceof Date
              ? payment.paymentDate.toISOString()
              : payment.paymentDate,
          serviceDate:
            payment.serviceDate instanceof Date
              ? payment.serviceDate.toISOString()
              : payment.serviceDate,
        })
      );

      // Aseguramos que normalizedPayments es un array del tipo que necesitamos
      const typedPayments = normalizedPayments as PaymentItem[];

      // --- Lógica de Cálculo de Estadísticas (Consistencia con tu estructura) ---
      const finalStats: PaymentStats = stats || {
        // Total Income: Tipamos 'p' y 'sum'
        totalIncome: typedPayments
          .filter((p) => p.status === "completed") // p ya es tipo PaymentItem
          .reduce((sum: number, p) => sum + (p.netAmount || 0), 0), // ✅ Tipamos 'sum' como number

        thisMonth: 0,
        thisWeek: 0,
        today: 0,

        // Total Commissions: Tipamos 'sum'
        totalCommissions: typedPayments.reduce(
          (sum: number, p) => sum + (p.commission || 0), // ✅ Tipamos 'sum' como number
          0
        ),

        // Completed Payments: Tipamos 'p' (aunque ya está resuelto por typedPayments)
        completedPayments: typedPayments.filter((p) => p.status === "completed")
          .length,

        // Pending Payments: Tipamos 'p'
        pendingPayments: typedPayments.filter((p) => p.status === "pending")
          .length,

        averageService: 0,
      };

      console.log("🎯 RESULTADO FINAL:", {
        success: true,
        paymentsCount: normalizedPayments.length,
        statsCalculated: true,
      });

      return {
        success: true,
        payments: normalizedPayments,
        stats: finalStats,
      };
    } catch (error: any) {
      console.error("❌ Error obteniendo pagos:", error);

      if (error.response?.status === 401) {
        console.error(
          "🔐 Error 401: Token inválido o expirado. Inicia sesión para continuar."
        );
        throw new Error("No autorizado - inicia sesión como profesional");
      }
      throw error;
    }
  },

  // Método para obtener pagos por período específico (usa getMyPayments)
  getPaymentsByPeriod: async (
    period: "today" | "week" | "month" | "all"
  ): Promise<Payment[]> => {
    try {
      console.log(`🔄 Obteniendo pagos por período: ${period}`);
      // Esta llamada va al backend esperando que filtre los pagos
      const response = await api.get(`/payments/my-payments?period=${period}`);
      return response.data.payments || [];
    } catch (error) {
      console.error("Error filtering payments:", error);
      // Si falla, se devuelve un array vacío para no romper la UI
      return [];
    }
  },
};

export default paymentsService;

// La clase PaymentMethodsService (tu código original) se mantiene igual
// ...
