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
      <header className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-3 sm:py-4 bg-white/95 backdrop-blur-md gap-4 sm:gap-0">
        <div className="text-2xl sm:text-3xl font-bold text-gray-800">soloclick</div>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center sm:justify-end">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center">
              <UserProfile
                name={user.name || "Usuario"}
                avatarUrl={user.avatarUrl}
              />
              <button
                onClick={handleLogout}
                className="text-red-600 border border-red-600 hover:bg-red-50 px-3 sm:px-4 py-2 rounded text-sm font-medium transition whitespace-nowrap"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-gray-600 border border-gray-600 hover:bg-gray-100 px-3 sm:px-4 py-2 rounded text-sm font-medium transition whitespace-nowrap"
              >
                Registrarse
              </button>
              <button
                onClick={() => navigate("/signin")}
                className="text-gray-600 border border-gray-600 hover:bg-gray-100 px-3 sm:px-4 py-2 rounded text-sm font-medium transition whitespace-nowrap"
              >
                Iniciar sesión
              </button>
            </>
          )}
        </div>
      </header>
      <main className="flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 lg:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 sm:mb-8 lg:mb-12 leading-tight max-w-3xl">
          Reserva servicios como turista
          <br />
          desde cualquier lugar
        </h1>
        <FilterBar isHomePage={true} />
        <div className="text-white text-base sm:text-lg font-medium mt-6 sm:mt-8">
          <span className="font-bold text-lg sm:text-xl">12.050</span> citas
          reservadas hoy
        </div>
      </main>

      {locationFilter.lat && locationFilter.lng && (
        <div className="w-full max-w-6xl mx-auto mb-8 sm:mb-12 px-4 sm:px-6 lg:px-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center">
            Profesionales Cerca de Ti
          </h2>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <ProfessionalsListMap
              professionals={locationFilteredProfessionals}
              selectedLocation={locationFilter}
            />
          </div>
        </div>
      )}

      <div className="w-full bg-gradient-to-b from-purple-600 to-purple-800">
        {isAuthenticated && favoriteProfessionals.length > 0 && (
          <div className="px-4 sm:px-6 py-8 sm:py-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
              Tus Favoritos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
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
          maxItems={3}
          professionals={locationFilteredProfessionals}
          showViewMoreButton={specialtyCounts.Manicura > 4}
          totalSpecialtyCount={specialtyCounts.Manicura}
        />
        <ProfessionalsSpecialtySection
          specialty="Peluquería"
          title="Peluquerías"
          maxItems={3}
          professionals={locationFilteredProfessionals}
          showViewMoreButton={specialtyCounts.Peluqueria > 3}
          totalSpecialtyCount={specialtyCounts.Peluqueria}
        />

        <div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
          <button className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-medium backdrop-blur-md inline-flex items-center gap-2 transition cursor-pointer">
            Obtener la app 📱
          </button>
          <footer className="mt-8 sm:mt-12 text-white/70 text-sm">
            &copy; 2024 soloclick. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
