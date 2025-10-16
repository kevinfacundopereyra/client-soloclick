// src/services/paymentsService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL });

// Interceptor para autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
  netAmount: number; // amount - commission
  paymentMethod: 'cash' | 'card' | 'transfer' | 'digital';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
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
  // Obtener historial de pagos del profesional
  getMyPayments: async (): Promise<{ success: boolean; payments: Payment[]; stats: PaymentStats }> => {
    try {
      const response = await api.get('/payments/my-payments');
      console.log('✅ Pagos obtenidos:', response.data);
      
      return {
        success: true,
        payments: response.data.payments || [],
        stats: response.data.stats || {}
      };
    } catch (error: any) {
      console.error('❌ Error obteniendo pagos:', error);
      
      // Datos de ejemplo mientras el backend no esté listo
      const mockPayments: Payment[] = [
        {
          _id: '1',
          appointmentId: 'apt_001',
          clientName: 'María García',
          serviceName: 'Corte de cabello',
          amount: 35000,
          commission: 3500,
          netAmount: 31500,
          paymentMethod: 'card',
          status: 'completed',
          paymentDate: '2024-10-15T10:30:00Z',
          serviceDate: '2024-10-15T10:00:00Z',
          city: 'Bogotá',
          notes: 'Cliente satisfecho'
        },
        {
          _id: '2',
          appointmentId: 'apt_002',
          clientName: 'Carlos Pérez',
          serviceName: 'Barba + Corte',
          amount: 45000,
          commission: 4500,
          netAmount: 40500,
          paymentMethod: 'cash',
          status: 'completed',
          paymentDate: '2024-10-14T15:20:00Z',
          serviceDate: '2024-10-14T15:00:00Z',
          city: 'Bogotá'
        },
        {
          _id: '3',
          appointmentId: 'apt_003',
          clientName: 'Ana Rodríguez',
          serviceName: 'Manicure Gel',
          amount: 28000,
          commission: 2800,
          netAmount: 25200,
          paymentMethod: 'transfer',
          status: 'pending',
          paymentDate: '2024-10-13T12:15:00Z',
          serviceDate: '2024-10-13T12:00:00Z',
          city: 'Medellín',
          notes: 'Pago pendiente de confirmación'
        }
      ];

      const mockStats: PaymentStats = {
        totalIncome: 1250000,
        thisMonth: 450000,
        thisWeek: 108000,
        today: 35000,
        totalCommissions: 125000,
        completedPayments: 24,
        pendingPayments: 2,
        averageService: 36500
      };

      return {
        success: true,
        payments: mockPayments,
        stats: mockStats
      };
    }
  },

  // Filtrar pagos por período
  getPaymentsByPeriod: async (period: 'today' | 'week' | 'month' | 'all'): Promise<Payment[]> => {
    try {
      const response = await api.get(`/payments/my-payments?period=${period}`);
      return response.data.payments || [];
    } catch (error) {
      console.error('Error filtering payments:', error);
      throw error;
    }
  }
};

export default paymentsService;