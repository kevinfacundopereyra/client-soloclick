import { api } from "./professionalsService"; // Reutilizamos la instancia de axios

export interface ReviewData {
  professionalId: string;
  userId: string; // Se obtendrá del usuario logueado
  rating: number; // Por ejemplo, de 1 a 5 estrellas
  comment: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  review?: any;
}

/**
 * Servicio para gestionar las reseñas de los profesionales.
 */
export const reviewsService = {
  /**
   * Envía una nueva reseña al backend.
   * @param reviewData - Los datos de la reseña.
   * @returns Una promesa que se resuelve con la respuesta del servidor.
   */
  async addReview(reviewData: ReviewData): Promise<ReviewResponse> {
    try {
      console.log("📤 Enviando nueva reseña al backend:", reviewData);

      // Asumimos un endpoint POST /reviews en el backend
      const response = await api.post("/reviews", reviewData);

      console.log("✅ Reseña creada exitosamente:", response.data);

      return {
        success: true,
        message: "Tu reseña ha sido enviada. ¡Gracias!",
        review: response.data,
      };
    } catch (error: any) {
      console.error("❌ Error al enviar la reseña:", error);
      const errorMessage =
        error.response?.data?.message ||
        "No se pudo enviar la reseña. Inténtalo de nuevo más tarde.";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};

export default reviewsService;
