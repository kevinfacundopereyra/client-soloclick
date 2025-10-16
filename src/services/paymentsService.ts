// src/services/paymentsService.ts
import axios from "axios";
import CreatePaymentButton from "../components/CreatePaymentButton";

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

export interface Payment {
  _id: string;
  id?: string;
  appointmentId: string;
  clientName: string;
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

export const paymentsService = {
  // Método para crear un pago y preferencia en Mercado Pago
  createPayment: async (createPaymentDto: Partial<Payment>) => {
    try {
      const response = await api.post("/payments", createPaymentDto);
      return response.data;
    } catch (error) {
      console.error("Error creando pago:", error);
      throw error;
    }
  },
  getMyPayments: async (): Promise<{
    success: boolean;
    payments: Payment[];
    stats: PaymentStats;
  }> => {
    try {
      console.log("🔄 Obteniendo pagos del backend...");

      const response = await api.get("/payments/my-payments");
      console.log("✅ Respuesta del backend:", response.data);

      // ✅ SIMPLIFICAR: Como el backend ya funciona, usar directamente la respuesta
      const { success, payments, stats } = response.data;

      console.log("📊 Datos recibidos:", {
        success,
        paymentsCount: payments?.length || 0,
        hasStats: !!stats,
      });

      // ✅ Normalizar pagos si es necesario
      const normalizedPayments = (payments || []).map((payment: any) => ({
        ...payment,
        id: payment._id || payment.id,
        netAmount:
          payment.netAmount || payment.amount - (payment.commission || 0),
        commission: payment.commission || 0,
        // ✅ Asegurar que las fechas estén en formato string
        paymentDate:
          payment.paymentDate instanceof Date
            ? payment.paymentDate.toISOString()
            : payment.paymentDate,
        serviceDate:
          payment.serviceDate instanceof Date
            ? payment.serviceDate.toISOString()
            : payment.serviceDate,
      }));

      // ✅ Usar stats del backend o calcular básicas
      type FinalStats = {
        totalIncome: number;
        thisMonth: number;
        thisWeek: number;
        today: number;
        totalCommissions: number;
        completedPayments: number;
        pendingPayments: number;
        averageService: number;
      };

      type Payment = {
        status: string;
        netAmount?: number;
        commission?: number;
        sum: number;
        // otros campos...
      };

      const finalStats: FinalStats = stats || {
        totalIncome: (normalizedPayments as Payment[])
          .filter((p: Payment) => p.status === "completed")
          .reduce((sum: number, p: Payment) => sum + (p.netAmount || 0), 0),
        thisMonth: normalizedPayments
          .filter((p: Payment) => p.status === "completed")
          .reduce((sum: number, p: Payment) => sum + (p.netAmount || 0), 0),
        thisWeek: normalizedPayments
          .filter((p: Payment) => p.status === "completed")
          .reduce((sum: number, p: Payment) => sum + (p.netAmount || 0), 0),
        today: normalizedPayments
          .filter((p: Payment) => p.status === "completed")
          .reduce((sum: number, p: Payment) => sum + (p.netAmount || 0), 0),
        totalCommissions: normalizedPayments.reduce(
          (sum: number, p: Payment) => sum + (p.commission || 0),
          0
        ),
        completedPayments: normalizedPayments.filter(
          (p: Payment) => p.status === "completed"
        ).length,
        pendingPayments: normalizedPayments.filter(
          (p: Payment) => p.status === "pending"
        ).length,
        averageService:
          normalizedPayments.filter((p: Payment) => p.status === "completed")
            .length > 0
            ? normalizedPayments
                .filter((p: Payment) => p.status === "completed")
                .reduce(
                  (sum: number, p: Payment) => sum + (p.netAmount || 0),
                  0
                ) /
              normalizedPayments.filter(
                (p: Payment) => p.status === "completed"
              ).length
            : 0,
      };

      console.log("🎯 RESULTADO FINAL:", {
        success: true,
        paymentsCount: normalizedPayments.length,
        statsCalculated: true,
        firstPayment: normalizedPayments[0] || null,
      });

      return {
        success: true,
        payments: normalizedPayments,
        stats: finalStats,
      };
    } catch (error: any) {
      console.error("❌ Error obteniendo pagos:", error);
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Data:", error.response?.data);

      // ✅ Si hay error de autenticación, informar claramente
      if (error.response?.status === 401) {
        console.error(
          "🔐 Error de autenticación - verifica que estés logueado como profesional"
        );
        throw new Error("No autorizado - inicia sesión como profesional");
      }

      throw error;
    }
  },

  // ✅ NUEVO: Método para obtener pagos por período específico
  getPaymentsByPeriod: async (
    period: "today" | "week" | "month" | "all"
  ): Promise<Payment[]> => {
    try {
      console.log(`🔄 Obteniendo pagos por período: ${period}`);
      const response = await api.get(`/payments/my-payments?period=${period}`);
      return response.data.payments || [];
    } catch (error) {
      console.error("Error filtering payments:", error);
      // Fallback: obtener todos y filtrar en frontend
      const allPayments = await paymentsService.getMyPayments();
      return allPayments.payments;
    }
  },

  // (Duplicate createPayment removed)
};

export default paymentsService;
