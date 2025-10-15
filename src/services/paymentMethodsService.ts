export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank' | 'wallet';
  name: string; // "Visa ****1234"
  isDefault: boolean;
  isFeatured: boolean;
  details: {
    last4?: string;
    brand?: string;
    expiryDate?: string;
    email?: string; // Para PayPal
    bankName?: string; // Para transferencia
  };
}

interface PaymentMethodResponse {
  success: boolean;
  message?: string;
  paymentMethods?: PaymentMethod[];
}

class PaymentMethodsService {
  private readonly PAYMENT_METHODS_KEY = 'soloclick_payment_methods';
  private readonly FEATURED_PAYMENTS_KEY = 'soloclick_featured_payments';

  /**
   * Obtiene todos los métodos de pago del usuario
   */
  getPaymentMethods(): PaymentMethod[] {
    try {
      const methods = localStorage.getItem(this.PAYMENT_METHODS_KEY);
      return methods ? JSON.parse(methods) : this.getDefaultPaymentMethods();
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      return this.getDefaultPaymentMethods();
    }
  }

  /**
   * Métodos de pago por defecto (simulados)
   */
  private getDefaultPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: '1',
        type: 'card',
        name: 'Visa ****1234',
        isDefault: true,
        isFeatured: false,
        details: {
          last4: '1234',
          brand: 'Visa',
          expiryDate: '12/26'
        }
      },
      {
        id: '2',
        type: 'card',
        name: 'Mastercard ****5678',
        isDefault: false,
        isFeatured: false,
        details: {
          last4: '5678',
          brand: 'Mastercard',
          expiryDate: '08/25'
        }
      },
      {
        id: '3',
        type: 'paypal',
        name: 'PayPal - usuario@email.com',
        isDefault: false,
        isFeatured: false,
        details: {
          email: 'usuario@email.com'
        }
      },
      {
        id: '4',
        type: 'bank',
        name: 'Transferencia - Banco Nación',
        isDefault: false,
        isFeatured: false,
        details: {
          bankName: 'Banco Nación'
        }
      }
    ];
  }

  /**
   * Obtiene los IDs de métodos de pago destacados
   */
  getFeaturedPaymentIds(): string[] {
    try {
      const featured = localStorage.getItem(this.FEATURED_PAYMENTS_KEY);
      return featured ? JSON.parse(featured) : [];
    } catch (error) {
      console.error('Error al obtener métodos destacados:', error);
      return [];
    }
  }

  /**
   * Obtiene solo los métodos de pago destacados
   */
  getFeaturedPaymentMethods(): PaymentMethod[] {
    const allMethods = this.getPaymentMethods();
    const featuredIds = this.getFeaturedPaymentIds();
    
    return allMethods.filter(method => featuredIds.includes(method.id));
  }

  /**
   * Verifica si un método de pago está destacado
   */
  isFeatured(paymentMethodId: string): boolean {
    const featuredIds = this.getFeaturedPaymentIds();
    return featuredIds.includes(paymentMethodId);
  }

  /**
   * Agrega un método de pago a destacados
   */
  async addToFeatured(paymentMethodId: string): Promise<PaymentMethodResponse> {
    try {
      const featuredIds = this.getFeaturedPaymentIds();
      
      if (featuredIds.includes(paymentMethodId)) {
        return {
          success: false,
          message: 'El método de pago ya está destacado'
        };
      }

      // Máximo 3 métodos destacados
      if (featuredIds.length >= 3) {
        return {
          success: false,
          message: 'Solo puedes tener 3 métodos destacados. Quita uno primero.'
        };
      }

      const updatedFeatured = [...featuredIds, paymentMethodId];
      localStorage.setItem(this.FEATURED_PAYMENTS_KEY, JSON.stringify(updatedFeatured));

      return {
        success: true,
        message: 'Método agregado a destacados',
        paymentMethods: this.getFeaturedPaymentMethods()
      };
    } catch (error) {
      console.error('Error al agregar a destacados:', error);
      return {
        success: false,
        message: 'Error al agregar a destacados'
      };
    }
  }

  /**
   * Quita un método de pago de destacados
   */
  async removeFromFeatured(paymentMethodId: string): Promise<PaymentMethodResponse> {
    try {
      const featuredIds = this.getFeaturedPaymentIds();
      const updatedFeatured = featuredIds.filter(id => id !== paymentMethodId);
      
      localStorage.setItem(this.FEATURED_PAYMENTS_KEY, JSON.stringify(updatedFeatured));

      return {
        success: true,
        message: 'Método removido de destacados',
        paymentMethods: this.getFeaturedPaymentMethods()
      };
    } catch (error) {
      console.error('Error al remover de destacados:', error);
      return {
        success: false,
        message: 'Error al remover de destacados'
      };
    }
  }

  /**
   * Alterna el estado destacado de un método de pago
   */
  async toggleFeatured(paymentMethodId: string): Promise<PaymentMethodResponse> {
    if (this.isFeatured(paymentMethodId)) {
      return await this.removeFromFeatured(paymentMethodId);
    } else {
      return await this.addToFeatured(paymentMethodId);
    }
  }

  /**
   * Obtiene el icono según el tipo de método de pago
   */
  getPaymentIcon(type: PaymentMethod['type']): string {
    switch (type) {
      case 'card': return '💳';
      case 'paypal': return '🅿️';
      case 'bank': return '🏦';
      case 'wallet': return '👛';
      default: return '💳';
    }
  }

  /**
   * Limpia todos los métodos destacados (útil para logout)
   */
  clearFeaturedPayments(): void {
    localStorage.removeItem(this.FEATURED_PAYMENTS_KEY);
  }
}

export const paymentMethodsService = new PaymentMethodsService();
export default paymentMethodsService;