import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Tu URL del backend NestJS

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces para servicios
export interface Service {
  id?: string;
  professionalId?: string;
  name: string;
  description: string;
  price: number;
  duration: number; // en minutos
  category: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  service?: Service;
  services?: Service[];
}

export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
}

export interface UpdateServiceData extends CreateServiceData {
  id: string;
}

const servicesService = {
  // Obtener todos los servicios del profesional logueado
  async getMyServices(): Promise<ServiceResponse> {
    try {
      const response = await api.get('/services/my-services');
      return {
        success: true,
        message: 'Servicios obtenidos correctamente',
        services: response.data.services || response.data
      };
    } catch (error: any) {
      console.error('Error obteniendo servicios:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener los servicios'
      };
    }
  },

  // Crear un nuevo servicio
  async createService(serviceData: CreateServiceData): Promise<ServiceResponse> {
    try {
      const response = await api.post('/services', serviceData);
      return {
        success: true,
        message: 'Servicio creado exitosamente',
        service: response.data.service || response.data
      };
    } catch (error: any) {
      console.error('Error creando servicio:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear el servicio'
      };
    }
  },

  // Actualizar un servicio existente
  async updateService(serviceData: UpdateServiceData): Promise<ServiceResponse> {
    try {
      const { id, ...updateData } = serviceData;
      const response = await api.put(`/services/${id}`, updateData);
      return {
        success: true,
        message: 'Servicio actualizado exitosamente',
        service: response.data.service || response.data
      };
    } catch (error: any) {
      console.error('Error actualizando servicio:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar el servicio'
      };
    }
  },

  // Eliminar un servicio
  async deleteService(serviceId: string): Promise<ServiceResponse> {
    try {
      await api.delete(`/services/${serviceId}`);
      return {
        success: true,
        message: 'Servicio eliminado exitosamente'
      };
    } catch (error: any) {
      console.error('Error eliminando servicio:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar el servicio'
      };
    }
  },

  // Cambiar estado activo/inactivo de un servicio
  async toggleServiceStatus(serviceId: string, isActive: boolean): Promise<ServiceResponse> {
    try {
      const response = await api.patch(`/services/${serviceId}/status`, { isActive });
      return {
        success: true,
        message: `Servicio ${isActive ? 'activado' : 'desactivado'} correctamente`,
        service: response.data.service || response.data
      };
    } catch (error: any) {
      console.error('Error cambiando estado del servicio:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cambiar el estado del servicio'
      };
    }
  },

  // Obtener servicios de un profesional específico (para clientes)
  async getServicesByProfessional(professionalId: string): Promise<ServiceResponse> {
    try {
      const response = await api.get(`/services/professional/${professionalId}`);
      return {
        success: true,
        message: 'Servicios obtenidos correctamente',
        services: response.data.services || response.data
      };
    } catch (error: any) {
      console.error('Error obteniendo servicios del profesional:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener los servicios'
      };
    }
  },

  // Obtener servicios por categoría
  async getServicesByCategory(category: string): Promise<ServiceResponse> {
    try {
      const response = await api.get(`/services/category/${category}`);
      return {
        success: true,
        message: 'Servicios obtenidos correctamente',
        services: response.data.services || response.data
      };
    } catch (error: any) {
      console.error('Error obteniendo servicios por categoría:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener los servicios'
      };
    }
  },

  // Obtener un servicio específico por ID
  async getServiceById(serviceId: string): Promise<ServiceResponse> {
    try {
      const response = await api.get(`/services/${serviceId}`);
      return {
        success: true,
        message: 'Servicio obtenido correctamente',
        service: response.data.service || response.data
      };
    } catch (error: any) {
      console.error('Error obteniendo servicio:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener el servicio'
      };
    }
  }
};

export default servicesService;