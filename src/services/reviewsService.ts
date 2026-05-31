import axios from "axios";
import { authService } from "./authService";
import { API_CONFIG } from "../config/api";
const API_BASE_URL = API_CONFIG.BASE_URL;

// Interfaz para la reseña que recibimos del backend
export interface Review {
  _id: string;
  professionalId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const reviewsService = {
  // Función para obtener las reseñas de un profesional
  getReviewsByProfessional: async (
    professionalId: string
  ): Promise<Review[]> => {
    try {
      // 🚨 CORRECCIÓN: Añadimos un timestamp como query parameter (cache-buster)
      const timestamp = new Date().getTime();
      const url = `${API_BASE_URL}/reviews/by-professional/${professionalId}?t=${timestamp}`;

      const response = await axios.get(url);

      // Axios solo devuelve un 200 si tiene éxito. El 304 lo maneja internamente.
      return response.data || [];
    } catch (error) {
      console.error(
        "Error al obtener reseñas, devolviendo array vacío:",
        error
      );
      return [];
    }
  },

  // Puedes dejar la lógica de envío aquí también, usando Axios
  submitReview: async (data: {
    professionalId: string;
    rating: number;
    comment: string;
  }) => {
    // Lógica de envío usando Axios (más limpio que fetch)
    const token = authService.getToken();
    if (!token) throw new Error("Se requiere autenticación.");

    const response = await axios.post(`${API_BASE_URL}/reviews`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
