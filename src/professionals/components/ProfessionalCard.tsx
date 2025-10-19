import React from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";

// Define la estructura para la ubicación
interface Location {
  latitude: number;
  longitude: number;
  address?: string; // Opcional, pero útil
  branchName?: string; // Opcional, para el futuro
}

export interface Professional {
  id?: string;
  _id?: string; // ID de MongoDB
  name: string;
  email: string;
  phone: string;
  city: string;
  specialty: string;
  modality?: "local" | "home"; // Nuevo campo para modalidad
  rating?: number;
  appointmentDuration: number;
  // Campos adicionales que pueden venir del backend
  description?: string;
  address?: string;
  workingHours?: string;
  services?: string[];
  createdAt?: string;
  updatedAt?: string;
  locations: Location[]; // Arreglo de ubicaciones
}

export interface ProfessionalCardProps {
  professional: Professional;
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  padding: "1.5rem",
  margin: "1rem 0",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  background: "#fff",
  maxWidth: 400,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.3rem",
  color: "#2d3a4a",
  fontWeight: 700,
};

const infoStyle: React.CSSProperties = {
  margin: "0.3rem 0",
  color: "#4a5568",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#f3f4f6",
  color: "#2563eb",
  borderRadius: "8px",
  padding: "0.2rem 0.7rem",
  fontSize: "0.95rem",
  marginLeft: "0.5rem",
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "0.75rem 1.5rem",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "1rem",
  width: "100%",
  transition: "all 0.3s ease",
};

const favoriteButtonStyle: React.CSSProperties = {
  background: "transparent",
  color: "#f59e0b",
  border: "2px solid #f59e0b",
  borderRadius: "8px",
  padding: "0.75rem 1.5rem",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "0.5rem",
  width: "100%",
  transition: "all 0.3s ease",
};

const favoriteActiveButtonStyle: React.CSSProperties = {
  ...favoriteButtonStyle,
  background: "#f59e0b",
  color: "white",
};

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
}) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();

  const handleContratar = () => {
    // Usar el ObjectId real del backend (_id o id)
    const professionalId = professional._id || professional.id;

    if (!professionalId) {
      console.error("Professional sin ID válido:", professional);
      alert("Error: No se puede navegar, profesional sin ID válido");
      return;
    }

    console.log("🔍 Navegando a profesional con ID:", professionalId);
    navigate(`/profesional/${professionalId}`);
  };

  const handleToggleFavorites = async () => {
    const professionalId = professional._id || professional.id;

    if (!professionalId) {
      console.error("Professional sin ID válido:", professional);
      alert(
        "Error: No se puede agregar a favoritos, profesional sin ID válido"
      );
      return;
    }

    const success = await toggleFavorite(professionalId);
    if (success) {
      console.log("✅ Favorito actualizado correctamente");
    }
  };

  // Obtener el ID del profesional para verificar si es favorito
  const professionalId = professional._id || professional.id;
  const isCurrentlyFavorite = professionalId
    ? isFavorite(professionalId)
    : false;

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>{professional.name}</h3>
      <div style={infoStyle}>
        <strong>Especialidad:</strong> {professional.specialty}
      </div>
      <div style={infoStyle}>
        <strong>Ciudad:</strong> {professional.city}
      </div>
      <div style={infoStyle}>
        <strong>Email:</strong> {professional.email}
      </div>
      <div style={infoStyle}>
        <strong>Teléfono:</strong> {professional.phone}
      </div>
      <div style={infoStyle}>
        <strong>Rating:</strong>{" "}
        <span style={badgeStyle}>{professional.rating ?? "N/A"} ⭐</span>
      </div>
      <div style={infoStyle}>
        <strong>Duración de turno:</strong>{" "}
        <span style={badgeStyle}>{professional.appointmentDuration} min</span>
      </div>
      <button
        style={buttonStyle}
        onClick={handleContratar}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Contratar
      </button>

      <button
        style={
          isCurrentlyFavorite ? favoriteActiveButtonStyle : favoriteButtonStyle
        }
        onClick={handleToggleFavorites}
        disabled={isLoading}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 4px 12px rgba(245, 158, 11, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {isLoading
          ? "..."
          : isCurrentlyFavorite
          ? "⭐ Favorito"
          : "☆ Agregar a favoritos"}
      </button>
    </div>
  );
};

export default ProfessionalCard;
