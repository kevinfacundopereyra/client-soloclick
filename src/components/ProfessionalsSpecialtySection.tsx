import React from "react";
import { useNavigate } from "react-router-dom";
import ProfessionalCard from "../professionals/components/ProfessionalCard";
import type { Professional } from "../professionals/components/ProfessionalCard";

// ✅ MODIFICADO: Añadimos las nuevas props para controlar el botón "Ver más"
interface ProfessionalsSpecialtySectionProps {
  specialty: string;
  title: string;
  maxItems?: number;
  professionals: Professional[];
  showViewMoreButton: boolean; // Le dice al componente si debe mostrar el botón
  totalSpecialtyCount: number; // El número total de profesionales de esta especialidad
}

const ProfessionalsSpecialtySection = ({
  specialty,
  title,
  maxItems = 3, // Tu código mostraba 3, así que mantenemos ese valor
  professionals: allProfessionals,
  showViewMoreButton, // ✅ ACEPTAMOS LAS NUEVAS PROPS
  totalSpecialtyCount, // ✅ ACEPTAMOS LAS NUEVAS PROPS
}: ProfessionalsSpecialtySectionProps) => {
  const navigate = useNavigate();

  // Esta lógica no cambia: filtra por especialidad la lista que recibe
  const professionalsOfThisSpecialty = allProfessionals.filter(
    (professional) => professional.specialty === specialty
  );

  if (professionalsOfThisSpecialty.length === 0) {
    return null;
  }

  // Esta lógica no cambia: limita los profesionales a mostrar
  const displayedProfessionals = professionalsOfThisSpecialty.slice(
    0,
    maxItems
  );

  const handleViewMore = () => {
    navigate(`/professionals?specialty=${encodeURIComponent(specialty)}`);
  };

  return (
    <section
      style={{
        padding: "3rem 0",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "white",
          marginBottom: "2rem",
          textAlign: "left",
          paddingLeft: "2rem",
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.5rem",
          padding: "0 2rem",
        }}
      >
        {displayedProfessionals.map((professional, index) => (
          <ProfessionalCard
            key={`${specialty}-${index}`}
            professional={professional}
          />
        ))}
      </div>

      {/* ✅ CORREGIDO: La lógica del botón ahora usa la prop 'showViewMoreButton' */}
      {showViewMoreButton && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            onClick={handleViewMore}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              padding: "0.75rem 2rem",
              borderRadius: "25px",
              fontSize: "1rem",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            Ver más {title.toLowerCase()} (
            {totalSpecialtyCount - maxItems > 0
              ? totalSpecialtyCount - maxItems
              : 0}{" "}
            más) →
          </button>
        </div>
      )}
    </section>
  );
};

export default ProfessionalsSpecialtySection;
