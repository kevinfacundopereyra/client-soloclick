import { useProfessionals } from "../hooks/useProfessionals";
import ProfessionalCard from "../components/ProfessionalCard";

function ProfessionalsHome() {
  const { professionals, loading, error } = useProfessionals();

  if (loading) return <div>Cargando profesionales...</div>;
  if (error) return <div>Error al cargar profesionales</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ 
        fontSize: "2rem", 
        fontWeight: "bold", 
        marginBottom: "2rem",
        color: "#2d3a4a"
      }}>
        Lista de Profesionales
      </h1>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
        gap: "1rem" 
      }}>
        {professionals.map((professional, index) => (
          <ProfessionalCard key={index} professional={professional} />
        ))}
      </div>
    </div>
  );
}

export default ProfessionalsHome;
