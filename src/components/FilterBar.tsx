import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface FilterBarProps {
  onFiltersChange?: (filters: any) => void;
  showAllFilters?: boolean;
  isHomePage?: boolean; // ✅ NUEVO: Para identificar si está en HomePage
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  onFiltersChange, 
  showAllFilters = false, 
  isHomePage = false 
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estados para cada filtro
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    specialty: searchParams.get('specialty') || '',
    modality: searchParams.get('modality') || '',
    city: searchParams.get('city') || '',
    date: searchParams.get('date') || '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (!isHomePage) {
      // Si NO está en HomePage, actualizar URL inmediatamente
      const newSearchParams = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v) newSearchParams.set(k, v);
      });
      
      setSearchParams(newSearchParams);
      onFiltersChange?.(newFilters);
    }
  };

  const handleSearch = () => {
    // Navegar a la página de profesionales con los filtros
    const searchParamsString = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) searchParamsString.set(k, v);
    });
    
    navigate(`/professionals?${searchParamsString.toString()}`);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      specialty: '',
      modality: '',
      city: '',
      date: '',
    };
    setFilters(clearedFilters);
    
    if (!isHomePage) {
      setSearchParams(new URLSearchParams());
      onFiltersChange?.(clearedFilters);
    }
  };

  // ✅ NUEVO: Barra de filtros expandida para HomePage
  if (isHomePage) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "1.5rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          marginBottom: "3rem",
          maxWidth: "1000px",
          width: "100%",
        }}
      >
        {/* Primera fila - Búsqueda principal */}
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "1rem",
          padding: "0.5rem",
          background: "#f7fafc",
          borderRadius: "15px"
        }}>
          <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Busca profesionales, especialidades..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              border: "none",
              outline: "none",
              fontSize: "1rem",
              width: "100%",
              color: "#4a5568",
              background: "transparent"
            }}
          />
        </div>

        {/* Segunda fila - Filtros específicos */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "1rem"
        }}>
          
          {/* Especialidad */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>✂️</span>
            <select
              value={filters.specialty}
              onChange={(e) => handleFilterChange('specialty', e.target.value)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "0.5rem",
                fontSize: "0.9rem",
                width: "100%",
                background: "white"
              }}
            >
              <option value="">Especialidad</option>
              <option value="Barberia">Barbería</option>
              <option value="Peluqueria">Peluquería</option>
              <option value="Manicura">Manicure</option>
              <option value="Masajes">Masajes</option>
              <option value="Estetica">Estética</option>
            </select>
          </div>

          {/* Modalidad */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📍</span>
            <select
              value={filters.modality}
              onChange={(e) => handleFilterChange('modality', e.target.value)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "0.5rem",
                fontSize: "0.9rem",
                width: "100%",
                background: "white"
              }}
            >
              <option value="">Modalidad</option>
              <option value="local">En el local</option>
              <option value="home">A domicilio</option>
              {/* ✅ ELIMINAR: <option value="both">Ambas</option> */}
            </select>
          </div>

          {/* Ciudad */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🌆</span>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "0.5rem",
                fontSize: "0.9rem",
                width: "100%",
                background: "white"
              }}
            >
              <option value="">Ciudad</option>
              <option value="Mendoza">Mendoza</option>
              <option value="Cordoba">Córdoba</option>
              <option value="Buenos Aires">Buenos Aires</option>
              <option value="Rosario">Rosario</option>
              <option value="Cartagena">Cartagena</option>
              <option value="Bucaramanga">Bucaramanga</option>
            </select>
          </div>

          {/* Fecha */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📅</span>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "0.5rem",
                fontSize: "0.9rem",
                width: "100%",
                background: "white"
              }}
            />
          </div>
        </div>

        {/* Tercera fila - Botones de acción y filtros activos */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          
          {/* Filtros activos */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {Object.entries(filters).map(([key, value]) => 
              value && (
                <span
                  key={key}
                  style={{
                    background: "#667eea",
                    color: "white",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "15px",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  {key === 'search' ? '🔍' : 
                   key === 'specialty' ? '✂️' : 
                   key === 'modality' ? '📍' : 
                   key === 'city' ? '🌆' : '📅'}
                  {value}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      marginLeft: "0.25rem",
                      fontSize: "1rem"
                    }}
                  >
                    ×
                  </button>
                </span>
              )
            )}
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={clearFilters}
              style={{
                background: "transparent",
                border: "1px solid #cbd5e0",
                color: "#4a5568",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              Limpiar
            </button>
            
            <button
              onClick={handleSearch}
              style={{
                background: "#2d3748",
                color: "white",
                border: "none",
                padding: "0.75rem 2rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showAllFilters) {
    // Barra de búsqueda simple (no se usa ahora que HomePage usa filtros expandidos)
    return (
      <div
        style={{
          background: "white",
          borderRadius: "50px",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          marginBottom: "3rem",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0.75rem 1.5rem",
            flex: 1,
          }}
        >
          <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Busca profesionales, especialidades..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              border: "none",
              outline: "none",
              fontSize: "1rem",
              width: "100%",
              color: "#4a5568",
            }}
          />
        </div>

        <button
          onClick={handleSearch}
          style={{
            background: "#2d3748",
            color: "white",
            border: "none",
            padding: "1rem 2rem",
            borderRadius: "50px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            marginLeft: "0.5rem",
          }}
        >
          Buscar
        </button>
      </div>
    );
  }

  // Barra de filtros completa para ProfessionalsHome (sin cambios)
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      padding: "1.5rem",
      marginBottom: "2rem",
      border: "1px solid rgba(255, 255, 255, 0.2)"
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        alignItems: "end"
      }}>
        
        {/* Búsqueda por texto */}
        <div>
          <label style={{ 
            display: "block", 
            color: "white", 
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}>
            🔍 Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre, especialidad..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(255, 255, 255, 0.9)",
              fontSize: "0.9rem"
            }}
          />
        </div>

        {/* Filtro por Especialidad/Servicio */}
        <div>
          <label style={{ 
            display: "block", 
            color: "white", 
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}>
            ✂️ Especialidad
          </label>
          <select
            value={filters.specialty}
            onChange={(e) => handleFilterChange('specialty', e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(255, 255, 255, 0.9)",
              fontSize: "0.9rem"
            }}
          >
            <option value="">Todas las especialidades</option>
            <option value="Barberia">💈 Barbería</option>
            <option value="Peluqueria">✂️ Peluquería</option>
            <option value="Manicura">💅 Manicure</option>
            <option value="Masajes">💆 Masajes</option>
            <option value="Estetica">✨ Estética</option>
          </select>
        </div>

        {/* Filtro por Modalidad */}
        <div>
          <label style={{ 
            display: "block", 
            color: "white", 
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}>
            📍 Modalidad
          </label>
          <select
            value={filters.modality}
            onChange={(e) => handleFilterChange('modality', e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(255, 255, 255, 0.9)",
              fontSize: "0.9rem"
            }}
          >
            <option value="">Cualquier modalidad</option>
            <option value="local">🏪 En el local</option>
            <option value="home">🏠 A domicilio</option>
            {/* ✅ ELIMINAR: <option value="ambos">🔄 Ambas opciones</option> */}
          </select>
        </div>

        {/* Filtro por Ciudad */}
        <div>
          <label style={{ 
            display: "block", 
            color: "white", 
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}>
            🌆 Ciudad
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(255, 255, 255, 0.9)",
              fontSize: "0.9rem"
            }}
          >
            <option value="">Cualquier ciudad</option>
            <option value="Bogotá">Bogotá</option>
            <option value="Medellín">Medellín</option>
            <option value="Cali">Cali</option>
            <option value="Barranquilla">Barranquilla</option>
            <option value="Cartagena">Cartagena</option>
            <option value="Bucaramanga">Bucaramanga</option>
          </select>
        </div>

        {/* Filtro por Fecha */}
        <div>
          <label style={{ 
            display: "block", 
            color: "white", 
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}>
            📅 Fecha
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(255, 255, 255, 0.9)",
              fontSize: "0.9rem"
            }}
          />
        </div>

        {/* Botón de limpiar filtros */}
        <div>
          <button
            onClick={clearFilters}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.9rem",
              width: "100%"
            }}
          >
            🗑️ Limpiar filtros
          </button>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {Object.values(filters).some(v => v) && (
        <div style={{
          marginTop: "1rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap"
        }}>
          <span style={{ color: "white", fontSize: "0.9rem", marginRight: "0.5rem" }}>
            Filtros activos:
          </span>
          {Object.entries(filters).map(([key, value]) => 
            value && (
              <span
                key={key}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "15px",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }}
              >
                {key === 'search' ? '🔍' : 
                 key === 'specialty' ? '✂️' : 
                 key === 'modality' ? '📍' : 
                 key === 'city' ? '🌆' : '📅'}
                {value}
                <button
                  onClick={() => handleFilterChange(key, '')}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    marginLeft: "0.25rem",
                    fontSize: "1rem"
                  }}
                >
                  ×
                </button>
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;