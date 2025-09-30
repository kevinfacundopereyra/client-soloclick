import axios from 'axios';

// Configuración base de axios - usando tu estructura de backend
const API_BASE_URL = 'http://localhost:3000'; // Tu puerto del backend

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interfaces para los tipos de datos
export interface UserRegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
}

export interface ProfessionalRegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  specialty: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    userType: 'user' | 'professional';
  };
  token?: string;
}

// Funciones del servicio de autenticación
export const authService = {
  // Registro de usuario normal - usando tu endpoint /users/register
  registerUser: async (userData: UserRegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/users/register', userData);
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: response.data.user || response.data,
        token: response.data.token
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el registro'
      };
    }
  },

  // Registro de profesional - usando tu endpoint /professionals
  registerProfessional: async (professionalData: ProfessionalRegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/professionals', professionalData);
      return {
        success: true,
        message: 'Profesional registrado exitosamente',
        user: response.data.user || response.data,
        token: response.data.token
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el registro de profesional'
      };
    }
  },

  // Login - usando tu endpoint /api/auth/login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return {
        success: true,
        message: 'Login exitoso', // En el front este mensaje se muestra cuando no puede iniciar sesión
        user: response.data.user,
        token: response.data.token
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Credenciales inválidas'
      };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtener token del localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Guardar datos de sesión
  saveSession: (token: string, user: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  }
};

export default authService;