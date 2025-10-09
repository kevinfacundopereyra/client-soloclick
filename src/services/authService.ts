import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interfaces
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
    _id: string;
    name: string;
    email: string;
    userType: "user" | "professional";
    phone?: string;
    city?: string;
    specialty?: string;
  };
  token?: string;
}

// SERVICIO DE AUTENTICACIÓN - ARREGLADO
export const authService = {
  // ✅ Guardar sesión
  saveSession: (token: string, user: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Configurar header de autorización para futuras peticiones
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  // ✅ Obtener usuario actual
  getCurrentUser: () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  },

  // ✅ Obtener token
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  // ✅ Verificar autenticación
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    return !!(token && user);
  },

  // ✅ Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  },

  // ✅ Registro de usuario
  registerUser: async (userData: UserRegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post("/users/register", userData);

      if (response.data.user && response.data.token) {
        // Auto-login después del registro
        authService.saveSession(response.data.token, response.data.user);
      }

      return {
        success: true,
        message: "Usuario registrado exitosamente",
        user: response.data.user || response.data,
        token: response.data.token,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Error en el registro",
      };
    }
  },

  // ✅ Registro de profesional
  registerProfessional: async (
    professionalData: ProfessionalRegisterData
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post("/professionals", professionalData);

      const user = response.data.professional || response.data.user || response.data;
      if (user) {
        // Asegurar userType
        if (!user.userType || user.userType === "profesional") {
          user.userType = "professional";
        }
      }

      // Auto-login después del registro si hay token
      if (response.data.token && user) {
        authService.saveSession(response.data.token, user);
      }

      return {
        success: true,
        message: "Profesional registrado exitosamente",
        user: user,
        token: response.data.token || "temp-token-" + Date.now(),
      };
    } catch (error: any) {
      console.error("❌ Error conectando con backend:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error de conexión con el servidor",
      };
    }
  },

  // ✅ Login - UNA SOLA FUNCIÓN (no duplicada)
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Intentar primero con el endpoint de profesionales
      let response;
      try {
        response = await api.post("/professionals/login", { email, password });
        console.log("🔍 Login profesional exitoso:", response.data);
      } catch (profError) {
        // Si falla, intentar con endpoint general
        try {
          response = await api.post("/api/auth/login", { email, password });
          console.log("🔍 Login general exitoso:", response.data);
        } catch (authError) {
          throw profError; // Usar el error del profesional
        }
      }

      if (response.data.user && response.data.token) {
        const user = response.data.user;

        // Normalizar userType
        if (!user.userType || user.userType === "profesional") {
          user.userType = "professional";
        }

        console.log("🔍 Usuario final a guardar:", user);

        // Guardar sesión
        authService.saveSession(response.data.token, user);

        // Verificar que se guardó
        const savedUser = authService.getCurrentUser();
        console.log("🔍 Usuario recuperado después de guardar:", savedUser);

        return {
          success: true,
          message: "Login exitoso",
          user,
          token: response.data.token,
        };
      }

      return {
        success: false,
        message: response.data.message || "Error en el login",
      };
    } catch (error: any) {
      console.error("❌ Error en login:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Credenciales inválidas",
      };
    }
  },
};

export default authService;
