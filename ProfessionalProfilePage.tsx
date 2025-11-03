import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchProfessionalById,
  addProfessionalReview,
} from "../professionals/services/professionalsService";
import { authService } from "../services/authService";
import ReviewForm from "../components/professionals/ReviewForm";

interface Professional {
  _id: string;
  name: string;
  email: string;
  specialty: string;
  description: string;
  city: string;
  images: string[];
  // Aquí podrías agregar más campos como 'reviews', 'workingHours', etc.
}

const ProfessionalProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!id) {
      setError("No se proporcionó un ID de profesional.");
      setLoading(false);
      return;
    }

    const loadProfessional = async () => {
      try {
        setLoading(true);
        const data = await fetchProfessionalById(id);
        setProfessional(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar el perfil del profesional.");
      } finally {
        setLoading(false);
      }
    };

    loadProfessional();
  }, [id]);

  /**
   * Esta función maneja el envío de la reseña.
   * Se conecta con tu lógica de backend a través de los servicios.
   */
  const handleReviewSubmit = async ({
    rating,
    comment,
  }: {
    rating: number;
    comment: string;
  }) => {
    if (!currentUser || !professional) {
      throw new Error("Debes iniciar sesión para dejar una reseña.");
    }

    const reviewData = {
      professionalId: professional._id,
      userId: currentUser._id,
      rating,
      comment,
    };

    console.log("📤 Preparando para enviar reseña:", reviewData);

    // Llamamos al servicio que ya existe
    const response = await addProfessionalReview(reviewData);

    if (!response.success) {
      // Si el servicio indica un fallo, lanzamos un error para que el formulario lo muestre.
      throw new Error(
        response.message || "Ocurrió un error desconocido al enviar la reseña."
      );
    }

    console.log("✅ Reseña enviada con éxito desde la página de perfil.");
    // Opcional: podrías recargar las reseñas del profesional aquí.
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>Cargando perfil...</div>;
  }

  if (error) {
    return <div style={{ padding: "2rem", color: "red" }}>Error: {error}</div>;
  }

  if (!professional) {
    return <div style={{ padding: "2rem" }}>Profesional no encontrado.</div>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem" }}>
      {/* --- Información del Profesional --- */}
      <section style={{ marginBottom: "2rem" }}>
        <h1>{professional.name}</h1>
        <p style={{ color: "#555", fontSize: "1.2rem" }}>
          {professional.specialty} en {professional.city}
        </p>
        <p>{professional.description}</p>
        {/* Aquí podrías agregar más detalles como la galería de imágenes, etc. */}
      </section>

      <hr />

      {/* --- Sección de Reseñas --- */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Opiniones</h2>

        {/* Aquí es donde se mostrarían las reseñas existentes */}
        <div style={{ marginBottom: "2rem" }}>
          <p>
            <em>(Aquí se mostrará la lista de reseñas del profesional)</em>
          </p>
        </div>

        {/* --- Formulario para añadir una nueva reseña --- */}
        {currentUser ? (
          // Si el usuario está logueado, muestra el formulario
          <ReviewForm
            professionalName={professional.name}
            onSubmit={handleReviewSubmit}
          />
        ) : (
          // Si no, muestra un mensaje para iniciar sesión
          <div
            style={{
              background: "#f9f9f9",
              padding: "1.5rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <p>
              Para dejar una reseña, por favor{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                inicia sesión
              </a>
              .
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfessionalProfilePage;
