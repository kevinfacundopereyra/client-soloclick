import { useState, useEffect } from "react";
import { api } from "../services/professionalsService";

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // en minutos
  category: string;
  isActive: boolean;
}

export const useServicesByProfessional = (professionalId: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Llamar al endpoint que ya tienes en tu backend
        const response = await api.get(
          `/services/professional/${professionalId}`
        );

        console.log("🔍 Servicios del profesional:", response.data);

        // Filtrar solo servicios activos
        const activeServices = response.data.filter(
          (service: Service) => service.isActive
        );

        setServices(activeServices);
      } catch (err: any) {
        console.error("❌ Error obteniendo servicios:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (professionalId) {
      fetchServices();
    }
  }, [professionalId]);

  return { services, loading, error };
};
