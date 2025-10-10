// src/services/servicesService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL });

// ✅ Interceptor para autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
  _id: service._id || service.id
});

export const servicesService = {
  getMyServices: async () => {
    try {
      const response = await api.get('/services/my-services');
      console.log('🔍 Respuesta getMyServices:', response.data);
      
      let services = [];
      
      if (Array.isArray(response.data)) {
        services = response.data;
      } else if (response.data.services) {
        services = response.data.services;
      } else if (response.data.data) {
        services = response.data.data;
      }
      
      const normalizedServices = services.map(normalizeService);
      
      return {
        success: true,
        services: normalizedServices
      };
    } catch (error: any) {
      console.error('❌ Error en getMyServices:', error);
      throw error;
    }
  },

  createService: async (serviceData: CreateServiceData) => {
    try {
      const response = await api.post('/services', serviceData);
      console.log('🔍 Respuesta createService:', response.data);
      
      return {
        success: true,
        service: normalizeService(response.data),
        message: 'Servicio creado exitosamente'
      };
    } catch (error: any) {
      console.error('❌ Error en createService:', error);
      throw error;
    }
  },

  // ✅ ARREGLAR - cambiar firma para que coincida con el componente:
  updateService: async (updateData: UpdateServiceData) => {
    try {
      const { id, ...serviceData } = updateData;
      const serviceId = id;
      
      const response = await api.put(`/services/${serviceId}`, serviceData);
      console.log('🔍 Respuesta updateService:', response.data);
      
      return {
        success: true,
        service: normalizeService(response.data),
        message: 'Servicio actualizado exitosamente'
      };
    } catch (error: any) {
      console.error('❌ Error en updateService:', error);
      throw error;
    }
  },

  deleteService: async (serviceId: string) => {
    try {
      const response = await api.delete(`/services/${serviceId}`);
      console.log('🔍 Respuesta deleteService:', response.data);
      
      return {
        success: true,
        message: 'Servicio eliminado exitosamente'
      };
    } catch (error: any) {
      console.error('❌ Error en deleteService:', error);
      throw error;
    }
  },

  toggleServiceStatus: async (serviceId: string, isActive: boolean) => {
    try {
      const response = await api.patch(`/services/${serviceId}/status`, { isActive });
      console.log('🔍 Respuesta toggleServiceStatus:', response.data);
      
      return {
        success: true,
        service: normalizeService(response.data),
        message: `Servicio ${isActive ? 'activado' : 'desactivado'} exitosamente`
      };
    } catch (error: any) {
      console.error('❌ Error en toggleServiceStatus:', error);
      throw error;
    }
  },

  getServicesByProfessional: async (professionalId: string) => {
    try {
      const response = await api.get(`/services/professional/${professionalId}`);
      console.log('🔍 Respuesta getServicesByProfessional:', response.data);
      
      let services = [];
      if (Array.isArray(response.data)) {
        services = response.data;
      } else if (response.data.services) {
        services = response.data.services;
      }
      
      return services.map(normalizeService);
    } catch (error: any) {
      console.error('❌ Error en getServicesByProfessional:', error);
      throw error;
    }
  }
};

export default servicesService;