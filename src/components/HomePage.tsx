import { useNavigate, useSearchParams } from "react-router-dom";
import ProfessionalsSpecialtySection from "./ProfessionalsSpecialtySection";
import { useFavorites } from "../professionals/hooks/useFavorites";
import { useProfessionals } from "../professionals/hooks/useProfessionals";
import { authService } from "../services/authService";
import ProfessionalCard from "../professionals/components/ProfessionalCard";
import { useState, useEffect } from "react";
import UserProfile from "./UserProfile";
import FilterBar from "./FilterBar";
import ProfessionalsListMap from "../components/ProfessionalsListMap";

// Tu función haversineDistance no cambia
const haversineDistance = (
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number }
): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Radio de la Tierra en km

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en km
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Tu useEffect de autenticación no cambia
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      console.log("🔍 Verificando autenticación:", authenticated);
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log("🔍 Usuario cargado:", parsedUser);
          setUser(parsedUser);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const { favorites } = useFavorites();
  const { professionals } = useProfessionals();

  // Tu lógica de filtrado por ubicación no cambia
  const locationFilter = {
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng"),
  };
  const locationFilteredProfessionals =
    locationFilter.lat && locationFilter.lng
      ? professionals.filter((prof) => {
          if (!prof.locations || prof.locations.length === 0) return false;

          const userCoords = {
            lat: parseFloat(locationFilter.lat!),
            lng: parseFloat(locationFilter.lng!),
          };

          return prof.locations.some((loc) => {
            const profCoords = { lat: loc.latitude, lng: loc.longitude };
            const distance = haversineDistance(userCoords, profCoords);
            const SEARCH_RADIUS_KM = 10; // Radio de búsqueda: 10km (puedes ajustarlo)
            return distance <= SEARCH_RADIUS_KM;
          });
        })
      : professionals;

  // Tu lógica de `favoriteProfessionals` no cambia
  const favoriteProfessionals = isAuthenticated
    ? locationFilteredProfessionals.filter((professional) => {
        const professionalId = professional._id || professional.id;
        return professionalId && favorites.includes(professionalId);
      })
    : [];

  // Tu lógica de `specialtyCounts` no cambia
  const specialtyCounts = {
    Barberia: professionals.filter((p) => p.specialty === "Barbería").length,
    Manicura: professionals.filter((p) => p.specialty === "Manicura").length,
    Peluqueria: professionals.filter((p) => p.specialty === "Peluquería")
      .length,
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 3rem",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#2d3748" }}
        >
          soloclick
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {isAuthenticated && user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <UserProfile
                name={user.name || "Usuario"}
                role={user.userType || "user"}
                avatarUrl={user.avatarUrl}
              />
              <button
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "1px solid #e53e3e",
                  color: "#e53e3e",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "transparent",
                  border: "1px solid #4a5568",
                  color: "#4a5568",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Registrarse
              </button>
              <button
                onClick={() => navigate("/signin")}
                style={{
                  background: "transparent",
                  border: "1px solid #4a5568",
                  color: "#4a5568",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Iniciar sesión
              </button>
            </>
          )}
        </div>
      </header>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "4rem 2rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            color: "white",
            marginBottom: "3rem",
            lineHeight: "1.2",
            maxWidth: "800px",
          }}
        >
          Reserva servicios como turista
          <br />
          desde cualquier lugar
        </h1>
        <FilterBar isHomePage={true} />
        <div
          style={{
            color: "white",
            fontSize: "1.1rem",
            marginBottom: "4rem",
            fontWeight: "500",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "1.3rem" }}>12.050</span>{" "}
          citas reservadas hoy
        </div>
      </main>

      {locationFilter.lat && locationFilter.lng && (
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto 4rem auto",
            padding: "0 2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: "white",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Profesionales Cerca de Ti
          </h2>
          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <ProfessionalsListMap
              professionals={locationFilteredProfessionals}
              // ✅ MODIFICADO: Le pasamos la ubicación seleccionada al mapa para que sepa dónde centrarse.
              selectedLocation={locationFilter}
            />
          </div>
        </div>
      )}

      <div
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        {isAuthenticated && favoriteProfessionals.length > 0 && (
          <div style={{ padding: "2rem", marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              Tus Favoritos
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "1rem",
                maxWidth: "1200px",
                margin: "0 auto",
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

        <ProfessionalsSpecialtySection
          specialty="Barbería"
          title="Barberías"
          maxItems={3}
          professionals={locationFilteredProfessionals}
          showViewMoreButton={specialtyCounts.Barberia > 3}
          totalSpecialtyCount={specialtyCounts.Barberia}
        />
        <ProfessionalsSpecialtySection
          specialty="Manicura"
          title="Manicure"
          maxItems={4}
          professionals={locationFilteredProfessionals}
          showViewMoreButton={specialtyCounts.Manicura > 4}
          totalSpecialtyCount={specialtyCounts.Manicura}
        />
        <ProfessionalsSpecialtySection
          specialty="Peluquería"
          title="Peluquerías"
          maxItems={4}
          professionals={locationFilteredProfessionals}
          showViewMoreButton={specialtyCounts.Peluqueria > 4}
          totalSpecialtyCount={specialtyCounts.Peluqueria}
        />

        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <button
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "25px",
              fontSize: "1rem",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              margin: "0 auto",
            }}
          >
            Obtener la app 📱
          </button>
          <footer
            style={{
              marginTop: "4rem",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.9rem",
            }}
          >
            &copy; 2024 soloclick. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
