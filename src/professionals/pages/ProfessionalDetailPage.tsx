import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProfessionalById } from "../services/professionalsService";
import { servicesService } from "../../services/servicesService";
import type { Professional } from "../components/ProfessionalCard";
import type { Service } from "../../services/servicesService";

// 1. IMPORTAR EL MAPA
import InteractiveMap from "../../components/ProfessionalDetailMap";

const ProfessionalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfessionalData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const [professionalData, servicesData] = await Promise.all([
          fetchProfessionalById(id),
          servicesService.getServicesByProfessional(id),
        ]);
        setProfessional(professionalData);
        setServices(servicesData);
      } catch (err: any) {
        console.error("❌ Error cargando profesional:", err);
        setError("Error al cargar la información del profesional");
      } finally {
        setLoading(false);
      }
    };
    loadProfessionalData();
  }, [id]);

  if (loading) {
    // Tu JSX de carga no cambia
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
    // Tu JSX de error no cambia
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

  const handleBookService = () => {
    navigate(`/reservar/servicios/${id}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem 0",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 2rem" }}>
        {/* Tarjeta principal del profesional */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            marginBottom: "2rem",
          }}
        >
          {/* Header de la tarjeta */}
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

          {/* Cuerpo de la tarjeta */}
          <div style={{ padding: "2rem" }}>
            {/* Sección de Información y Estadísticas */}
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

            {/* Sección de Servicios Disponibles */}
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

            {/* Botón de reservar */}
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

            {/* ✅ SECCIÓN DEL MAPA AÑADIDA AL FINAL */}
            <div
              className="map-section"
              style={{ borderTop: "1px solid #eee", paddingTop: "2rem" }}
            >
              <h3 style={{ textAlign: "center", margin: "0 0 1.5rem 0" }}>
                Ubicación
              </h3>
              {professional.locations && professional.locations.length > 0 ? (
                // Pasamos el objeto 'professional' completo.
                // Usaremos una nueva versión de InteractiveMap que maneje un solo profesional.
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDetailPage;
