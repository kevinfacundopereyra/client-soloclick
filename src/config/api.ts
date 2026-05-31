// Configuración de la API desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000, // 10 segundos

  // Endpoints
  ENDPOINTS: {
    PROFESSIONALS: "/professionals",
    APPOINTMENTS: "/appointments",
    USERS: "/users",
    AUTH: "/auth",
  },
};

// Función para obtener la URL completa de un endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG;
