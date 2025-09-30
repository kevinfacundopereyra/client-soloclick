import React from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

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
  const user = authService.isAuthenticated()
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
    
  if (!user) {
    return (
      <div 
        style={{ 
          padding: "2rem",
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <h2>No has iniciado sesión</h2>
        <button
          onClick={() => navigate('/signin')}
          style={{
            background: "#667eea",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "1rem"
          }}
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

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
            {user.userType === "user" ? "Cliente" : "Profesional"}
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