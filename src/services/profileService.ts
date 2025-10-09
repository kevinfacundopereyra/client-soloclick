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

export interface WorkingHoursDay {
  open: string;
  close: string;
}

export interface WorkingHours {
  monday: WorkingHoursDay;
  tuesday: WorkingHoursDay;
  wednesday: WorkingHoursDay;
  thursday: WorkingHoursDay;
  friday: WorkingHoursDay;
  saturday: WorkingHoursDay;
  sunday: WorkingHoursDay;
}

export interface ProfileData {
  description: string;
  address: string;
  workingHours: WorkingHours;
  images?: string[];
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  profile?: {
    description: string;
    address: string;
    workingHours: WorkingHours;
    images: string[];
    isProfileComplete: boolean;
  };
}

class ProfileService {
  /**
   * Obtiene el perfil del profesional logueado
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await api.get('/professionals/profile');
      return {
        success: true,
        message: 'Perfil obtenido exitosamente',
        profile: response.data.profile
      };
    } catch (error: any) {
      console.error('Error al obtener perfil:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener perfil'
      };
    }
  }

  /**
   * Actualiza el perfil del profesional
   */
  async updateProfile(profileData: ProfileData): Promise<ProfileResponse> {
    try {
      const response = await api.put('/professionals/profile', profileData);
      return {
        success: true,
        message: 'Perfil actualizado exitosamente',
        profile: response.data.profile
      };
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar perfil'
      };
    }
  }

  /**
   * Sube imágenes del perfil
   */
  async uploadImages(files: FileList): Promise<ProfileResponse> {
    try {
      const formData = new FormData();
      
      // Agregar archivos al FormData
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const response = await api.post('/professionals/profile/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        message: 'Imágenes subidas exitosamente',
        profile: response.data.profile
      };
    } catch (error: any) {
      console.error('Error al subir imágenes:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al subir imágenes'
      };
    }
  }

  /**
   * Verifica si el profesional tiene el perfil completo
   */
  async checkProfileCompletion(): Promise<{ isComplete: boolean; percentage: number }> {
    try {
      const response = await this.getProfile();
      
      if (!response.success || !response.profile) {
        return { isComplete: false, percentage: 0 };
      }

      const profile = response.profile;
      let completedFields = 0;
      const totalFields = 3; // description, address, workingHours

      // Verificar campos completados
      if (profile.description && profile.description.trim().length > 0) completedFields++;
      if (profile.address && profile.address.trim().length > 0) completedFields++;
      if (profile.workingHours) completedFields++;

      const percentage = Math.round((completedFields / totalFields) * 100);
      const isComplete = percentage >= 100;

      return { isComplete, percentage };
    } catch (error) {
      console.error('Error verificando completitud del perfil:', error);
      return { isComplete: false, percentage: 0 };
    }
  }
}

export const profileService = new ProfileService();
export default profileService;