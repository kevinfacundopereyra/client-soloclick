﻿import { useSearchParams, Link } from "react-router-dom";
import { useProfessionals } from "../hooks/useProfessionals";
import ProfessionalCard from "../components/ProfessionalCard";
import { useFavorites } from "../hooks/useFavorites";
import type { Professional } from "../components/ProfessionalCard";
import FilterBar from "../../components/FilterBar";

// ✅ MODIFICADO: Importamos el mapa correcto, el que está diseñado para mostrar una LISTA.
import ProfessionalsListMap from "../../components/ProfessionalsListMap";

function ProfessionalsHome() {
  const [searchParams] = useSearchParams();
  const sort = searchParams.get("sort") || "";
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
      <div className="px-4 sm:px-6 py-8 sm:py-12 min-h-screen flex items-center justify-center">
        <div className="text-white text-base sm:text-lg">
          Cargando profesionales...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 py-8 sm:py-12 min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800">
        <div className="bg-white/10 text-white px-6 sm:px-8 py-6 sm:py-8 rounded-2xl text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-4">⚠️ Error</h2>
          <p className="text-sm sm:text-base mb-4">
            Error cargando profesionales:{" "}
            {error?.toString() || "Error desconocido"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition cursor-pointer text-sm sm:text-base"
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

  const sortByRating = (list: Professional[], desc = true) =>
    [...list].sort((a, b) =>
      desc
        ? (b.rating ?? 0) - (a.rating ?? 0)
        : (a.rating ?? 0) - (b.rating ?? 0)
    );

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

  const sortedFavorites =
    sort === "rating_asc"
      ? sortByRating(favoriteProfessionals, false)
      : sort === "rating_desc"
      ? sortByRating(favoriteProfessionals, true)
      : favoriteProfessionals;

  const sortedProfessionals =
    sort === "rating_asc"
      ? sortByRating(filteredProfessionals, false)
      : sort === "rating_desc"
      ? sortByRating(filteredProfessionals, true)
      : filteredProfessionals;

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            {getPageTitle()}
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            {filteredProfessionals.length} profesionales encontrados
          </p>
        </div>

       <FilterBar isHomePage={false} />

        {locationFilter.lat && locationFilter.lng && (
          <div className="mt-6 sm:mt-8 mb-8 sm:mb-12 rounded-2xl overflow-hidden shadow-xl">
            {filteredProfessionals.length > 0 && (
              <ProfessionalsListMap
                professionals={filteredProfessionals}
                selectedLocation={locationFilter}
              />
            )}
          </div>
        )}

        {filteredProfessionals.length === 0 && (
          <div className="text-center px-4 sm:px-6 py-8 sm:py-12 bg-white/10 rounded-2xl mb-6 sm:mb-8">
            <h3 className="text-white text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
              No se encontraron profesionales
            </h3>
            <p className="text-white/80 text-sm sm:text-base">
              Intenta ajustar los filtros para encontrar más resultados
            </p>
          </div>
        )}

        {favoriteProfessionals.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
              ⭐ Tus Favoritos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedFavorites.map((professional) => (
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
              {getSectionTitle()}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional._id || professional.id}
                  professional={professional}
                />
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8 sm:mt-12">
          <Link
            to="/"
            className="inline-block bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full no-underline text-sm sm:text-base font-medium transition"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalsHome;
