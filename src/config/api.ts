// Configuración de la API
export const API_CONFIG = {
  // Cambiar por la URL real de tu backend
  BASE_URL: 'http://localhost:3000', // Cambiar por tu URL
  TIMEOUT: 10000, // 10 segundos
  
  // Endpoints
  ENDPOINTS: {
    PROFESSIONALS: '/professionals',
    APPOINTMENTS: '/appointments',
    USERS: '/users',
    AUTH: '/auth'
  }
};

// Función para obtener la URL completa de un endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};