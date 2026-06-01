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

  const locationFilter = {
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng"),
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

  // 1. Limpia mayúsculas y tildes
const normalizeText = (text?: string) => {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// 2. Calcula cuántos errores tipográficos hay entre dos palabras (Distancia de Levenshtein)
const getEditDistance = (a: string, b: string) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Sustitución
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // Inserción o eliminación
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// 3. Verifica si hay coincidencia tolerando hasta 2 errores de tipeo
const isFuzzyMatch = (search: string, text: string) => {
  if (!search || !text) return false;
  if (text.includes(search)) return true; // Si es coincidencia parcial exacta, pasa rápido

  const textWords = text.split(" ");
  
  // Si la búsqueda es muy corta (ej: "li"), no toleramos errores para evitar resultados basura.
  // Si tiene 4 o más letras, toleramos hasta 2 errores (ej: "pardes" vs "paredes" = 1 error).
  const allowedErrors = search.length < 4 ? 0 : 2;

  return textWords.some(word => getEditDistance(search, word) <= allowedErrors);
};

const getFilteredProfessionals = () => {
    return professionals.filter((professional) => {
      // 1. Filtro de búsqueda general con tolerancia a errores tipográficos
      if (filters.search) {
        const searchTerm = normalizeText(filters.search);
        const name = normalizeText(professional.name);
        const specialty = normalizeText(professional.specialty);
        
        // Usamos isFuzzyMatch en lugar de includes()
        if (!isFuzzyMatch(searchTerm, name) && !isFuzzyMatch(searchTerm, specialty)) {
          return false;
        }
      }

      // ... el resto de tus filtros (specialty, modality, city) quedan exactamente igual ...
      if (filters.specialty) {
        const profSpecialty = normalizeText(professional.specialty);
        const targetSpecialty = normalizeText(filters.specialty);
        if (!profSpecialty.includes(targetSpecialty)) return false;
      }
      if (filters.modality) {
        const profModality = normalizeText(professional.modality);
        const targetModality = normalizeText(filters.modality);
        if (!profModality.includes(targetModality)) return false;
      }
      if (filters.city) {
        const profCity = normalizeText(professional.city);
        const targetCity = normalizeText(filters.city);
        if (!profCity.includes(targetCity)) return false;
      }
      return true;
    });
  };
/*   const getFilteredProfessionals = () => {
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
  }; */

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

       <FilterBar isHomePage={false} />

        {locationFilter.lat && locationFilter.lng && (
          <div
            style={{
              marginTop: "2rem",
              marginBottom: "3rem",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* ✅ MODIFICADO: Usamos el componente correcto que espera una lista. */}
            {filteredProfessionals.length > 0 && (
              <ProfessionalsListMap
                  professionals={filteredProfessionals}
                  selectedLocation={locationFilter}
                />
            )}
        </div>
        )}

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
