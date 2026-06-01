// src/services/servicesService.ts
import axios from "axios";

import { API_CONFIG } from '../config/api';

const api = axios.create({ 
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT
});

// ✅ Interceptor para autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interfaces que coincidan con el componente
export interface Service {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
}

// ✅ AGREGAR estas interfaces que faltaban:
export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
}

export interface UpdateServiceData {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
}

// ✅ Función para normalizar _id -> id
const normalizeService = (service: any): Service => ({
  ...service,
  id: service._id || service.id,
  _id: service._id || service.id,
});

// ✅ Función para crear servicios por defecto según especialidad
export const getDefaultServicesBySpecialty = (specialty: string): Service[] => {
  const servicesBySpecialty: { [key: string]: Service[] } = {
    Barberia: [
      {
        _id: "barberia-corte-basico",
        id: "barberia-corte-basico",
        name: "Corte Básico",
        description: "Corte de cabello clásico con tijera y máquina",
        price: 2500,
        duration: 30,
        category: "Corte",
        isActive: true,
      },
      {
        _id: "barberia-corte-premium",
        id: "barberia-corte-premium",
        name: "Corte Premium",
        description: "Corte de cabello con lavado, corte y peinado",
        price: 3500,
        duration: 45,
        category: "Corte",
        isActive: true,
      },
      {
        _id: "barberia-barba",
        id: "barberia-barba",
        name: "Arreglo de Barba",
        description: "Recorte y perfilado de barba profesional",
        price: 2000,
        duration: 25,
        category: "Barba",
        isActive: true,
      },
    ],
    Peluqueria: [
      {
        _id: "peluqueria-corte-dama",
        id: "peluqueria-corte-dama",
        name: "Corte de Dama",
        description: "Corte de cabello femenino con lavado y secado",
        price: 4000,
        duration: 60,
        category: "Corte",
        isActive: true,
      },
      {
        _id: "peluqueria-coloracion",
        id: "peluqueria-coloracion",
        name: "Coloración",
        description: "Tintura completa del cabello con productos premium",
        price: 5500,
        duration: 120,
        category: "Color",
        isActive: true,
      },
      {
        _id: "peluqueria-tratamiento",
        id: "peluqueria-tratamiento",
        name: "Tratamiento Capilar",
        description: "Hidratación profunda para cabello dañado",
        price: 3000,
        duration: 45,
        category: "Tratamiento",
        isActive: true,
      },
    ],
    Manicura: [
      {
        _id: "manicura-basica",
        id: "manicura-basica",
        name: "Manicura Básica",
        description: "Corte, limado y esmaltado de uñas",
        price: 2000,
        duration: 30,
        category: "Manicura",
        isActive: true,
      },
      {
        _id: "manicura-francesa",
        id: "manicura-francesa",
        name: "Manicura Francesa",
        description: "Manicura francesa clásica con esmaltado",
        price: 2500,
        duration: 40,
        category: "Manicura",
        isActive: true,
      },
      {
        _id: "manicura-gel",
        id: "manicura-gel",
        name: "Manicura en Gel",
        description: "Aplicación de gel semipermanente",
        price: 3500,
        duration: 60,
        category: "Manicura",
        isActive: true,
      },
    ],
  };

  return servicesBySpecialty[specialty] || servicesBySpecialty["Barberia"];
};

export const servicesService = {
  getMyServices: async () => {
    try {
      const response = await api.get("/services/my-services");
      console.log("🔍 Respuesta getMyServices:", response.data);

      let services = [];

      if (Array.isArray(response.data)) {
        services = response.data;
      } else if (response.data.services) {
        services = response.data.services;
      } else if (response.data.data) {
        services = response.data.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        // Si response.data es un objeto (pero no null), asumimos que es un servicio individual
        services = [response.data];
      }

      console.log("🔍 Servicios antes de normalizar:", services);
      const normalizedServices = services.map(normalizeService);

      return {
        success: true,
        services: normalizedServices,
      };
    } catch (error: any) {
      console.error("❌ Error en getMyServices:", error);
      throw error;
    }
  },

  createService: async (serviceData: CreateServiceData) => {
    try {
      const response = await api.post("/services", serviceData);
      console.log("🔍 Respuesta createService:", response.data);

      return {
        success: true,
        service: normalizeService(response.data),
        message: "Servicio creado exitosamente",
      };
    } catch (error: any) {
      console.error("❌ Error en createService:", error);
      throw error;
    }
  },

  // ✅ ARREGLAR - cambiar firma para que coincida con el componente:
  updateService: async (updateData: UpdateServiceData) => {
    try {
      const { id, ...serviceData } = updateData;
      const serviceId = id;

      const response = await api.put(`/services/${serviceId}`, serviceData);
      console.log("🔍 Respuesta updateService:", response.data);

      return {
        success: true,
        service: normalizeService(response.data),
        message: "Servicio actualizado exitosamente",
      };
    } catch (error: any) {
      console.error("❌ Error en updateService:", error);
      throw error;
    }
  },

  deleteService: async (serviceId: string) => {
    try {
      const response = await api.delete(`/services/${serviceId}`);
      console.log("🔍 Respuesta deleteService:", response.data);

      return {
        success: true,
        message: "Servicio eliminado exitosamente",
      };
    } catch (error: any) {
      console.error("❌ Error en deleteService:", error);
      throw error;
    }
  },

  toggleServiceStatus: async (serviceId: string, isActive: boolean) => {
    try {
      const response = await api.patch(`/services/${serviceId}/status`, {
        isActive,
      });
      console.log("🔍 Respuesta toggleServiceStatus:", response.data);

      return {
        success: true,
        service: normalizeService(response.data),
        message: `Servicio ${
          isActive ? "activado" : "desactivado"
        } exitosamente`,
      };
    } catch (error: any) {
      console.error("❌ Error en toggleServiceStatus:", error);
      throw error;
    }
  },

  getServicesByProfessional: async (professionalId: string) => {
    try {
      const response = await api.get(`/services/professional/${professionalId}`);
      console.log(
        "🔍 Servicios obtenidos por profesional:",
        response.data
      );
      const services = Array.isArray(response.data)
        ? response.data
        : response.data.services || response.data.data || [];
      return services.map(normalizeService);
    } catch (error: any) {
      console.error("❌ Error en getServicesByProfessional:", error);
      throw error;
    }
  },
};

export default servicesService;
