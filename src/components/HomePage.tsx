import { useNavigate } from "react-router-dom";
import ProfessionalsSpecialtySection from "./ProfessionalsSpecialtySection";
import { useFavorites } from "../professionals/hooks/useFavorites";
import { useProfessionals } from "../professionals/hooks/useProfessionals";
import ProfessionalCard from "../professionals/components/ProfessionalCard";
import { authService } from "../services/authService";
import { useState, useEffect } from "react";
import UserProfile from "./UserProfile";
import FilterBar from "./FilterBar";

const HomePage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    };
    
    checkAuth();
  }, []);

  // Solo cargar favoritos si el usuario está autenticado
  const { favorites } = useFavorites();
  const { professionals } = useProfessionals();

  // Filtrar solo los profesionales favoritos
  const favoriteProfessionals = isAuthenticated ? professionals.filter(professional => {
    const professionalId = professional._id || professional.id;
    return professionalId && favorites.includes(professionalId);
  }) : [];

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
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
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "#2d3748",
          }}
        >
          soloclick
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

          {isAuthenticated && user ? (
            // Usuario autenticado - mostrar perfil usando UserProfile component
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <UserProfile 
                name={user.name || 'Usuario'} 
                role={user.userType || 'user'} 
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
            // Usuario no autenticado - mostrar botones de login
            <>
              <button
                onClick={() => navigate('/login')}
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

              {/* Botón para iniciar sesión */}
              <button
                onClick={() => navigate('/signin')}
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

      {/* Main Content */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "4rem 2rem",
          textAlign: "center",
        }}
      >
        {/* Main Title */}
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

        {/* ✅ USAR: FilterBar con filtros expandidos */}
        <FilterBar isHomePage={true} />

        {/* Stats */}
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

      {/* Professional Sections */}
      <div style={{ 
        width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        {/* Sección de Favoritos - Solo aparece si hay favoritos y está autenticado */}
        {isAuthenticated && favoriteProfessionals.length > 0 && (
          <div style={{ 
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Tus Favoritos
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '1rem',
              maxWidth: '1200px',
              margin: '0 auto'
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

        {/* Sección de Barberías */}
        <ProfessionalsSpecialtySection 
          specialty="Barberia"
          title="Barberías"
          maxItems={3}
        />

        {/* Sección de Manicure */}
        <ProfessionalsSpecialtySection 
          specialty="Manicura"
          title="Manicure"
          maxItems={4}
        />

        {/* Sección de Peluquerías */}
        <ProfessionalsSpecialtySection 
          specialty="Peluqueria"
          title="Peluquerías"
          maxItems={4}
        />

        {/* Footer Section */}
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          {/* App Download */}
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
              margin: "0 auto"
            }}
          >
            Obtener la app 📱
          </button>
          
          {/* Footer Note */}
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
