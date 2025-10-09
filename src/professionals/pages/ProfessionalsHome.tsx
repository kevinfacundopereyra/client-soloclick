import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useProfessionals } from "../hooks/useProfessionals";
import ProfessionalCard from "../components/ProfessionalCard";
import { useFavorites } from "../hooks/useFavorites";
import type { Professional } from "../components/ProfessionalCard";

function ProfessionalsHome() {
  const [searchParams] = useSearchParams();
  const { professionals, loading, error } = useProfessionals();
  const { favorites } = useFavorites();
  
  // ✅ Obtener el filtro de especialidad desde la URL
  const specialtyFilter = searchParams.get('specialty');
  
  if (loading) {
    return (
      <div style={{ 
        padding: "2rem", 
        textAlign: "center",
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ fontSize: "1.2rem", color: "#666" }}>
          Cargando profesionales...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ 
        padding: "2rem", 
        textAlign: "center",
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ fontSize: "1.2rem", color: "#e53e3e" }}>
          Error al cargar profesionales
        </div>
      </div>
    );
  }

  // ✅ Filtrar profesionales por especialidad si hay filtro
  let filteredProfessionals = professionals;
  if (specialtyFilter) {
    filteredProfessionals = professionals.filter(professional => {
      const profSpecialty = professional.specialty?.toLowerCase();
      const targetSpecialty = specialtyFilter.toLowerCase();
      return profSpecialty === targetSpecialty;
    });
  }

  // Separar profesionales en favoritos y no favoritos
  const favoriteProfessionals: Professional[] = [];
  const allProfessionals: Professional[] = [];

  filteredProfessionals.forEach(professional => {
    const professionalId = professional._id || professional.id;
    if (professionalId && favorites.includes(professionalId)) {
      favoriteProfessionals.push(professional);
    }
    allProfessionals.push(professional);
  });

  // ✅ Título dinámico según el filtro
  const getPageTitle = () => {
    if (specialtyFilter) {
      switch (specialtyFilter.toLowerCase()) {
        case 'barberia':
          return 'Barberías';
        case 'peluqueria':
          return 'Peluquerías';
        case 'manicura':
          return 'Manicure';
        default:
          return `Profesionales de ${specialtyFilter}`;
      }
    }
    return 'Todos los Profesionales';
  };

  const getSectionTitle = () => {
    if (specialtyFilter) {
      return getPageTitle();
    }
    return 'Todos los Profesionales';
  };

  console.log(`📋 Filtro: ${specialtyFilter || 'ninguno'}, ${favoriteProfessionals.length} favoritos, ${allProfessionals.length} total`);

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem 0"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        
        {/* Header con navegación */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "2rem",
          gap: "1rem"
        }}>
          <Link 
            to="/"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.9rem"
            }}
          >
            ← Volver al inicio
          </Link>
          
          {/* Mostrar filtro activo */}
          {specialtyFilter && (
            <Link 
              to="/professionals"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "rgba(255, 255, 255, 0.8)",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.9rem"
              }}
            >
              Ver todos los profesionales
            </Link>
          )}
        </div>

        {/* Título principal */}
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: "bold", 
          marginBottom: "0.5rem",
          color: "white",
          textAlign: "center"
        }}>
          {getPageTitle()}
        </h1>

        {/* Subtítulo con contador */}
        <div style={{
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.8)",
          marginBottom: "3rem",
          fontSize: "1.1rem"
        }}>
          {allProfessionals.length} profesionales disponibles
          {specialtyFilter && (
            <span style={{ marginLeft: "0.5rem" }}>
              en {getPageTitle()}
            </span>
          )}
        </div>

        {/* Mensaje si no hay resultados */}
        {allProfessionals.length === 0 && (
          <div style={{
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.8)",
            padding: "3rem",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            margin: "2rem 0"
          }}>
            <h3 style={{ color: "white", marginBottom: "1rem" }}>
              No hay profesionales disponibles
            </h3>
            <p style={{ marginBottom: "1.5rem" }}>
              {specialtyFilter 
                ? `No encontramos profesionales de ${getPageTitle()}` 
                : "No hay profesionales registrados en este momento"}
            </p>
            <Link 
              to="/"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "25px",
                textDecoration: "none"
              }}
            >
              Volver al inicio
            </Link>
          </div>
        )}

        {/* Sección de Favoritos - Solo si hay favoritos */}
        {favoriteProfessionals.length > 0 && (
          <div style={{ marginBottom: "3rem" }}>
            <h2 style={{ 
              fontSize: "1.8rem", 
              fontWeight: "bold", 
              marginBottom: "1.5rem",
              color: "white"
            }}>
              ⭐ Tus Favoritos ({favoriteProfessionals.length})
            </h2>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
              gap: "1.5rem" 
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

        {/* Sección principal de profesionales */}
        {allProfessionals.length > 0 && (
          <div>
            <h2 style={{ 
              fontSize: "1.8rem", 
              fontWeight: "bold", 
              marginBottom: "1.5rem",
              color: "white"
            }}>
              {favoriteProfessionals.length > 0 ? 'Otros Profesionales' : getSectionTitle()}
            </h2>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
              gap: "1.5rem" 
            }}>
              {allProfessionals.map((professional) => (
                <ProfessionalCard 
                  key={professional._id || professional.id} 
                  professional={professional} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Filtros rápidos si no hay filtro activo */}
        {!specialtyFilter && allProfessionals.length > 0 && (
          <div style={{
            marginTop: "3rem",
            textAlign: "center"
          }}>
            <h3 style={{ color: "white", marginBottom: "1rem" }}>
              Filtrar por especialidad:
            </h3>
            <div style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
              <Link 
                to="/professionals?specialty=Barberia"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "25px",
                  textDecoration: "none"
                }}
              >
                Barberías
              </Link>
              <Link 
                to="/professionals?specialty=Peluqueria"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "25px",
                  textDecoration: "none"
                }}
              >
                Peluquerías
              </Link>
              <Link 
                to="/professionals?specialty=Manicura"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "25px",
                  textDecoration: "none"
                }}
              >
                Manicure
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfessionalsHome;
