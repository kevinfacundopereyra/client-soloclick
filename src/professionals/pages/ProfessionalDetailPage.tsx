import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProfessionalById } from "../services/professionalsService";
import { servicesService } from "../../services/servicesService";
import type { Professional } from "../components/ProfessionalCard";
import type { Service } from "../../services/servicesService";
import { authService } from "../../services/authService"; // Importación de tu servicio de autenticación

// 🚨 NUEVOS IMPORTS para reseñas
import type { Review as ReviewType } from "../../services/reviewsService";
import { reviewsService } from "../../services/reviewsService";
// 1. IMPORTAR EL MAPA
import InteractiveMap from "../../components/ProfessionalDetailMap";
import ReviewForm from "../../components/ReviewForm";

const ProfessionalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚨 ESTADO PARA LAS RESEÑAS
  const [reviews, setReviews] = useState<ReviewType[]>([]);

  // 🚨 FUNCIÓN UNIFICADA PARA CARGAR TODOS LOS DATOS (usamos useCallback para eficiencia)
  const loadProfessionalData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const [professionalData, servicesData, reviewsData] = await Promise.all([
        fetchProfessionalById(id),
        servicesService.getServicesByProfessional(id),
        // 🚨 1. Llama al nuevo endpoint de reseñas
        reviewsService.getReviewsByProfessional(id),
      ]);

      setProfessional(professionalData);
      setServices(servicesData);
      setReviews(reviewsData); // 🚨 2. Guarda las reseñas en el estado
    } catch (err: any) {
      console.error("❌ Error cargando datos del perfil:", err);
      setError("Error al cargar la información del profesional y sus reseñas.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfessionalData();
  }, [loadProfessionalData]); // Dependencia del useCallback

  // 🚨 FUNCIÓN DE ENVÍO DE RESEÑA (ACTUALIZADA Y CORREGIDA)
  const handleReviewSubmit = async (data: {
    rating: number;
    comment: string;
  }) => {
    const professionalId = professional?.id;
    const userToken = authService.getToken();

    if (!professionalId) {
      throw new Error("No se pudo obtener el ID del profesional.");
    }
    if (!userToken) {
      // Usamos navigate si no está logueado
      navigate("/login");
      throw new Error("Debes iniciar sesión para dejar una reseña.");
    }

    const API_URL = "http://localhost:3000/reviews";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        professionalId: professionalId,
        rating: data.rating,
        comment: data.comment,
      }),
    });

    if (response.ok) {
      // 🚨 3. Recarga los datos (incluyendo las nuevas reseñas) tras el éxito
      await loadProfessionalData();
      return;
    }

    let errorMessage = "Error al guardar la reseña. Inténtalo de nuevo.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      console.error(
        "Error inesperado del servidor. HTTP Status:",
        response.status
      );
      errorMessage = `Error del servidor (${response.status}). Revisa la consola del backend.`;
    }

    throw new Error(errorMessage);
  };

  const handleBookService = () => {
    navigate(`/reservar/servicios/${id}`);
  };

  if (loading) {
    // ... (Tu JSX de carga) ...
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{ color: "white", fontSize: "1.2rem", textAlign: "center" }}
        >
          Cargando información del profesional...
        </div>
      </div>
    );
  }

  if (error || !professional) {
    // ... (Tu JSX de error) ...
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "2rem",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "1.2rem",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          {error || "Profesional no encontrado"}
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "25px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem 0",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 2rem" }}>
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            marginBottom: "2rem",
          }}
        >
          {/* ... Header y Cuerpo del Profesional (sin cambios) ... */}
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "2rem",
              color: "white",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "white",
                color: "#667eea",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              {professional.name.substring(0, 2).toUpperCase()}
            </div>
            <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem 0" }}>
              {professional.name}
            </h1>
            <p style={{ opacity: 0.9, margin: 0 }}>{professional.specialty}</p>
          </div>

          <div style={{ padding: "2rem" }}>
            {/* Sección de Información y Estadísticas (sin cambios) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 1rem 0" }}>Información</h3>
                <p>
                  <strong>Ciudad:</strong> {professional.city}
                </p>
                <p>
                  <strong>Teléfono:</strong> {professional.phone}
                </p>
                <p>
                  <strong>Email:</strong> {professional.email}
                </p>
              </div>
              <div>
                <h3 style={{ margin: "0 0 1rem 0" }}>Estadísticas</h3>
                <p>
                  <strong>Servicios disponibles:</strong> {services.length}
                </p>
                <p>
                  <strong>Especialidad:</strong> {professional.specialty}
                </p>
              </div>
            </div>

            {/* Sección de Servicios Disponibles (sin cambios) */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ textAlign: "center", margin: "0 0 1.5rem 0" }}>
                Servicios Disponibles
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {services.map((service) => (
                  <div
                    key={service.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#f8f9fa",
                      padding: "1rem",
                      borderRadius: "8px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0 }}>{service.name}</h4>
                      <p style={{ margin: "0.25rem 0 0 0", color: "#6c757d" }}>
                        {service.description}
                      </p>
                      <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                        🕒 {service.duration} min
                      </span>
                    </div>
                    <div style={{ color: "#667eea", fontWeight: "bold" }}>
                      ${service.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de reservar (sin cambios) */}
            {services.some((s) => s.isActive) && (
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <button
                  onClick={handleBookService}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    padding: "0.8rem 2.5rem",
                    borderRadius: "50px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Reservar Cita
                </button>
              </div>
            )}

            {/* ✅ SECCIÓN DEL MAPA (sin cambios) */}
            <div
              className="map-section"
              style={{ borderTop: "1px solid #eee", paddingTop: "2rem" }}
            >
              <h3 style={{ textAlign: "center", margin: "0 0 1.5rem 0" }}>
                Ubicación
              </h3>
              {professional.locations && professional.locations.length > 0 ? (
                <InteractiveMap professional={professional} />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6c757d",
                    padding: "1rem",
                    background: "#f8f9fa",
                    borderRadius: "8px",
                  }}
                >
                  Este profesional no ha registrado ninguna ubicación.
                </div>
              )}
            </div>

            {/* --- SECCIÓN DE RESEÑAS (NUEVA) --- */}
            <div
              className="reviews-list-section"
              style={{ borderTop: "1px solid #eee", paddingTop: "2rem" }}
            >
              <h3 style={{ margin: "0 0 1.5rem 0" }}>
                Opiniones de clientes ({reviews.length})
              </h3>

              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    style={{
                      border: "1px solid #e9ecef",
                      padding: "1rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      background: "#f8f9fa",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{review.userName || "Usuario Anónimo"}</span>
                      <span style={{ color: "#f59e0b", fontSize: "1.2rem" }}>
                        {Array(review.rating).fill("★").join("")}
                      </span>
                    </div>
                    <p style={{ margin: "0.5rem 0" }}>{review.comment}</p>
                    <small style={{ color: "#6c757d" }}>
                      {review.createdAt
                        ? `Enviado el: ${new Date(
                            review.createdAt
                          ).toLocaleDateString()}`
                        : ""}
                    </small>
                  </div>
                ))
              ) : (
                <p style={{ color: "#6c757d" }}>
                  Aún no hay reseñas para este profesional. ¡Sé el primero!
                </p>
              )}
            </div>

            {/* Sección del Formulario de Reseñas (sin cambios en la llamada) */}
            <div
              className="review-section"
              style={{ borderTop: "1px solid #eee", paddingTop: "2rem" }}
            >
              {professional && (
                <ReviewForm
                  key={professional.id}
                  professionalName={professional.name}
                  onSubmit={handleReviewSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfessionalDetailPage;
