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

export interface ProfessionalServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

export interface ProfessionalRegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  specialty: string;
  services?: ProfessionalServiceData[];
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

      // ✅ SOLUCIÓN: Guardar sesión si hay usuario, aunque no haya token
      if (response.data.user || response.data) {
        const user = response.data.user || response.data;
        // Asegurar que el usuario tenga userType
        if (!user.userType) {
          user.userType = "user";
        }

        // Guardar sesión con token temporal si no hay token real
        const token = response.data.token || `temp-token-${Date.now()}`;
        authService.saveSession(token, user);
        console.log("✅ Sesión guardada después del registro:", user);
      }

      return {
        success: true,
        message: "Usuario registrado exitosamente",
        user: response.data.user || response.data,
        token: response.data.token || `temp-token-${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Error en el registro",
      };
    }
  },

  // ✅ Registro de profesional con mejor manejo de errores
  registerProfessional: async (
    professionalData: ProfessionalRegisterData
  ): Promise<AuthResponse> => {
    try {
      console.log("🔍 Enviando datos al backend:", professionalData);
      const response = await api.post("/professionals", professionalData);
      console.log("✅ Respuesta del backend:", response.data);

      const user =
        response.data.professional || response.data.user || response.data;
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
      console.error("❌ Error en registro de profesional:", error);

      // ✅ MEJORAR: Manejo específico de errores del servidor
      if (error.response?.status === 500) {
        return {
          success: false,
          message: "Error interno del servidor. Por favor intenta más tarde.",
        };
      }

      if (error.response?.status === 400) {
        return {
          success: false,
          message:
            "Datos inválidos. Verifica que todos los campos estén correctos.",
        };
      }

      if (error.response?.status === 409) {
        return {
          success: false,
          message: "Ya existe un profesional con este email.",
        };
      }

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
