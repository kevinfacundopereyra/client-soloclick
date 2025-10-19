import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import LocationPickerMap from "./LocationPickerMap";

const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "600px",
    padding: "2rem",
    borderRadius: "12px",
    border: "none",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
  },
};

Modal.setAppElement("#root");

// ✅ MODIFICADO: Se elimina la prop 'showAllFilters' que no se usa.
interface FilterBarProps {
  onFiltersChange?: (filters: any) => void;
  isHomePage?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onFiltersChange,
  // ✅ MODIFICADO: Se elimina la prop de la desestructuración.
  isHomePage = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    specialty: searchParams.get("specialty") || "",
    modality: searchParams.get("modality") || "",
    city: searchParams.get("city") || "",
    date: searchParams.get("date") || "",
  });

  const [isMapModalOpen, setMapModalOpen] = useState(false);

  const handleLocationSelect = (coords: { lat: number; lng: number }) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("lat", coords.lat.toString());
    newSearchParams.set("lng", coords.lng.toString());
    setSearchParams(newSearchParams);
    localStorage.setItem("selectedUserLocation", JSON.stringify(coords));
    setMapModalOpen(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (!isHomePage) {
      const newSearchParams = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v) newSearchParams.set(k, v);
      });
      setSearchParams(newSearchParams);
      onFiltersChange?.(newFilters);
    }
  };

  const handleSearch = () => {
    const searchParamsString = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) searchParamsString.set(k, v);
    });

    if (searchParams.get("lat") && searchParams.get("lng")) {
      searchParamsString.set("lat", searchParams.get("lat")!);
      searchParamsString.set("lng", searchParams.get("lng")!);
    }

    navigate(`/professionals?${searchParamsString.toString()}`);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      specialty: "",
      modality: "",
      city: "",
      date: "",
    };
    setFilters(clearedFilters);
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
    localStorage.removeItem("selectedUserLocation");
    if (!isHomePage) {
      onFiltersChange?.(clearedFilters);
    }
  };

  const locationIsSet = searchParams.get("lat") && searchParams.get("lng");

  if (isHomePage) {
    return (
      <>
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              padding: "0.5rem",
              background: "#f7fafc",
              borderRadius: "15px",
            }}
          >
            <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Busca profesionales, especialidades..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              style={{
                border: "none",
                outline: "none",
                fontSize: "1rem",
                width: "100%",
                color: "#4a5568",
                background: "transparent",
              }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>✂️</span>
              <select
                value={filters.specialty}
                onChange={(e) =>
                  handleFilterChange("specialty", e.target.value)
                }
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  fontSize: "0.9rem",
                  width: "100%",
                  background: "white",
                }}
              >
                <option value="">Especialidad</option>
                <option value="Barbería">Barbería</option>
                <option value="Peluquería">Peluquería</option>
                <option value="Manicura">Manicure</option>
              </select>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>📍</span>
              <select
                value={filters.modality}
                onChange={(e) => handleFilterChange("modality", e.target.value)}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  fontSize: "0.9rem",
                  width: "100%",
                  background: "white",
                }}
              >
                <option value="">Modalidad</option>
                <option value="local">En el local</option>
                <option value="home">A domicilio</option>
              </select>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>🌆</span>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  fontSize: "0.9rem",
                  width: "100%",
                  background: "white",
                }}
              >
                <option value="">Ciudad</option>
                <option value="Mendoza">Mendoza</option>
                <option value="Cordoba">Córdoba</option>
              </select>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>📅</span>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  fontSize: "0.9rem",
                  width: "100%",
                  background: "white",
                }}
              />
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>🌍</span>
              <button
                onClick={() => setMapModalOpen(true)}
                style={{
                  border: `1px solid ${locationIsSet ? "#6ee7b7" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  padding: "0.5rem",
                  fontSize: "0.9rem",
                  width: "100%",
                  background: locationIsSet ? "#d1fae5" : "white",
                  color: locationIsSet ? "#065f46" : "#4a5568",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: 500,
                }}
              >
                {locationIsSet ? "Ubicación Activa" : "Ubicación"}
              </button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <button
              onClick={clearFilters}
              style={{
                background: "transparent",
                border: "none",
                color: "#4a5568",
                cursor: "pointer",
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
                cursor: "pointer",
              }}
            >
              Buscar
            </button>
          </div>
        </div>
        <Modal
          isOpen={isMapModalOpen}
          onRequestClose={() => setMapModalOpen(false)}
          style={customModalStyles}
          contentLabel="Seleccionar Ubicación"
        >
          <LocationPickerMap onLocationSelect={handleLocationSelect} />
        </Modal>
      </>
    );
  }

  // Tu código para la vista de la página de resultados (`/professionals`)
  // no cambia.
  return (
    <>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                color: "white",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              🔍 Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, especialidad..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.9)",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "white",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              ✂️ Especialidad
            </label>
            <select
              value={filters.specialty}
              onChange={(e) => handleFilterChange("specialty", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.9)",
              }}
            >
              <option value="">Todas</option>
              <option value="Barbería">Barbería</option>
              <option value="Peluquería">Peluquería</option>
              <option value="Manicura">Manicure</option>
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "white",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              📍 Modalidad
            </label>
            <select
              value={filters.modality}
              onChange={(e) => handleFilterChange("modality", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.9)",
              }}
            >
              <option value="">Cualquiera</option>
              <option value="local">En el local</option>
              <option value="home">A domicilio</option>
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "white",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              🌍 Ubicación
            </label>
            <button
              onClick={() => setMapModalOpen(true)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${
                  locationIsSet ? "#6ee7b7" : "rgba(255,255,255,0.3)"
                }`,
                background: locationIsSet ? "#d1fae5" : "rgba(255,255,255,0.9)",
                color: locationIsSet ? "#065f46" : "#4a5568",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: "500",
              }}
            >
              {locationIsSet ? "Activa" : "Seleccionar"}
            </button>
          </div>
          <div>
            <button
              onClick={clearFilters}
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                padding: "0.75rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isMapModalOpen}
        onRequestClose={() => setMapModalOpen(false)}
        style={customModalStyles}
        contentLabel="Seleccionar Ubicación"
      >
        <LocationPickerMap onLocationSelect={handleLocationSelect} />
      </Modal>
    </>
  );
};

export default FilterBar;
