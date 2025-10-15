import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProfessionalById } from '../services/professionalsService';
import { servicesService } from '../../services/servicesService';
import type { Professional } from '../components/ProfessionalCard';
import type { Service } from '../../services/servicesService';

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

        // Cargar datos del profesional y sus servicios en paralelo
        const [professionalData, servicesData] = await Promise.all([
          fetchProfessionalById(id),
          servicesService.getServicesByProfessional(id)
        ]);

        setProfessional(professionalData);
        setServices(servicesData);
      } catch (err: any) {
        console.error('❌ Error cargando profesional:', err);
        setError('Error al cargar la información del profesional');
      } finally {
        setLoading(false);
      }
    };

    loadProfessionalData();
  }, [id]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ 
          color: "white", 
          fontSize: "1.2rem",
          textAlign: "center"
        }}>
          Cargando información del profesional...
        </div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "2rem"
      }}>
        <div style={{ 
          color: "white", 
          fontSize: "1.2rem",
          textAlign: "center",
          marginBottom: "2rem"
        }}>
          {error || 'Profesional no encontrado'}
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
            fontSize: "1rem"
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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem 0"
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 2rem" }}>
        
        {/* Header con navegación */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "2rem",
          gap: "1rem"
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            ← Volver
          </button>
        </div>

        {/* Tarjeta principal del profesional */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          marginBottom: "2rem"
        }}>
          
          {/* Header de la tarjeta */}
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "3rem 2rem",
            color: "white",
            textAlign: "center"
          }}>
            <img
              src={professional.profileImage || `https://ui-avatars.com/api/?name=${professional.name}&background=ffffff&color=667eea&size=120`}
              alt={professional.name}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: "4px solid white",
                marginBottom: "1rem"
              }}
            />
            <h1 style={{ fontSize: "2.5rem", margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
              {professional.name}
            </h1>
            <p style={{ fontSize: "1.2rem", opacity: 0.9, margin: "0 0 1rem 0" }}>
              {professional.specialty}
            </p>
            
            {/* Rating */}
            {professional.rating && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>⭐</span>
                <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                  {professional.rating.toFixed(1)}
                </span>
                {professional.reviewsCount && (
                  <span style={{ opacity: 0.8 }}>
                    ({professional.reviewsCount} reseñas)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Información del profesional */}
          <div style={{ padding: "2rem" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem"
            }}>
              
              {/* Información básica */}
              <div style={{
                background: "#f8f9fa",
                padding: "1.5rem",
                borderRadius: "12px"
              }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748", fontSize: "1.3rem" }}>
                  📍 Información
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <strong>Ciudad:</strong> {professional.city}
                  </div>
                  {professional.phone && (
                    <div>
                      <strong>Teléfono:</strong> {professional.phone}
                    </div>
                  )}
                  {professional.email && (
                    <div>
                      <strong>Email:</strong> {professional.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              <div style={{
                background: "#f8f9fa",
                padding: "1.5rem",
                borderRadius: "12px"
              }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748", fontSize: "1.3rem" }}>
                  📊 Estadísticas
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <strong>Servicios disponibles:</strong> {services.length}
                  </div>
                  {professional.reviewsCount && (
                    <div>
                      <strong>Total reseñas:</strong> {professional.reviewsCount}
                    </div>
                  )}
                  <div>
                    <strong>Especialidad:</strong> {professional.specialty}
                  </div>
                </div>
              </div>
            </div>

            {/* Servicios disponibles */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ 
                margin: "0 0 1.5rem 0", 
                color: "#2d3748", 
                fontSize: "1.5rem",
                textAlign: "center"
              }}>
                💼 Servicios Disponibles
              </h3>
              
              {services.length > 0 ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "1rem"
                }}>
                  {services.map((service) => (
                    <div
                      key={service.id}
                      style={{
                        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        border: "2px solid #e9ecef",
                        transition: "transform 0.2s"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1rem"
                      }}>
                        <h4 style={{ 
                          margin: 0, 
                          color: "#2d3748",
                          fontSize: "1.2rem",
                          fontWeight: "bold"
                        }}>
                          {service.name}
                        </h4>
                        <span style={{
                          background: "#667eea",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "1rem",
                          fontWeight: "bold"
                        }}>
                          ${service.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <p style={{ 
                        margin: "0 0 1rem 0", 
                        color: "#4a5568",
                        fontSize: "0.95rem",
                        lineHeight: "1.4"
                      }}>
                        {service.description}
                      </p>
                      
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.9rem",
                        color: "#718096"
                      }}>
                        <span>⏱️ {service.duration} min</span>
                        <span style={{
                          background: service.isActive ? "#d4edda" : "#f8d7da",
                          color: service.isActive ? "#155724" : "#721c24",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "12px",
                          fontSize: "0.8rem"
                        }}>
                          {service.isActive ? "Disponible" : "No disponible"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: "3rem",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                  color: "#6c757d"
                }}>
                  <p style={{ fontSize: "1.1rem", margin: 0 }}>
                    Este profesional aún no ha configurado sus servicios
                  </p>
                </div>
              )}
            </div>

            {/* Botón de reservar */}
            {services.some(s => s.isActive) && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={handleBookService}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    padding: "1rem 3rem",
                    borderRadius: "50px",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                >
                  📅 Reservar Cita
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDetailPage;