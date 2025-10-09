import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService"; // ✅ Import correcto
import useFeaturedPayments from "../hooks/useFeaturedPayments";
import paymentMethodsService from "../services/paymentMethodsService";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  userType: "user" | "professional";
  specialty?: string;
  avatarUrl?: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { paymentMethods, featuredPayments, isFeatured, toggleFeatured } = useFeaturedPayments();

  useEffect(() => {
    // ✅ Usar las funciones correctas del authService
    const userData = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();
    
    // LOGS DE DEBUGGING
    console.log('🔍 DEBUGGING ProfilePage:');
    console.log('🔍 isAuthenticated:', isAuth);
    console.log('🔍 userData completo:', userData);
    console.log('🔍 userData.userType:', userData?.userType);
    console.log('🔍 ¿Es professional?:', userData?.userType === 'professional');
    console.log('🔍 localStorage user:', localStorage.getItem('user'));
    console.log('🔍 localStorage token:', localStorage.getItem('token'));
    
    if (!isAuth) {
      console.log('❌ Usuario no autenticado, redirigiendo a login');
      navigate('/login');
      return;
    }
    
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // ✅ Verificar isProfessional con logs adicionales
  const isProfessional = user?.userType === 'professional';
  
  // MÁS LOGS para debugging
  console.log('🔍 Variable isProfessional:', isProfessional);
  console.log('🔍 user en render:', user);
  console.log('🔍 user.userType:', user?.userType);

  if (!user) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontSize: "1.2rem"
      }}>
        Cargando perfil...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem"
      }}
    >
      {/* Header */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "2rem",
        color: "white"
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "1rem"
          }}
        >
          ← Volver
        </button>
        <h1 style={{ color: "white", margin: 0 }}>Mi Perfil</h1>
      </div>

      {/* Profile Card */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "2rem",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* Avatar and Name */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=667eea&color=fff&size=120`}
            alt="avatar"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              marginBottom: "1rem",
              border: "4px solid #667eea"
            }}
          />
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#2d3748" }}>
            {user.name}
          </div>
          <div style={{ 
            color: "#667eea", 
            marginBottom: "1rem",
            fontSize: "1.1rem",
            fontWeight: "500"
          }}>
            {user.userType === "user" ? "Cliente" : 
             user.userType === "professional" ? "Profesional" : 
             `Tipo: ${user.userType}`}
          </div>
        </div>

        {/* User Information */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ 
            display: "grid", 
            gap: "1rem",
            gridTemplateColumns: "1fr"
          }}>
            <div style={{ 
              padding: "1rem",
              background: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #e9ecef"
            }}>
              <strong style={{ color: "#2d3748" }}>Email:</strong> 
              <span style={{ marginLeft: "0.5rem", color: "#4a5568" }}>{user.email}</span>
            </div>
            
            <div style={{ 
              padding: "1rem",
              background: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #e9ecef"
            }}>
              <strong style={{ color: "#2d3748" }}>Tipo de Usuario:</strong> 
              <span style={{ marginLeft: "0.5rem", color: "#4a5568" }}>{user.userType}</span>
            </div>
            
            {user.phone && (
              <div style={{ 
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef"
              }}>
                <strong style={{ color: "#2d3748" }}>Teléfono:</strong> 
                <span style={{ marginLeft: "0.5rem", color: "#4a5568" }}>{user.phone}</span>
              </div>
            )}
            
            {user.city && (
              <div style={{ 
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef"
              }}>
                <strong style={{ color: "#2d3748" }}>Ciudad:</strong> 
                <span style={{ marginLeft: "0.5rem", color: "#4a5568" }}>{user.city}</span>
              </div>
            )}
            
            {user.specialty && (
              <div style={{ 
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef"
              }}>
                <strong style={{ color: "#2d3748" }}>Especialidad:</strong> 
                <span style={{ marginLeft: "0.5rem", color: "#4a5568" }}>{user.specialty}</span>
              </div>
            )}
          </div>
        </div>

        {/* DEBUG INFO - TEMPORAL para ver qué está pasando */}
        <div style={{
          backgroundColor: '#f0f8ff',
          border: '1px solid #4CAF50',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <strong>🔍 Debug Info:</strong><br/>
          userType: {user.userType}<br/>
          isProfessional: {isProfessional ? 'SÍ' : 'NO'}<br/>
          ¿Debería mostrar botón?: {isProfessional ? 'SÍ' : 'NO'}
        </div>

        {/* Services Management Section - Only for Professionals */}
        {isProfessional && (
          <div style={{
            backgroundColor: '#e8f5e8',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '2px solid #4CAF50'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2e7d2e' }}>⚙️ Gestión Profesional</h3>
            <p style={{ color: '#4a5568', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Gestiona tus servicios, precios y disponibilidad
            </p>
            <button
              onClick={() => {
                console.log('🔍 Navegando a /profile/services');
                navigate('/profile/services');
              }}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
            >
              ⚙️ Gestionar Servicios
            </button>
          </div>
        )}

        {/* Si NO es profesional, mostrar mensaje explicativo */}
        {!isProfessional && (
          <div style={{
            backgroundColor: '#f0f8ff',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #667eea'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#667eea' }}>👤 Perfil de Cliente</h3>
            <p style={{ color: '#4a5568', margin: 0 }}>
              Como cliente puedes reservar citas con profesionales y gestionar tus favoritos.
            </p>
          </div>
        )}

        {/* Payment Methods Section */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ 
            color: "#2d3748", 
            marginBottom: "1rem",
            fontSize: "1.3rem",
            fontWeight: "600"
          }}>
            Métodos de Pago
          </h3>
          
          {/* Featured Payments */}
          {featuredPayments.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ 
                color: "#667eea", 
                marginBottom: "0.75rem",
                fontSize: "1rem",
                fontWeight: "500"
              }}>
                ⭐ Destacados ({featuredPayments.length}/3)
              </h4>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {featuredPayments.map((method) => (
                  <div
                    key={method.id}
                    style={{
                      padding: "1rem",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1.2rem" }}>
                        {paymentMethodsService.getPaymentIcon(method.type)}
                      </span>
                      <div>
                        <div style={{ fontWeight: "600" }}>{method.name}</div>
                        {method.isDefault && (
                          <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                            Por defecto
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeatured(method.id)}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        color: "white",
                        padding: "0.5rem",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9rem"
                      }}
                    >
                      ⭐ Quitar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Payment Methods */}
          <h4 style={{ 
            color: "#4a5568", 
            marginBottom: "0.75rem",
            fontSize: "1rem",
            fontWeight: "500"
          }}>
            Todos los métodos
          </h4>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                style={{
                  padding: "1rem",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>
                    {paymentMethodsService.getPaymentIcon(method.type)}
                  </span>
                  <div>
                    <div style={{ fontWeight: "600", color: "#2d3748" }}>
                      {method.name}
                    </div>
                    {method.isDefault && (
                      <div style={{ fontSize: "0.8rem", color: "#667eea" }}>
                        Por defecto
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleFeatured(method.id)}
                  style={{
                    background: isFeatured(method.id) ? "#f59e0b" : "transparent",
                    border: `1px solid ${isFeatured(method.id) ? "#f59e0b" : "#d1d5db"}`,
                    color: isFeatured(method.id) ? "white" : "#4a5568",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "500"
                  }}
                >
                  {isFeatured(method.id) ? "⭐ Destacado" : "☆ Destacar"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ 
          display: "flex", 
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <button
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: 8,
              background: "#e53e3e",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500"
            }}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

