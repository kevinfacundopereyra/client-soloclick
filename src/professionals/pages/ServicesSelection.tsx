import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Professional } from "../components/ProfessionalCard";
import { fetchProfessionalById } from "../services/professionalsService";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
}

const ServicesSelection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
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

  const getServicesBySpecialty = (specialty: string): Service[] => {
    const services = {
      "Barbería": [
        { 
          id: "barba-basic", 
          name: "Barba", 
          description: "10 min con cualquier profesional", 
          price: "4000", 
          duration: "10" 
        },
        { 
          id: "corte-barba", 
          name: "Corte con barba", 
          description: "Renovar tu estilo con un corte de pelo a medida y una prolija definición de barba. Lavado incluido.", 
          price: "10000", 
          duration: "40" 
        },
        { 
          id: "corte-pelo", 
          name: "Corte de pelo", 
          description: "Corte personalizado con las mejores técnicas", 
          price: "9000", 
          duration: "30" 
        },
      ],
      "Manicura": [
        { 
          id: "manicura-basica", 
          name: "Manicura Básica", 
          description: "Limado, cutícula y esmaltado tradicional", 
          price: "1800", 
          duration: "40" 
        },
        { 
          id: "manicura-semi", 
          name: "Manicura Semipermanente", 
          description: "Esmaltado con duración de 3 semanas", 
          price: "3000", 
          duration: "60" 
        },
        { 
          id: "nail-art", 
          name: "Nail Art", 
          description: "Diseños personalizados en uñas", 
          price: "4000", 
          duration: "90" 
        },
      ],
      "Peluquería": [
        { 
          id: "corte-peinado", 
          name: "Corte y Peinado", 
          description: "Corte personalizado con peinado profesional", 
          price: "3000", 
          duration: "50" 
        },
        { 
          id: "coloracion", 
          name: "Coloración", 
          description: "Tintura completa del cabello con productos premium", 
          price: "5500", 
          duration: "120" 
        },
        { 
          id: "tratamiento", 
          name: "Tratamiento Capilar", 
          description: "Hidratación profunda para cabello dañado", 
          price: "4000", 
          duration: "60" 
        },
      ]
    };

    return services[specialty as keyof typeof services] || services["Barbería"];
  };

  const toggleService = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + parseInt(service.price), 0);
  };



  const handleContinue = () => {
    if (selectedServices.length === 0) {
      alert("Por favor selecciona al menos un servicio");
      return;
    }
    
    // Store selected services in localStorage for the next step
    localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    localStorage.setItem('professionalData', JSON.stringify(professional));
    
    navigate(`/reservar/horario/${id}`);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#f8f9fa"
      }}>
        <div style={{ fontSize: "1.2rem", color: "#4a5568" }}>
          Cargando servicios...
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
        background: "#f8f9fa"
      }}>
        <div style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#4a5568" }}>
          Profesional no encontrado
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "#667eea",
            border: "none",
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

  const services = getServicesBySpecialty(professional.specialty);

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "#f8f9fa",
      padding: "1rem"
    }}>
      {/* Header */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        marginBottom: "2rem"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "1rem"
        }}>
          <button
            onClick={() => navigate(`/profesional/${id}`)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              marginRight: "1rem",
              color: "#4a5568"
            }}
          >
            ←
          </button>
          <div style={{ fontSize: "0.9rem", color: "#667eea" }}>
            Servicios &gt; Hora &gt; Confirmar
          </div>
          <button
            onClick={() => navigate(`/profesional/${id}`)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              marginLeft: "auto",
              color: "#4a5568"
            }}
          >
            ✕
          </button>
        </div>
        
        <h1 style={{ 
          fontSize: "2rem", 
          fontWeight: "bold", 
          color: "#2d3a4a",
          margin: 0 
        }}>
          Servicios
        </h1>
      </div>

      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "2rem"
      }}>
        {/* Services List */}
        <div>
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "600", 
            color: "#2d3a4a",
            marginBottom: "1.5rem" 
          }}>
            Hair & styling
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {services.map((service) => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service)}
                  style={{
                    background: "white",
                    border: isSelected ? "2px solid #667eea" : "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "1.5rem",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: "0 0 0.5rem 0", 
                        fontSize: "1.1rem", 
                        fontWeight: "600",
                        color: "#2d3a4a"
                      }}>
                        {service.name}
                      </h3>
                      <p style={{ 
                        margin: "0 0 0.5rem 0", 
                        color: "#4a5568",
                        fontSize: "0.95rem",
                        lineHeight: "1.4"
                      }}>
                        {service.description}
                      </p>
                      <div style={{ 
                        fontSize: "0.9rem", 
                        color: "#4a5568" 
                      }}>
                        {service.duration} min
                      </div>
                      <div style={{ 
                        fontSize: "1rem", 
                        fontWeight: "600",
                        color: "#2d3a4a",
                        marginTop: "0.5rem"
                      }}>
                        {service.price} ARS
                      </div>
                    </div>
                    
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: isSelected ? "2px solid #667eea" : "2px solid #ccc",
                      background: isSelected ? "#667eea" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "1rem"
                    }}>
                      {isSelected && (
                        <div style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "white"
                        }} />
                      )}
                    </div>

                    {!isSelected && (
                      <button
                        style={{
                          position: "absolute",
                          right: "1rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          fontSize: "1.5rem",
                          color: "#ccc",
                          cursor: "pointer"
                        }}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          height: "fit-content",
          position: "sticky",
          top: "1rem"
        }}>
          {/* Professional Info */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginRight: "1rem"
            }}>
              {professional.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "#2d3a4a" }}>
                {professional.name}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#4a5568" }}>
                {professional.city}
              </div>
            </div>
          </div>

          {/* Selected Services */}
          {selectedServices.map((service) => (
            <div key={service.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid #f0f0f0"
            }}>
              <div>
                <div style={{ fontWeight: "500", color: "#2d3a4a" }}>
                  {service.name}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#4a5568" }}>
                  {service.duration} min con cualquier profesional
                </div>
              </div>
              <div style={{ fontWeight: "600", color: "#2d3a4a" }}>
                {service.price} ARS
              </div>
            </div>
          ))}

          {/* Total */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: "#2d3a4a",
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "2px solid #f0f0f0"
          }}>
            <span>Total</span>
            <span>{getTotalPrice()} ARS</span>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={selectedServices.length === 0}
            style={{
              width: "100%",
              background: selectedServices.length > 0 ? "#2d3a4a" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "1rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: selectedServices.length > 0 ? "pointer" : "not-allowed",
              marginTop: "1.5rem"
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesSelection;