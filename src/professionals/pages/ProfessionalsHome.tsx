import { useProfessionals } from "../hooks/useProfessionals";
import ProfessionalCard from "../components/ProfessionalCard";
import { useFavorites } from "../hooks/useFavorites";
import type { Professional } from "../components/ProfessionalCard";

function ProfessionalsHome() {
  const { professionals, loading, error } = useProfessionals();
  const { favorites } = useFavorites();
  
  if (loading) return <div>Cargando profesionales...</div>;
  if (error) return <div>Error al cargar profesionales</div>;

  // Separar profesionales en favoritos y no favoritos
  const favoriteProfessionals: Professional[] = [];
  const allProfessionals: Professional[] = [];

  professionals.forEach(professional => {
    const professionalId = professional._id || professional.id;
    if (professionalId && favorites.includes(professionalId)) {
      favoriteProfessionals.push(professional);
    }
    allProfessionals.push(professional);
  });

  console.log(`📋 ${favoriteProfessionals.length} favoritos, ${allProfessionals.length} total`);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ 
        fontSize: "2rem", 
        fontWeight: "bold", 
        marginBottom: "2rem",
        color: "#2d3a4a"
      }}>
        Reserva tu turista desde cualquier lugar
      </h1>

      {/* Sección de Favoritos - Solo aparece si hay favoritos */}
      {favoriteProfessionals.length > 0 && (
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "bold", 
            marginBottom: "1.5rem",
            color: "#2d3a4a"
          }}>
            Favoritos
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
            gap: "1rem" 
          }}>
            {favoriteProfessionals.map((professional) => (
              <ProfessionalCard 
                key={professional._id || professional.id} 
                professional={professional} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Sección de Barberias (todos los profesionales) */}
      <div>
        <h2 style={{ 
          fontSize: "1.5rem", 
          fontWeight: "bold", 
          marginBottom: "1.5rem",
          color: "#2d3a4a"
        }}>
          Barberias
        </h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
          gap: "1rem" 
        }}>
          {allProfessionals.map((professional) => (
            <ProfessionalCard 
              key={professional._id || professional.id} 
              professional={professional} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfessionalsHome;
