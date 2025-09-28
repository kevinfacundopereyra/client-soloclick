import React from "react";
import authService from "../services/authService";

export interface Professional {
  _id: string;
  name: string;
  specialty: string;
  city: string;
  email: string;
  userType: "user" | "professional";
  avatarUrl?: string;
}

const ProfilePage: React.FC = () => {
  const user = authService.isAuthenticated()
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
  if (!user) {
    return <div style={{ padding: "2rem" }}>No has iniciado sesión.</div>;
  }
  return (
    <div
      style={{
        maxWidth: 500,
        margin: "2rem auto",
        padding: "2rem",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      <h2
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Perfil
      </h2>
      <img
        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
        alt="avatar"
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          marginBottom: "1rem",
        }}
      />
      <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{user.name}</div>
      <div style={{ color: "#888", marginBottom: "1rem" }}>
        {user.userType === "user" ? "Usuario" : "Profesional"}
      </div>
      <div>
        <strong>Email:</strong> {user.email}
      </div>
      {user.city && (
        <div>
          <strong>Ciudad:</strong> {user.city}
        </div>
      )}
      {user.specialty && (
        <div>
          <strong>Especialidad:</strong> {user.specialty}
        </div>
      )}
      <button
        style={{
          marginTop: "2rem",
          padding: "0.5rem 1.5rem",
          borderRadius: 8,
          background: "#2d3748",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => {
          authService.logout();
          window.location.href = "/";
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default ProfilePage;
