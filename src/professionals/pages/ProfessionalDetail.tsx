import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Professional } from "../components/ProfessionalCard";
import { fetchProfessionalById } from "../services/professionalsService";

const ProfessionalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real professional data
    const fetchProfessional = async () => {
      setLoading(true);
      
      try {
        if (id) {
          const professionalData = await fetchProfessionalById(id);
          
          if (professionalData) {
            // Asegurar que tenga todos los campos necesarios
            const professional: Professional = {
              id: professionalData._id || professionalData.id || id,
              name: professionalData.name || decodeURIComponent(id),
              email: professionalData.email || "profesional@example.com",
              phone: professionalData.phone || "+54 11 1234-5678",
              city: professionalData.city || "Buenos Aires",
              specialty: professionalData.specialty || "Barbería",
              rating: professionalData.rating || 4.5,
              appointmentDuration: professionalData.appointmentDuration || 45,
            };
            
            setProfessional(professional);
          } else {
            console.error('Profesional no encontrado');
            setProfessional(null);
          }
        }
      } catch (error) {
        console.error('Error fetching professional:', error);
        setProfessional(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfessional();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{ color: "white", fontSize: "1.2rem" }}>
          Cargando información del profesional...
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{ color: "white", fontSize: "1.2rem", marginBottom: "1rem" }}>
          Profesional no encontrado
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem"
    }}>
      {/* Header with back button */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            cursor: "pointer",
            marginRight: "1rem"
          }}
        >
          ← Volver
        </button>
        <h1 style={{ color: "white", margin: 0 }}>
          Detalles del Profesional
        </h1>
      </div>

      {/* Professional Details Card */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        background: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        {/* Professional Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          borderBottom: "1px solid #e0e0e0",
          paddingBottom: "1.5rem"
        }}>
          <div style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
            fontWeight: "bold",
            marginRight: "1.5rem"
          }}>
            {professional.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "2.5rem", color: "#2d3a4a" }}>
              {professional.name}
            </h1>
            <p style={{ margin: "0.5rem 0", fontSize: "1.2rem", color: "#667eea" }}>
              {professional.specialty}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "#4a5568" }}>⭐ {professional.rating}/5.0</span>
              <span style={{ color: "#4a5568" }}>📍 {professional.city}</span>
            </div>
          </div>
        </div>

        {/* Business Description */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "#2d3a4a", marginBottom: "1rem" }}>
            Sobre mi negocio
          </h2>
          <p style={{ color: "#4a5568", lineHeight: "1.6", fontSize: "1.1rem" }}>
            Bienvenido a mi {professional.specialty.toLowerCase()}. Ofrezco servicios profesionales 
            de alta calidad con más de 10 años de experiencia en el sector. Mi compromiso es 
            brindar la mejor atención personalizada, utilizando productos premium y técnicas 
            actualizadas para garantizar tu satisfacción.
          </p>
          <p style={{ color: "#4a5568", lineHeight: "1.6", fontSize: "1.1rem" }}>
            Ubicado en {professional.city}, nuestro local cuenta con un ambiente cómodo y 
            relajante, equipado con las mejores herramientas del mercado. Cada sesión tiene 
            una duración aproximada de {professional.appointmentDuration} minutos para asegurar 
            un resultado impecable.
          </p>
        </div>

        {/* Services */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "#2d3a4a", marginBottom: "1rem" }}>
            Mis servicios
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
            {getServicesBySpecialty(professional.specialty).map((service, index) => (
              <div key={index} style={{
                background: "#f8f9fa",
                padding: "1rem",
                borderRadius: "8px",
                borderLeft: "4px solid #667eea"
              }}>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#2d3a4a" }}>
                  {service.name}
                </h3>
                <p style={{ margin: "0 0 0.5rem 0", color: "#4a5568" }}>
                  {service.description}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#667eea", fontWeight: "600" }}>
                    ${service.price}
                  </span>
                  <span style={{ color: "#4a5568", fontSize: "0.9rem" }}>
                    {service.duration} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "#2d3a4a", marginBottom: "1rem" }}>
            Información de contacto
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>📧</span>
              <span style={{ color: "#4a5568" }}>{professional.email}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>📱</span>
              <span style={{ color: "#4a5568" }}>{professional.phone}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>⏱️</span>
              <span style={{ color: "#4a5568" }}>Duración promedio: {professional.appointmentDuration} min</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          justifyContent: "center",
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid #e0e0e0"
        }}>
          <button
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
            }}
            onClick={() => navigate(`/reservar/servicios/${professional.id}`)}
          >
            Reservar Cita
          </button>
          <button
            style={{
              background: "transparent",
              color: "#667eea",
              border: "2px solid #667eea",
              borderRadius: "8px",
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
            onClick={() => window.open(`mailto:${professional.email}`, '_blank')}
          >
            Contactar por Email
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get services based on specialty
const getServicesBySpecialty = (specialty: string) => {
  const services = {
    "Barbería": [
      { name: "Corte Clásico", description: "Corte tradicional con tijera y máquina", price: "2500", duration: "30" },
      { name: "Corte + Barba", description: "Corte completo con arreglo de barba", price: "3500", duration: "45" },
      { name: "Afeitado Tradicional", description: "Afeitado con navaja y toalla caliente", price: "2000", duration: "25" },
    ],
    "Manicura": [
      { name: "Manicura Básica", description: "Limado, cutícula y esmaltado", price: "1800", duration: "40" },
      { name: "Manicura Semipermanente", description: "Esmaltado con duración de 3 semanas", price: "3000", duration: "60" },
      { name: "Nail Art", description: "Diseños personalizados en uñas", price: "4000", duration: "90" },
    ],
    "Peluquería": [
      { name: "Corte y Peinado", description: "Corte personalizado con peinado", price: "3000", duration: "50" },
      { name: "Coloración", description: "Tintura completa del cabello", price: "5500", duration: "120" },
      { name: "Tratamiento Capilar", description: "Hidratación profunda", price: "4000", duration: "60" },
    ]
  };

  return services[specialty as keyof typeof services] || services["Barbería"];
};

export default ProfessionalDetail;