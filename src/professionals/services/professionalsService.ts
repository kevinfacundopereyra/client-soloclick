import axios from "axios";
import { API_CONFIG } from "../../config/api";

// Configurar axios con la URL base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchProfessionals() {
  try {
    console.log("🔍 Obteniendo todos los profesionales del backend...");
    const response = await api.get(API_CONFIG.ENDPOINTS.PROFESSIONALS);

    console.log("✅ Respuesta del backend:", response.data);

    // Si la respuesta es un array directamente
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Si la respuesta es un objeto con una propiedad que contiene los datos
    if (
      response.data.professionals &&
      Array.isArray(response.data.professionals)
    ) {
      return response.data.professionals;
    }
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    console.warn("⚠️ Formato de respuesta inesperado:", response.data);
    return [];
  } catch (error) {
    console.error("❌ Error conectando al servidor:", error);
    throw new Error(
      `Error al obtener profesionales: ${
        (error as any)?.message || "Error desconocido"
      }`
    );
  }
}

// Función para obtener profesionales por especialidad
export async function fetchProfessionalsBySpecialty(specialty: string) {
  try {
    console.log(`🔍 Obteniendo profesionales por especialidad: ${specialty}`);

    // ✅ SOLUCIÓN: Usar el endpoint general y filtrar en el frontend
    const response = await api.get(API_CONFIG.ENDPOINTS.PROFESSIONALS);

    console.log(`✅ Todos los profesionales obtenidos:`, response.data);

    // Obtener todos los profesionales
    let allProfessionals = [];
    if (Array.isArray(response.data)) {
      allProfessionals = response.data;
    } else if (
      response.data.professionals &&
      Array.isArray(response.data.professionals)
    ) {
      allProfessionals = response.data.professionals;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      allProfessionals = response.data.data;
    }

    // ✅ Filtrar por especialidad en el frontend
    const filteredProfessionals = allProfessionals.filter((professional) => {
      const profSpecialty = professional.specialty?.toLowerCase();
      const targetSpecialty = specialty.toLowerCase();
      return profSpecialty === targetSpecialty;
    });

    console.log(
      `✅ Profesionales filtrados de ${specialty}:`,
      filteredProfessionals
    );
    return filteredProfessionals;
  } catch (error) {
    console.error(
      `❌ Error obteniendo profesionales para ${specialty}:`,
      error
    );
    throw new Error(
      `Error al obtener profesionales de ${specialty}: ${
        (error as any)?.message || "Error desconocido"
      }`
    );
  }
}

// Función para obtener un profesional específico por ID
export async function fetchProfessionalById(id: string) {
  try {
    console.log(`🔍 Buscando profesional con ID: "${id}"`);

    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.PROFESSIONALS}/${id}`
    );
    console.log(`✅ Profesional encontrado en backend:`, response.data);

    // Normalizar la respuesta - el profesional puede venir directamente o dentro de una propiedad
    let professional = response.data;
    if (response.data.professional) {
      professional = response.data.professional;
    }

    // Asegurar que tenga un ID válido
    if (!professional._id && !professional.id) {
      throw new Error("El profesional no tiene un ID válido");
    }

    // Normalizar el ID para consistencia
    if (professional._id && !professional.id) {
      professional.id = professional._id;
    }

    return professional;
  } catch (error) {
    console.error(`❌ Error obteniendo profesional ${id}:`, error);

    // Si es un error 404, el profesional no existe
    if ((error as any)?.response?.status === 404) {
      throw new Error("Profesional no encontrado");
    }

    // Para otros errores, relanzar con mensaje descriptivo
    throw new Error(
      `Error al obtener profesional: ${
        (error as any)?.message || "Error desconocido"
      }`
    );
  }
}

// Función auxiliar para verificar si un string es un ObjectId válido de MongoDB
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Exportar la instancia de axios configurada para usar en otros servicios
export { api };
