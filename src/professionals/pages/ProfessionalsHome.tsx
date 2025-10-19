import { useSearchParams, Link } from "react-router-dom";
import { useProfessionals } from "../hooks/useProfessionals";
import ProfessionalCard from "../components/ProfessionalCard";
import { useFavorites } from "../hooks/useFavorites";
import type { Professional } from "../components/ProfessionalCard";
import FilterBar from "../../components/FilterBar";

// ✅ MODIFICADO: Importamos el mapa correcto, el que está diseñado para mostrar una LISTA.
import ProfessionalsListMap from "../../components/ProfessionalsListMap";

function ProfessionalsHome() {
  const [searchParams] = useSearchParams();
  const { professionals, loading, error } = useProfessionals();
  const { favorites } = useFavorites();

  const filters = {
    search: searchParams.get("search"),
    specialty: searchParams.get("specialty"),
    modality: searchParams.get("modality"),
    city: searchParams.get("city"),
    date: searchParams.get("date"),
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "white", fontSize: "1.2rem" }}>
          Cargando profesionales...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "1.2rem",
            background: "rgba(255, 255, 255, 0.1)",
            padding: "2rem",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "1rem", color: "#ff6b6b" }}>⚠️ Error</h2>
          <p>
            Error cargando profesionales:{" "}
            {error?.toString() || "Error desconocido"}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "1rem",
            }}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  const getFilteredProfessionals = () => {
    return professionals.filter((professional) => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const name = professional.name?.toLowerCase() || "";
        const specialty = professional.specialty?.toLowerCase() || "";
        if (!name.includes(searchTerm) && !specialty.includes(searchTerm)) {
          return false;
        }
      }
      if (filters.specialty) {
        const profSpecialty = professional.specialty?.toLowerCase();
        const targetSpecialty = filters.specialty.toLowerCase();
        if (profSpecialty !== targetSpecialty) return false;
      }
      if (filters.modality) {
        const profModality = professional.modality?.toLowerCase();
        const targetModality = filters.modality.toLowerCase();
        if (profModality !== targetModality) return false;
      }
      if (filters.city) {
        const profCity = professional.city?.toLowerCase();
        const targetCity = filters.city.toLowerCase();
        if (profCity !== targetCity) return false;
      }
      return true;
    });
  };

  const filteredProfessionals = getFilteredProfessionals();

  const favoriteProfessionals: Professional[] = [];
  const allProfessionals: Professional[] = [];

  filteredProfessionals.forEach((professional) => {
    const professionalId = professional._id || professional.id;
    if (professionalId && favorites.includes(professionalId)) {
      favoriteProfessionals.push(professional);
    }
    allProfessionals.push(professional);
  });

  const getPageTitle = () => {
    const activeFilters = Object.entries(filters).filter(([_, value]) => value);
    if (activeFilters.length === 0) return "Todos los Profesionales";
    if (filters.specialty) {
      return `${filters.specialty}s${
        filters.city ? ` en ${filters.city}` : ""
      }`;
    }
    if (filters.city) {
      return `Profesionales en ${filters.city}`;
    }
    return `Resultados filtrados (${filteredProfessionals.length})`;
  };

  const getSectionTitle = () => {
    return getPageTitle();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem 0",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "white",
              marginBottom: "1rem",
            }}
          >
            {getPageTitle()}
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "1.1rem" }}>
            {filteredProfessionals.length} profesionales encontrados
          </p>
        </div>

        <FilterBar showAllFilters={true} />

        <div
          style={{
            marginTop: "2rem",
            marginBottom: "3rem",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          {filteredProfessionals.length > 0 && (
            // ✅ MODIFICADO: Usamos el componente correcto que espera una lista.
            <ProfessionalsListMap professionals={filteredProfessionals} />
          )}
        </div>

        {filteredProfessionals.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ color: "white", marginBottom: "1rem" }}>
              No se encontraron profesionales
            </h3>
            <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Intenta ajustar los filtros para encontrar más resultados
            </p>
          </div>
        )}

        {favoriteProfessionals.length > 0 && (
          <div style={{ marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "1.5rem",
              }}
            >
              ⭐ Tus Favoritos
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {favoriteProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional._id || professional.id}
                  professional={professional}
                />
              ))}
            </div>
          </div>
        )}

        {filteredProfessionals.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "1.5rem",
              }}
            >
              {getSectionTitle()}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional._id || professional.id}
                  professional={professional}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link
            to="/"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "25px",
              textDecoration: "none",
              fontSize: "1rem",
            }}
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalsHome;
