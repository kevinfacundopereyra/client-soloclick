import React, { useState } from "react";

interface ReviewFormProps {
  professionalName: string;
  /**
   * Función que se llama cuando el usuario envía la reseña.
   * Tú te encargas de la lógica para enviarla al backend.
   */
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  professionalName,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validación simple
    if (rating === 0) {
      setError("Por favor, selecciona una calificación de estrellas.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Tu comentario debe tener al menos 10 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Llamamos a la función que nos pasaron desde la página del perfil
      await onSubmit({ rating, comment });

      setSuccess("¡Gracias por tu reseña! Ha sido enviada.");
      // Limpiamos el formulario
      setRating(0);
      setComment("");
    } catch (err: any) {
      setError(
        err.message || "No se pudo enviar la reseña. Inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "#f9f9f9",
        padding: "1.5rem",
        borderRadius: "8px",
        border: "1px solid #eee",
        marginTop: "2rem",
      }}
    >
      <h3>Deja tu opinión sobre {professionalName}</h3>

      <form onSubmit={handleFormSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Tu calificación:</label>
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => !isSubmitting && setRating(star)}
                style={{
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  color: star <= rating ? "#f59e0b" : "#ccc",
                  fontSize: "2.5rem",
                  marginRight: "0.25rem",
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="reviewComment">Tu comentario:</label>
          <textarea
            id="reviewComment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia con el profesional..."
            disabled={isSubmitting}
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.5rem",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </div>

        {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", fontSize: "0.9rem" }}>{success}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Reseña"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
