import { useState, useEffect, useCallback } from 'react';
import paymentMethodsService from '../services/paymentMethodsService';
import type { PaymentMethod } from '../services/paymentMethodsService';

interface UseFeaturedPaymentsReturn {
  paymentMethods: PaymentMethod[];
  featuredPayments: PaymentMethod[];
  featuredIds: string[];
  isFeatured: (paymentMethodId: string) => boolean;
  toggleFeatured: (paymentMethodId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useFeaturedPayments = (): UseFeaturedPaymentsReturn => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar métodos de pago y destacados al inicializar
  useEffect(() => {
    const loadPaymentMethods = () => {
      try {
        const methods = paymentMethodsService.getPaymentMethods();
        const featured = paymentMethodsService.getFeaturedPaymentIds();
        
        setPaymentMethods(methods);
        setFeaturedIds(featured);
      } catch (err) {
        setError('Error al cargar métodos de pago');
        console.error('Error cargando métodos de pago:', err);
      }
    };

    loadPaymentMethods();
  }, []);

  // Obtener métodos destacados
  const featuredPayments = paymentMethods.filter(method => 
    featuredIds.includes(method.id)
  );

  // Función para verificar si un método está destacado
  const isFeatured = useCallback((paymentMethodId: string): boolean => {
    return featuredIds.includes(paymentMethodId);
  }, [featuredIds]);

  // Función para alternar destacado
  const toggleFeatured = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentMethodsService.toggleFeatured(paymentMethodId);
      
      if (result.success) {
        // Actualizar el estado local
        const updatedFeaturedIds = paymentMethodsService.getFeaturedPaymentIds();
        setFeaturedIds(updatedFeaturedIds);
        return true;
      } else {
        setError(result.message || 'Error al modificar método destacado');
        return false;
      }
    } catch (err) {
      setError('Error al modificar método destacado');
      console.error('Error en toggleFeatured:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    paymentMethods,
    featuredPayments,
    featuredIds,
    isFeatured,
    toggleFeatured,
    isLoading,
    error
  };
};

export default useFeaturedPayments;