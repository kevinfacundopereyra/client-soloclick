import React from "react";

export interface Professional {
  name: string;
  email: string;
  phone: string;
  city: string;
  specialty: string;
  rating?: number;
  appointmentDuration: number;
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

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
}) => (
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
  </div>
);

export default ProfessionalCard;
