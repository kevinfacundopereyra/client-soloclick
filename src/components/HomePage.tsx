import { useNavigate } from "react-router-dom";
import ProfessionalsSpecialtySection from "./ProfessionalsSpecialtySection";
import UserProfile from "./UserProfile";
import authService from "../services/authService";

const HomePage = () => {
  const navigate = useNavigate();
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
          {/*
            Si el usuario está autenticado y tiene nombre, muestra el perfil arriba a la derecha.
            Si no hay sesión, muestra los botones de registro e inicio de sesión.
          */}
          {authService.isAuthenticated() ? (
            (() => {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              if (user && user.name) {
                // Muestra el perfil con el nombre y tipo (por defecto 'user' si no existe)
                return <UserProfile name={user.name} role={user.userType || 'user'} avatarUrl={user.avatarUrl} />;
              }
              return null;
            })()
          ) : (
            <>
              {/* Botón para registrarse */}
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

        {/* Search Bar */}
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
              borderRight: "1px solid #e2e8f0",
            }}
          >
            <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Busca profesionales, especialidades..."
              style={{
                border: "none",
                outline: "none",
                fontSize: "1rem",
                width: "100%",
                color: "#4a5568",
              }}
            />
          </div>

          {/* <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            flex: 1,
            borderRight: '1px solid #e2e8f0'
          }}>
            <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>📍</span>
            <input
              type="text"
              placeholder="Ubicación actual"
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                width: '100%',
                color: '#4a5568'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            flex: 1,
            borderRight: '1px solid #e2e8f0'
          }}>
            <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>📅</span>
            <input
              type="text"
              placeholder="Cualquier fecha"
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                width: '100%',
                color: '#4a5568'
              }}
            />
          </div>

          <div style={{
           display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            flex: 1
          }}>
            <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>⏰</span>
            <input
              type="text"
              placeholder="En cualquier momento"
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                width: '100%',
                color: '#4a5568'
              }}
            /> 
          </div> */}

          <button
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
        {/* Sección de Barberías */}
        <ProfessionalsSpecialtySection 
          specialty="Barbería"
          title="Barberías"
          maxItems={4}
        />

        {/* Sección de Manicure */}
        <ProfessionalsSpecialtySection 
          specialty="Manicura"
          title="Manicure"
          maxItems={4}
        />

        {/* Sección de Peluquerías */}
        <ProfessionalsSpecialtySection 
          specialty="Peluquería"
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
